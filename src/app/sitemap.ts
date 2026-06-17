import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const revalidate = 3600; // régénère le sitemap chaque heure

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${BASE}${path}`;

  // Pages statiques
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "daily" },
    { path: "/men", priority: 0.9, freq: "daily" },
    { path: "/women", priority: 0.9, freq: "daily" },
    { path: "/shoes", priority: 0.9, freq: "daily" },
    { path: "/apparel", priority: 0.8, freq: "weekly" },
    { path: "/accessories", priority: 0.8, freq: "weekly" },
    { path: "/sale", priority: 0.8, freq: "daily" },
    { path: "/new-arrivals", priority: 0.8, freq: "daily" },
    { path: "/best-sellers", priority: 0.8, freq: "weekly" },
    { path: "/brands", priority: 0.6, freq: "weekly" },
    { path: "/blog", priority: 0.6, freq: "weekly" },
    { path: "/find-my-shoe", priority: 0.5, freq: "monthly" },
    { path: "/about", priority: 0.4, freq: "monthly" },
    { path: "/faq", priority: 0.4, freq: "monthly" },
    { path: "/support", priority: 0.4, freq: "monthly" },
    { path: "/shipping-returns", priority: 0.4, freq: "monthly" },
    { path: "/mentions-legales", priority: 0.2, freq: "yearly" },
    { path: "/cgv", priority: 0.2, freq: "yearly" },
    { path: "/confidentialite", priority: 0.2, freq: "yearly" },
    { path: "/cookies", priority: 0.2, freq: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: url(s.path),
    lastModified: new Date(),
    changeFrequency: s.freq,
    priority: s.priority,
  }));

  // Articles de blog : codés en dur dans /blog/[slug] (pas en base) → on liste les slugs réels.
  const BLOG_SLUGS = [
    "choisir-premieres-chaussures-running",
    "running-route-vs-trail",
    "preparer-premier-marathon",
    "meilleures-chaussures-hoka-2024",
    "nutrition-running-guide",
    "passer-sous-4h-marathon",
    "erreurs-debutant-running",
    "running-hiver-conseils",
  ];
  for (const slug of BLOG_SLUGS) {
    entries.push({ url: url(`/blog/${slug}`), changeFrequency: "monthly", priority: 0.5 });
  }

  try {
    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true, parent: { select: { slug: true } } } }),
    ]);

    for (const p of products) {
      entries.push({ url: url(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const b of brands) {
      entries.push({ url: url(`/brands/${b.slug}`), changeFrequency: "weekly", priority: 0.5 });
    }
    // Catégories enfants -> route selon le parent
    const PARENT_ROUTE: Record<string, string> = { apparel: "/apparel", accessories: "/accessories", shoes: "/shoes" };
    for (const c of categories) {
      const prefix = c.parent ? PARENT_ROUTE[c.parent.slug] : undefined;
      if (prefix) entries.push({ url: url(`${prefix}/${c.slug}`), changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    // En cas d'indisponibilité DB au build, on renvoie au moins les pages statiques
  }

  return entries;
}
