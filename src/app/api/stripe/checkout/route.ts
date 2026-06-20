import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    zip: z.string(),
    country: z.string().default("FR"),
    phone: z.string().optional(),
  }),
  couponCode: z.string().optional(),
});

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_PRICE = 9.99;

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    // Prix faisant autorité : on relit toujours en base, jamais le client.
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });

    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variante ${item.variantId} introuvable` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${variant.product.name}` }, { status: 400 });
      }
    }

    const subtotal = data.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.price * item.quantity;
    }, 0);

    // Coupon
    let discount = 0;
    let freeShipping = false;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode, isActive: true },
      });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (coupon.type === "PERCENTAGE") discount = subtotal * (coupon.value / 100);
          else if (coupon.type === "FIXED") discount = coupon.value;
          else if (coupon.type === "FREE_SHIPPING") freeShipping = true;
        }
      }
    }
    discount = Math.min(discount, subtotal);

    const shipping = freeShipping || subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
    // Prix TTC (TVA incluse, conforme B2C France) : pas de taxe ajoutée par-dessus.
    const total = subtotal - discount + shipping;

    // Adresse de livraison
    const address = await prisma.address.create({
      data: {
        firstName: data.shippingAddress.firstName,
        lastName: data.shippingAddress.lastName,
        address1: data.shippingAddress.address1,
        address2: data.shippingAddress.address2,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state ?? "",
        zip: data.shippingAddress.zip,
        country: data.shippingAddress.country,
        phone: data.shippingAddress.phone,
        isDefault: false,
      },
    });

    // Commande en attente de paiement — le webhook la confirmera.
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        email: data.email,
        subtotal,
        discount,
        shipping,
        tax: 0,
        total,
        couponCode: data.couponCode,
        shippingAddressId: address.id,
        paymentStatus: "PENDING",
        status: "PENDING",
        items: {
          create: data.items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return {
              productId: item.productId,
              variantId: item.variantId,
              name: variant.product.name,
              size: variant.size,
              color: variant.color,
              imageUrl: variant.product.images[0]?.url,
              price: variant.price,
              quantity: item.quantity,
              total: variant.price * item.quantity,
            };
          }),
        },
      },
    });

    // Lignes Stripe
    const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const image = variant.product.images[0]?.url;
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: variant.product.name,
            description: `Taille ${variant.size} · ${variant.color}`,
            images: image && image.startsWith("http") ? [image] : [],
          },
          unit_amount: Math.round(variant.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Remise -> coupon Stripe ponctuel
    const discounts: import("stripe").Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: data.couponCode ?? "Remise",
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts,
      customer_email: data.email,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?canceled=1`,
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: Math.round(shipping * 100), currency: "eur" },
                  display_name: "Livraison internationale",
                  delivery_estimate: {
                    minimum: { unit: "business_day", value: 15 },
                    maximum: { unit: "business_day", value: 25 },
                  },
                },
              },
            ]
          : undefined,
      client_reference_id: order.orderNumber,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
    });

    return NextResponse.json({ url: session.url, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 500 });
  }
}
