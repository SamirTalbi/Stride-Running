import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "10");

  if (!query.trim()) {
    return NextResponse.json({ data: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { name: { contains: query, mode: "insensitive" } } },
          { searchKeywords: { hasSome: query.split(" ").filter(Boolean) } },
        ],
      },
      include: {
        brand: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: { where: { isActive: true }, take: 1, orderBy: { price: "asc" } },
      },
      take: limit,
      orderBy: [{ isBestSeller: "desc" }, { reviewCount: "desc" }],
    });

    const results = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand?.name,
      price: p.variants[0]?.price,
      image: p.images[0]?.url,
      avgRating: p.avgRating,
    }));

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("[Search API]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
