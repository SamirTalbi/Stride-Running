import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      slug: body.slug?.trim(),
      description: body.description || null,
      logoUrl: body.logoUrl || null,
      isActive: body.isActive,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ data: brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
