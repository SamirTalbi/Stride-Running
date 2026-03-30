import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const createOrderSchema = z.object({
  email: z.string().email(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number().min(1),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
  couponCode: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // Fetch variants with product info
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });

    // Vérifier que les variantes existent
    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 });
      }
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      return sum + (variant?.price ?? 0) * item.quantity;
    }, 0);

    // Apply coupon
    let discount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode, isActive: true },
      });
      if (coupon) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
          if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
            discount = coupon.type === "PERCENTAGE"
              ? subtotal * (coupon.value / 100)
              : coupon.value;
          }
        }
      }
    }

    const shipping = subtotal >= 75 ? 0 : 9.99;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;

    // Create address
    const address = await prisma.address.create({
      data: {
        ...data.shippingAddress,
        userId: undefined, // anonymous order
        isDefault: false,
      } as Parameters<typeof prisma.address.create>[0]["data"],
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        email: data.email,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponCode: data.couponCode,
        shippingAddressId: address.id,
        stripePaymentId: data.paymentIntentId,
        paymentStatus: data.paymentIntentId ? "PAID" : "PENDING",
        status: "CONFIRMED",
        items: {
          create: data.items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            const image = variant.product.images[0]?.url;
            return {
              productId: item.productId,
              variantId: item.variantId,
              name: variant.product.name,
              size: variant.size,
              color: variant.color,
              imageUrl: image,
              price: variant.price,
              quantity: item.quantity,
              total: variant.price * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    await Promise.all(
      data.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Email de confirmation au client
    try {
      await sendOrderConfirmationEmail({
        to: data.email,
        firstName: data.shippingAddress.firstName,
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.name,
          size: i.size,
          color: i.color,
          imageUrl: i.imageUrl ?? undefined,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        shippingCost: shipping,
        total,
        shippingAddress: data.shippingAddress,
      });
    } catch (emailError) {
      console.error("[Order confirmation email]", emailError);
      // Ne pas bloquer la réponse si l'email échoue
    }

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("[Orders API]", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, shippingAddress: true },
      });
      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data: order });
    }

    if (userId) {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: { take: 3 } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: orders });
    }

    const email = searchParams.get("email");
    if (email) {
      const orders = await prisma.order.findMany({
        where: { email },
        include: { items: { take: 3 } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: orders });
    }

    return NextResponse.json({ error: "Missing userId, email or orderNumber" }, { status: 400 });
  } catch (error) {
    console.error("[Orders GET API]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
