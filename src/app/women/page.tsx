import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Femme — Chaussures, Vêtements & Accessoires",
  description: "Toute la collection Femme : chaussures running, ensembles, leggings, brassières. Brooks, HOKA, Asics & plus. Livraison gratuite dès 75 €.",
};

async function getWomenProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      gender: { in: ["WOMEN", "UNISEX"] },
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

export default async function WomenPage() {
  const products = await getWomenProducts();

  return (
    <>
      <div className="bg-gradient-to-r from-purple-900 to-dark-DEFAULT text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-widest mb-2">Collection Femme</p>
          <h1 className="font-display font-black text-5xl text-white">Femme</h1>
          <p className="text-white/60 mt-2 max-w-lg">
            Chaussures, ensembles, leggings & accessoires. La sélection complète pour entraînement, course et lifestyle.
          </p>
        </div>
      </div>
      <ProductGrid
        products={products as unknown as any[]}
        showFilters
        hidePriceFilter
        hideSizeFilter
        hideBrandFilter
        hideColorFilter
      />
    </>
  );
}
