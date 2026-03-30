// GET — Agrège les commandes CONFIRMED non encore dans un PO, groupées par variant
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  // date facultative, défaut = aujourd'hui
  const dateParam = searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();
  day.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  // Commandes CONFIRMED ou PROCESSING du jour, sans PO déjà générés
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "PROCESSING"] },
      paymentStatus: "PAID",
      createdAt: { gte: day, lte: dayEnd },
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
          variant: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Agrégation par variantId
  const variantMap = new Map<
    string,
    {
      variantId: string;
      productId: string;
      productName: string;
      sku: string | null;
      size: string;
      color: string;
      colorHex: string | null;
      imageUrl: string | null;
      quantity: number;
      orderIds: string[];
      orderNumbers: string[];
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.variantId;
      const existing = variantMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.orderIds.push(order.id);
        existing.orderNumbers.push(order.orderNumber);
      } else {
        variantMap.set(key, {
          variantId: item.variantId,
          productId: item.productId,
          productName: item.name,
          sku: item.product.sku ?? null,
          size: item.size,
          color: item.color,
          colorHex: item.variant.colorHex ?? null,
          imageUrl: item.product.images[0]?.url ?? item.imageUrl ?? null,
          quantity: item.quantity,
          orderIds: [order.id],
          orderNumbers: [order.orderNumber],
        });
      }
    }
  }

  return NextResponse.json({
    date: day.toISOString(),
    orderCount: orders.length,
    items: Array.from(variantMap.values()),
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      email: o.email,
      status: o.status,
      total: o.total,
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      shippingAddress: o.shippingAddress,
      createdAt: o.createdAt,
    })),
  });
}
