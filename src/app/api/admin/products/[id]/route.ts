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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { variants, images, categoryIds, ...productData } = body;

  try {
    // Update product and replace categories
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        categories: categoryIds !== undefined
          ? {
              deleteMany: {},
              create: categoryIds.map((cid: string) => ({ categoryId: cid })),
            }
          : undefined,
      },
    });

    // Replace variants if provided
    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v: Record<string, unknown>) => ({ ...v, productId: id })),
        });
      }
    }

    // Replace images if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: Record<string, unknown>) => ({ ...img, productId: id })),
        });
      }
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[Admin Products PUT]", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
