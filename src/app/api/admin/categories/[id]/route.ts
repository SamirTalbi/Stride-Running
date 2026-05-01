import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      slug: body.slug?.trim(),
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      parentId: body.parentId || null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive,
    },
  });
  return NextResponse.json({ data: category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
