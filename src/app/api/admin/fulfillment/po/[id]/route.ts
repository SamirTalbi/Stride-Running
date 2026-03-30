// GET — Détail d'un PO | PUT — Changer statut | DELETE — Supprimer
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: po });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { status, notes, sendEmail, supplierEmail } = body;

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(status === "SENT" && { sentAt: new Date() }),
      // Si reçu → passer les commandes en attente d'expédition
    },
    include: { items: true },
  });

  // Si marqué RECEIVED → les commandes passent en PROCESSING (prêt à expédier)
  if (status === "RECEIVED") {
    const allOrderIds = [...new Set(po.items.flatMap((i) => i.orderIds))];
    await prisma.order.updateMany({
      where: { id: { in: allOrderIds }, status: "PROCESSING" },
      data: { status: "PROCESSING" }, // déjà PROCESSING, l'admin gère l'expédition
    });
  }

  // Renvoyer l'email si demandé
  if (sendEmail && supplierEmail) {
    const date = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    await sendPurchaseOrderEmail({
      to: supplierEmail,
      poNumber: po.poNumber,
      date,
      notes: po.notes ?? undefined,
      items: po.items.map((i) => ({
        imageUrl: i.imageUrl ?? undefined,
        productName: i.productName,
        sku: i.sku ?? undefined,
        size: i.size,
        color: i.color,
        colorHex: i.colorHex ?? undefined,
        quantity: i.quantity,
      })),
    });
    await prisma.purchaseOrder.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
  }

  return NextResponse.json({ data: po });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.purchaseOrder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
