import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Homme — Chaussures, Vêtements & Accessoires",
  description: "Toute la collection Homme : chaussures running, ensembles, vestes, t-shirts. Nike, Brooks, HOKA & plus. Livraison gratuite dès 75 €.",
  alternates: { canonical: "/men" },
};

async function getMenProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      gender: { in: ["MEN", "UNISEX"] },
      NOT: { categories: { some: { category: { OR: [{ slug: "accessories" }, { parent: { slug: "accessories" } }] } } } },
    },
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { size: "asc" } },
      categories: { include: { category: true } },
    },
  });
}

export default async function MenPage() {
  const products = await getMenProducts();

  return (
    <>
      <div className="bg-dark-DEFAULT text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-2">Collection Homme</p>
          <h1 className="font-display font-black text-5xl text-white">Homme</h1>
          <p className="text-gray-400 mt-2 max-w-lg">
            Chaussures, ensembles, vêtements & accessoires. La sélection complète pour entraînement, course et lifestyle.
          </p>
        </div>
      </div>
      <ProductGrid
        products={products as unknown as any[]}
        showFilters={true}
        hidePriceFilter
        hideSizeFilter
        hideBrandFilter
        hideColorFilter
      />
    </>
  );
}
