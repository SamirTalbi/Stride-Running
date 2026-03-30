import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Soldes Chaussures Running — Jusqu'à -50%",
  description: "Profitez des meilleures offres sur les chaussures de running. Jusqu'à -50% sur Nike, Brooks, HOKA, Asics & plus. Offres limitées.",
};

async function getSaleProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      variants: { some: { isActive: true, comparePrice: { not: null } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { size: "asc" } },
      categories: { include: { category: true } },
    },
  });
}

export default async function SalePage() {
  const products = await getSaleProducts();

  return (
    <>
      <div className="bg-red-600 text-white py-12 px-4 lg:px-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)" }}
        />
        <div className="relative max-w-[1440px] mx-auto">
          <p className="text-sm font-semibold text-red-200 uppercase tracking-widest mb-2">Offres limitées</p>
          <h1 className="font-display font-black text-5xl text-white mb-2">Jusqu&apos;à -50%</h1>
          <p className="text-red-200 text-lg">Les meilleures marques de running à prix réduit — pour une durée limitée.</p>
        </div>
      </div>
      {/* @ts-expect-error Prisma type vs Product type */}
      <ProductGrid products={products} showFilters />
    </>
  );
}
