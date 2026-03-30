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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("q") ?? "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brand: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { where: { isActive: true }, select: { price: true, stock: true } },
        categories: { include: { category: { select: { name: true } } } },
      },
    }),
  ]);

  return NextResponse.json({ data: products, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { variants, images, categoryIds, ...productData } = body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants?.length
          ? { create: variants }
          : undefined,
        images: images?.length
          ? { create: images }
          : undefined,
        categories: categoryIds?.length
          ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
          : undefined,
      },
      include: {
        brand: true,
        variants: true,
        images: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("[Admin Products POST]", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
