import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";

async function getBrand(slug: string) {
  return prisma.brand.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { isActive: true }, orderBy: { size: "asc" } },
          categories: { include: { category: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Marque introuvable" };
  return {
    title: `Chaussures Running ${brand.name}`,
    description: brand.description ?? `Toutes les chaussures de running ${brand.name}. Livraison gratuite dès 75 €.`,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) notFound();

  return (
    <>
      {/* Brand hero */}
      <div className="bg-dark-DEFAULT text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center gap-6">
          {brand.logoUrl ? (
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 flex-shrink-0">
              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="font-display font-black text-3xl text-white">{brand.name[0]}</span>
            </div>
          )}
          <div>
            <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-1">Marque</p>
            <h1 className="font-display font-black text-5xl text-white">{brand.name}</h1>
            {brand.description && (
              <p className="text-gray-400 mt-2 max-w-xl">{brand.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              {brand.products.length} produit{brand.products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {brand.products.length === 0 ? (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 text-center text-gray-400">
          <p className="font-medium">Aucun produit pour cette marque</p>
          <p className="text-sm mt-1">Ajoutez des produits via le panel admin</p>
        </div>
      ) : (
        /* @ts-expect-error Prisma type vs Product type */
        <ProductGrid products={brand.products} showFilters={true} />
      )}
    </>
  );
}
