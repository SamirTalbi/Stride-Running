import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json({ data: categories });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug: body.slug?.trim() || slugify(body.name),
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        parentId: body.parentId || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }
}
