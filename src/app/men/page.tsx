import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Chaussures de Running Homme",
  description: "Chaussures de running homme — route, trail et piste. Nike, Brooks, HOKA & plus. Livraison gratuite dès 75 €.",
  alternates: { canonical: "/men" },
};

async function getMenProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      gender: "MEN",
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
          <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-2">Homme</p>
          <h1 className="font-display font-black text-5xl text-white">Chaussures Running Homme</h1>
          <p className="text-gray-400 mt-2 max-w-lg">
            Route, trail et piste. Trouvez la chaussure de running idéale parmi les meilleures marques mondiales.
          </p>
        </div>
      </div>
      {/* @ts-expect-error Prisma type vs Product type */}
      <ProductGrid products={products} showFilters={true} />
    </>
  );
}
