import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Chaussures de Running Femme",
  description: "Chaussures de running femme. Brooks, HOKA, Asics & plus. Sélection experte avec livraison gratuite dès 75 €.",
};

async function getWomenProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      gender: "WOMEN",
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
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-widest mb-2">Femme</p>
          <h1 className="font-display font-black text-5xl text-white">Chaussures Running Femme</h1>
          <p className="text-white/60 mt-2 max-w-lg">
            Conçues pour les femmes. Performantes sur toutes les surfaces et toutes les distances.
          </p>
        </div>
      </div>
      {/* @ts-expect-error Prisma type vs Product type */}
      <ProductGrid products={products} showFilters />
    </>
  );
}
