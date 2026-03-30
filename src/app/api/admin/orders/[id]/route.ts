import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: { select: { size: true, color: true } },
        },
      },
      user: { select: { firstName: true, lastName: true, email: true } },
      shippingAddress: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, trackingNumber, trackingUrl } = await req.json();

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) data.trackingUrl = trackingUrl;
  if (status === "SHIPPED") data.shippedAt = new Date();
  if (status === "DELIVERED") data.deliveredAt = new Date();

  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json({ data: order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // OrderItems se suppriment en cascade (onDelete: Cascade dans le schéma)
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
