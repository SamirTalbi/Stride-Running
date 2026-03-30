import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentSlug = searchParams.get("parentSlug");

  const where = parentSlug
    ? { isActive: true, parent: { slug: parentSlug } }
    : { isActive: true };

  const categories = await prisma.category.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: { where: { product: { isActive: true } } } } },
    },
  });
  return NextResponse.json({ data: categories });
}
