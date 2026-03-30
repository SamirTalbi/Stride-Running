import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Marques de Chaussures Running",
  description: "Toutes les marques de running : Nike, Brooks, HOKA, Asics, New Balance, Saucony, Salomon et plus encore.",
};

async function getBrands() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  return brands;
}

export default async function BrandsPage() {
  const brands = await getBrands();
  const featured = brands.slice(0, 6);
  const others = brands.slice(6);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">Toutes les marques</p>
        <h1 className="font-display font-black text-display-md text-gray-900">Nos Marques</h1>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">Aucune marque pour l&apos;instant</p>
          <p className="text-sm mt-1">Ajoutez des marques via le panel admin</p>
        </div>
      ) : (
        <>
          {/* Marques mises en avant */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {featured.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="max-h-16 max-w-32 object-contain" />
                  ) : (
                    <span className="font-display font-black text-3xl text-gray-400">{brand.name[0]}</span>
                  )}
                </div>
                <div className="p-5 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-black text-xl text-gray-900 group-hover:text-brand-500 transition-colors">
                        {brand.name}
                      </h3>
                      {brand.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                      )}
                      <p className="text-xs text-brand-500 font-semibold mt-2">
                        {brand._count.products} produit{brand._count.products !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-brand-400 mt-1 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Autres marques */}
          {others.length > 0 && (
            <>
              <h2 className="font-display font-black text-xl text-gray-900 mb-5">Autres marques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {others.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-brand-300 hover:shadow-card transition-all group"
                  >
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-brand-500 transition-colors">{brand.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{brand._count.products} produit{brand._count.products !== 1 ? "s" : ""}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
