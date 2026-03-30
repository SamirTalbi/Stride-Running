// GET — Liste tous les POs | POST — Créer un PO
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendPurchaseOrderEmail } from "@/lib/email";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

function generatePoNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PO-${y}${m}${d}-${rand}`;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [total, pos] = await Promise.all([
    prisma.purchaseOrder.count(),
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: true },
    }),
  ]);

  return NextResponse.json({ data: pos, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items, notes, sendEmail, supplierEmail } = body as {
    items: {
      productId: string;
      variantId: string;
      productName: string;
      sku?: string;
      size: string;
      color: string;
      colorHex?: string;
      imageUrl?: string;
      quantity: number;
      orderIds: string[];
    }[];
    notes?: string;
    sendEmail?: boolean;
    supplierEmail?: string;
  };

  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: generatePoNumber(),
      notes: notes ?? null,
      status: "DRAFT",
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          sku: item.sku ?? null,
          size: item.size,
          color: item.color,
          colorHex: item.colorHex ?? null,
          imageUrl: item.imageUrl ?? null,
          quantity: item.quantity,
          orderIds: item.orderIds,
        })),
      },
    },
    include: { items: true },
  });

  // Passer les commandes en PROCESSING
  const allOrderIds = [...new Set(items.flatMap((i) => i.orderIds))];
  await prisma.order.updateMany({
    where: { id: { in: allOrderIds } },
    data: { status: "PROCESSING" },
  });

  // Envoyer l'email si demandé
  if (sendEmail && supplierEmail) {
    const date = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    // Récupérer les adresses de livraison des commandes concernées
    const orders = await prisma.order.findMany({
      where: { id: { in: allOrderIds } },
      include: { shippingAddress: true },
    });

    const deliveries = orders.map((o) => ({
      orderNumber: o.orderNumber,
      address: o.shippingAddress ? {
        firstName: o.shippingAddress.firstName,
        lastName:  o.shippingAddress.lastName,
        address1:  o.shippingAddress.address1,
        address2:  o.shippingAddress.address2 ?? undefined,
        city:      o.shippingAddress.city,
        zip:       o.shippingAddress.zip,
        country:   o.shippingAddress.country,
        phone:     o.shippingAddress.phone ?? undefined,
      } : null,
    }));

    await sendPurchaseOrderEmail({
      to: supplierEmail,
      poNumber: po.poNumber,
      date,
      notes,
      items: po.items.map((i) => ({
        imageUrl:    i.imageUrl ?? undefined,
        productName: i.productName,
        sku:         i.sku ?? undefined,
        size:        i.size,
        color:       i.color,
        colorHex:    i.colorHex ?? undefined,
        quantity:    i.quantity,
      })),
      deliveries,
    });

    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  return NextResponse.json({ data: po }, { status: 201 });
}
