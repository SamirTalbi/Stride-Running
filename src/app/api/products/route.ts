import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductFilters, SortOption } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const sort = (searchParams.get("sort") ?? "best-sellers") as SortOption;
    const gender = searchParams.getAll("gender");
    const terrain = searchParams.getAll("terrain");
    const brand = searchParams.getAll("brand");
    const size = searchParams.getAll("size");
    const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined;
    const cushionLevel = searchParams.getAll("cushionLevel");
    const inStock = searchParams.get("inStock") === "true";
    const isNewArrival = searchParams.get("isNewArrival") === "true";
    const isBestSeller = searchParams.get("isBestSeller") === "true";
    const search = searchParams.get("q");

    const ids = searchParams.get("ids")?.split(",").filter(Boolean);

    // If specific IDs requested (wishlist), return those directly
    if (ids && ids.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: ids }, isActive: true },
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { isActive: true }, orderBy: { size: "asc" } },
          categories: { include: { category: true } },
        },
      });
      return NextResponse.json({ data: products, total: products.length });
    }

    const where: Record<string, unknown> = {
      isActive: true,
      ...(gender.length > 0 && { gender: { in: gender } }),
      ...(terrain.length > 0 && { terrain: { in: terrain } }),
      ...(cushionLevel.length > 0 && { cushionLevel: { in: cushionLevel } }),
      ...(isNewArrival && { isNewArrival: true }),
      ...(isBestSeller && { isBestSeller: true }),
      ...(brand.length > 0 && { brand: { slug: { in: brand } } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { searchKeywords: { hasSome: [search] } },
        ],
      }),
      ...((priceMin !== undefined || priceMax !== undefined || size.length > 0 || inStock) && {
        variants: {
          some: {
            isActive: true,
            ...(priceMin !== undefined && { price: { gte: priceMin } }),
            ...(priceMax !== undefined && { price: { lte: priceMax } }),
            ...(size.length > 0 && { size: { in: size } }),
            ...(inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    const orderBy: Record<string, unknown>[] = [];
    switch (sort) {
      case "top-rated":
        orderBy.push({ avgRating: "desc" });
        break;
      case "new-arrivals":
        orderBy.push({ createdAt: "desc" });
        break;
      case "name-asc":
        orderBy.push({ name: "asc" });
        break;
      default:
        orderBy.push({ isBestSeller: "desc" }, { reviewCount: "desc" });
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { isActive: true }, orderBy: { size: "asc" } },
          categories: { include: { category: true } },
        },
      }),
    ]);

    // Apply price sort after query (needs variant data)
    let sorted = products;
    if (sort === "price-asc" || sort === "price-desc") {
      sorted = products.sort((a, b) => {
        const priceA = Math.min(...a.variants.map((v) => v.price));
        const priceB = Math.min(...b.variants.map((v) => v.price));
        return sort === "price-asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return NextResponse.json({
      data: sorted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[Products API]", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
