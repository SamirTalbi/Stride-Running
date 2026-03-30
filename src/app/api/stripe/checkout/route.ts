import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
  })),
  successUrl: z.string(),
  cancelUrl: z.string(),
  couponCode: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const lineItems = data.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer_email: data.customerEmail,
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Free Shipping",
            delivery_estimate: { minimum: { unit: "business_day", value: 5 }, maximum: { unit: "business_day", value: 7 } },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1299, currency: "usd" },
            display_name: "Express Shipping",
            delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 3 } },
          },
        },
      ],
      metadata: {
        source: "stride_running",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[Stripe Checkout]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
