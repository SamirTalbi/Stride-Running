import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import BestSellersTabs from "./BestSellersTabs";

async function getBestSellers() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isBestSeller: "desc" }, { reviewCount: "desc" }],
    take: 16,
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { size: "asc" } },
      categories: { include: { category: true } },
    },
  });
}

export async function BestSellers() {
  const products = await getBestSellers();

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Most Popular</p>
            <h2 className="font-display font-black text-display-md text-gray-900">Best Sellers</h2>
          </div>
          <Link href="/best-sellers" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-500 transition-colors self-start sm:self-auto">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {/* @ts-expect-error Prisma type vs Product type */}
        <BestSellersTabs products={products} />
      </div>
    </section>
  );
}
