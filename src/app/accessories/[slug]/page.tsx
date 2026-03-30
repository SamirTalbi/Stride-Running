import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { product: { isActive: true } },
        orderBy: [{ product: { isBestSeller: "desc" } }, { product: { createdAt: "desc" } }],
        include: {
          product: {
            include: {
              brand: true,
              images: { orderBy: { sortOrder: "asc" } },
              variants: { where: { isActive: true }, orderBy: { size: "asc" } },
              categories: { include: { category: true } },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Not Found" };
  return {
    title: `${category.name} — Running Accessories`,
    description: category.description ?? `Shop all ${category.name} for runners.`,
  };
}

export default async function AccessoryCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const products = category.products.map((pc) => pc.product);

  return (
    <>
      <div className="relative bg-dark-DEFAULT text-white py-10 px-4 lg:px-8 overflow-hidden">
        {category.imageUrl && (
          <>
            <Image src={category.imageUrl} alt={category.name} fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-DEFAULT via-dark-DEFAULT/80 to-transparent" />
          </>
        )}
        <div className="relative max-w-[1440px] mx-auto">
          <p className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-1">
            <a href="/accessories" className="hover:text-white transition-colors">Accessories</a> /
          </p>
          <h1 className="font-display font-black text-5xl text-white">{category.name}</h1>
          {category.description && (
            <p className="text-gray-400 mt-2 max-w-xl">{category.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 text-center text-gray-400">
          <p className="font-medium">No products in this category yet</p>
          <p className="text-sm mt-1">Add products via the admin panel and assign them to this category</p>
        </div>
      ) : (
        /* @ts-expect-error Prisma type vs Product type */
        <ProductGrid products={products} showFilters={true} />
      )}
    </>
  );
}
