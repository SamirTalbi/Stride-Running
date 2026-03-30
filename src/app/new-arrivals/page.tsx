import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nouveautés — Dernières Chaussures & Équipements Running",
  description: "Découvrez les toutes dernières chaussures et équipements running. Soyez le premier à courir avec les nouvelles sorties.",
};

async function getNewArrivals() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      isNewArrival: true,
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

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <>
      <div className="bg-dark-DEFAULT text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft" />
            <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest">Vient d&apos;arriver</p>
          </div>
          <h1 className="font-display font-black text-5xl text-white">Nouveautés</h1>
          <p className="text-gray-400 mt-2">Les dernières chaussures de running et équipements, tout juste arrivés.</p>
        </div>
      </div>
      {/* @ts-expect-error Prisma type vs Product type */}
      <ProductGrid products={products} showFilters />
    </>
  );
}
