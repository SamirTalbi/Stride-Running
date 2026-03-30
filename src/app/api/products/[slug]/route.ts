import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { size: "asc" } },
        categories: { include: { category: { select: { name: true, slug: true } } } },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[Product API]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
