import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break;

        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.warn("[webhook] checkout.session.completed sans orderId");
          break;
        }

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true, shippingAddress: true },
        });
        if (!order) {
          console.warn(`[webhook] commande ${orderId} introuvable`);
          break;
        }

        // Idempotence : Stripe peut rejouer l'évènement. On ne traite qu'une fois.
        if (order.paymentStatus === "PAID") break;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            stripePaymentId: (session.payment_intent as string) ?? undefined,
          },
        });

        // Décrément du stock une fois le paiement confirmé.
        await Promise.all(
          order.items
            .filter((i) => i.variantId)
            .map((i) =>
              prisma.productVariant.update({
                where: { id: i.variantId! },
                data: { stock: { decrement: i.quantity } },
              })
            )
        );

        // Email de confirmation — fiable car déclenché par Stripe, pas par le navigateur.
        try {
          await sendOrderConfirmationEmail({
            to: order.email,
            firstName: order.shippingAddress?.firstName ?? order.email.split("@")[0],
            orderNumber: order.orderNumber,
            items: order.items.map((i) => ({
              name: i.name,
              size: i.size,
              color: i.color,
              imageUrl: i.imageUrl ?? undefined,
              quantity: i.quantity,
              price: i.price,
            })),
            subtotal: order.subtotal,
            shippingCost: order.shipping,
            total: order.total,
            shippingAddress: {
              firstName: order.shippingAddress?.firstName ?? "",
              lastName: order.shippingAddress?.lastName ?? "",
              address1: order.shippingAddress?.address1 ?? "",
              address2: order.shippingAddress?.address2 ?? undefined,
              city: order.shippingAddress?.city ?? "",
              zip: order.shippingAddress?.zip ?? "",
              country: order.shippingAddress?.country ?? "",
            },
          });
        } catch (emailErr) {
          console.error(`[webhook] échec email confirmation commande ${order.orderNumber}`, emailErr);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: { stripePaymentId: pi.id },
          data: { paymentStatus: "FAILED" },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await prisma.order.updateMany({
          where: { stripePaymentId: charge.payment_intent as string },
          data: {
            paymentStatus: charge.amount_refunded === charge.amount ? "REFUNDED" : "PARTIALLY_REFUNDED",
            status: charge.amount_refunded === charge.amount ? "REFUNDED" : "CONFIRMED",
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] handler failed", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
