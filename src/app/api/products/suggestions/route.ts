import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // IDs already in cart — exclude them
  const excludeParam = searchParams.get("exclude") ?? "";
  const exclude = excludeParam ? excludeParam.split(",") : [];

  // Gender hint from cart (MEN / WOMEN / UNISEX)
  const gender = searchParams.get("gender"); // optional

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: exclude },
      ...(gender ? { gender: { in: [gender as "MEN" | "WOMEN" | "UNISEX", "UNISEX"] } } : {}),
    },
    orderBy: [{ isBestSeller: "desc" }, { reviewCount: "desc" }],
    take: 3,
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true, stock: { gt: 0 } }, orderBy: { price: "asc" }, take: 1 },
    },
  });

  return NextResponse.json(products);
}
