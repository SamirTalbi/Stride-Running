import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Accessoires Running — Chaussettes, Montres GPS, Hydratation & Plus",
  description: "Complétez votre équipement running avec les meilleurs accessoires. Chaussettes, montres GPS, vestes d'hydratation, écouteurs et plus encore.",
};

async function getAccessoryCategories() {
  const parent = await prisma.category.findFirst({
    where: { slug: "accessories", isActive: true },
  });

  if (!parent) return null;

  const categories = await prisma.category.findMany({
    where: { parentId: parent.id, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { product: { isActive: true } },
        orderBy: { product: { isBestSeller: "desc" } },
        take: 4,
        include: {
          product: {
            include: {
              brand: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  return { parent, categories };
}

export default async function AccessoriesPage() {
  const data = await getAccessoryCategories();

  if (!data || data.categories.length === 0) {
    return <AccessoriesEmpty />;
  }

  const { categories } = data;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Complétez votre équipement</p>
        <h1 className="font-display font-black text-display-md text-gray-900">Accessoires Running</h1>
      </div>

      <div className="space-y-16">
        {categories.map((cat) => {
          const products = cat.products.map((pc) => pc.product);
          return (
            <section key={cat.id}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-black text-2xl text-gray-900">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                  )}
                </div>
                <Link
                  href={`/accessories/${cat.slug}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {cat.imageUrl ? (
                    <div className="relative h-40 rounded-2xl overflow-hidden">
                      <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <p className="text-white font-semibold text-sm">Aucun produit pour l&apos;instant</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl">
                      <p className="text-sm">Aucun produit dans cette catégorie</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.map((product) => {
                    const image = product.images[0]?.url;
                    const price = product.variants[0]?.price;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                              Pas d&apos;image
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          {product.brand && (
                            <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-0.5">
                              {product.brand.name}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-500 transition-colors line-clamp-2">
                            {product.name}
                          </p>
                          {price && (
                            <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(price)}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AccessoriesEmpty() {
  const staticCategories = [
    { name: "Chaussettes Running", slug: "socks", image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&h=400&fit=crop" },
    { name: "Montres GPS", slug: "gps-watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
    { name: "Vestes d'Hydratation", slug: "hydration-vests", image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=400&h=400&fit=crop" },
    { name: "Écouteurs", slug: "headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
    { name: "Ceintures Running", slug: "running-belts", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Complétez votre équipement</p>
        <h1 className="font-display font-black text-display-md text-gray-900">Accessoires Running</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {staticCategories.map((item) => (
          <Link
            key={item.slug}
            href={`/accessories/${item.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="font-bold text-gray-900 group-hover:text-brand-500 transition-colors">{item.name}</p>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
