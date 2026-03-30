import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { BestSellers } from "@/components/home/BestSellers";
import { prisma } from "@/lib/prisma";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { size: "asc" } },
      categories: { include: { category: { select: { name: true, slug: true } } } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };

  return {
    title: `${product.name} — ${product.brand?.name ?? "Chaussures Running"}`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: [{ url: product.images[0]?.url ?? "", width: 800, height: 800 }],
    },
  };
}

const GENDER_FR: Record<string, string> = {
  MEN: "Homme",
  WOMEN: "Femme",
  UNISEX: "Mixte",
  KIDS: "Enfant",
};

const TERRAIN_FR: Record<string, string> = {
  ROAD: "Route",
  TRAIL: "Trail",
  TRACK: "Piste",
  GYM: "Salle",
  MIXED: "Mixte",
};

const CUSHION_FR: Record<string, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Élevé",
  MAX: "Maximum",
};

const STABILITY_FR: Record<string, string> = {
  NEUTRAL: "Neutre",
  STABILITY: "Stabilité",
  MOTION_CONTROL: "Contrôle du mouvement",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Produit introuvable</h1>
        <Link href="/men" className="text-brand-500 font-semibold hover:text-brand-600">
          Voir tous les produits
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-brand-500 transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          <Link href="/men" className="hover:text-brand-500 transition-colors">Chaussures</Link>
          <ChevronRight size={14} />
          {product.brand && (
            <>
              <Link href={`/brands/${product.brand.slug}`} className="hover:text-brand-500 transition-colors">
                {product.brand.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Layout produit */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Galerie */}
          {/* @ts-expect-error Prisma null vs undefined */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Détails */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* @ts-expect-error Prisma null vs undefined */}
            <ProductDetails product={product} />
          </div>
        </div>

        {/* Onglets info produit */}
        <ProductInfoTabs product={product} />
      </div>

      {/* Produits similaires */}
      <BestSellers />

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            brand: { "@type": "Brand", name: product.brand?.name },
            offers: {
              "@type": "Offer",
              price: product.variants[0]?.price,
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
            },
            aggregateRating: product.reviewCount > 0 ? {
              "@type": "AggregateRating",
              ratingValue: product.avgRating,
              reviewCount: product.reviewCount,
            } : undefined,
          }),
        }}
      />
    </>
  );
}

function ProductInfoTabs({ product }: { product: Awaited<ReturnType<typeof getProduct>> }) {
  if (!product) return null;
  return (
    <div className="border-t border-gray-100 pt-12 mb-16">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Description */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="font-display font-black text-xl text-gray-900 mb-3">À propos de cette chaussure</h2>
            <p className="text-gray-600 leading-relaxed">{product.longDescription ?? product.description}</p>
          </div>

          {product.materials && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Matières</h3>
              <p className="text-sm text-gray-600">{product.materials}</p>
            </div>
          )}

          {product.features.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Caractéristiques techniques</h3>
              <ul className="grid grid-cols-2 gap-2">
                {product.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Specs */}
        <div>
          <h2 className="font-display font-black text-xl text-gray-900 mb-4">Caractéristiques</h2>
          <dl className="space-y-3">
            {[
              { label: "Genre", value: GENDER_FR[product.gender] ?? product.gender },
              { label: "Terrain", value: TERRAIN_FR[product.terrain] ?? product.terrain },
              { label: "Amorti", value: CUSHION_FR[product.cushionLevel] ?? product.cushionLevel },
              { label: "Stabilité", value: STABILITY_FR[product.stability] ?? product.stability },
              product.drop !== undefined && { label: "Drop talon-avant pied", value: `${product.drop} mm` },
              product.weight && { label: "Poids", value: `${product.weight} g (EU 42)` },
              { label: "Catégorie", value: "Chaussures de running" },
            ].filter(Boolean).map((spec) => {
              if (!spec) return null;
              return (
                <div key={spec.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <dt className="text-sm text-gray-500">{spec.label}</dt>
                  <dd className="text-sm font-semibold text-gray-900">{spec.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
