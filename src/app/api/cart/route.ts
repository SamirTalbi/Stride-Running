import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1).max(10),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");

  if (!sessionId && !userId) {
    return NextResponse.json({ data: { items: [] } });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ data: cart ?? { items: [] } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity, sessionId, userId } = addItemSchema.parse(body);

    // Check stock
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, sessionId },
      });
    }

    // Check if item already in cart
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId, quantity },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("itemId");

    if (!cartItemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
