import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

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
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await prisma.order.updateMany({
          where: { stripePaymentId: session.payment_intent as string },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });
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
    console.error("[Webhook] Handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
