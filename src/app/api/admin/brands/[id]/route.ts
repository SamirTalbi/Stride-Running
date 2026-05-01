import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


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
