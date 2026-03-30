import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vêtements Running — Hauts, Shorts, Collants & Vestes",
  description: "Vêtements running technique. Hauts, shorts, collants et vestes pour toutes les conditions.",
};

async function getApparelCategories() {
  const parent = await prisma.category.findFirst({
    where: { slug: "apparel", isActive: true },
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

export default async function ApparelPage() {
  const data = await getApparelCategories();

  if (!data || data.categories.length === 0) {
    return <ApparelStatic />;
  }

  const { categories } = data;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Boutique</p>
        <h1 className="font-display font-black text-display-md text-gray-900">Vêtements Running</h1>
        <p className="text-gray-500 mt-2">Équipement technique pour chaque sortie, quelles que soient les conditions.</p>
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
                  href={`/apparel/${cat.slug}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>

              {cat.imageUrl && products.length === 0 && (
                <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                  <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-white font-semibold text-sm">Aucun produit dans cette catégorie</p>
                  </div>
                </div>
              )}

              {products.length === 0 && !cat.imageUrl ? (
                <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl">
                  <p className="text-sm">Aucun produit dans cette catégorie</p>
                </div>
              ) : products.length > 0 ? (
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
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ApparelStatic() {
  const subcategories = [
    { name: "T-Shirts & Hauts", slug: "tops", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop" },
    { name: "Shorts", slug: "shorts", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=500&fit=crop" },
    { name: "Collants & Leggings", slug: "tights", image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&h=500&fit=crop" },
    { name: "Vestes & Gilets", slug: "jackets", image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=400&h=500&fit=crop" },
    { name: "Casquettes & Bonnets", slug: "caps-beanies", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=500&fit=crop" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Boutique</p>
        <h1 className="font-display font-black text-display-md text-gray-900">Vêtements Running</h1>
        <p className="text-gray-500 mt-2">Équipement technique pour chaque sortie, quelles que soient les conditions.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((cat) => (
          <Link key={cat.slug} href={`/apparel/${cat.slug}`} className="group">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3">
              <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-lg">{cat.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="font-semibold text-gray-700 text-sm">{cat.name}</p>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
