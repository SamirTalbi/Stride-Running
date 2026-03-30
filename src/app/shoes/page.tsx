import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Toutes les Chaussures de Running",
  description: "Découvrez toutes nos chaussures de running — route, trail, racing et débutant. Livraison gratuite dès 75€.",
};

async function getAllShoes() {
  // Get the shoes parent category
  const shoesCat = await prisma.category.findFirst({
    where: { slug: "shoes", isActive: true },
  });

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(shoesCat
        ? { categories: { some: { category: { OR: [{ id: shoesCat.id }, { parentId: shoesCat.id }] } } } }
        : {}),
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

export default async function ShoesPage() {
  const products = await getAllShoes();

  return (
    <>
      <div className="bg-dark-DEFAULT text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-2">Shop</p>
          <h1 className="font-display font-black text-5xl text-white">Toutes les Chaussures</h1>
          <p className="text-gray-400 mt-2 max-w-lg">
            Route, trail, racing et débutant — trouvez la paire parfaite parmi toutes nos chaussures.
          </p>
        </div>
      </div>
      {/* @ts-expect-error Prisma type vs Product type */}
      <ProductGrid products={products} showFilters={true} />
    </>
  );
}
