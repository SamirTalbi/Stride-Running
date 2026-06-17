import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sub-categories an "ensemble" must NOT belong to (it's a full set, not a garment)
const GARMENT_SUBCATS = ["tops", "shorts", "joggers", "jackets", "hoodies", "tracksuits"];
// Also strip the bare parent link
const STRIP_ALSO = ["apparel"];

async function ensureEnsemblesCategory() {
  const existing = await prisma.category.findUnique({ where: { slug: "ensembles" } });
  if (existing) return existing;
  const apparel = await prisma.category.findUnique({ where: { slug: "apparel" } });
  return prisma.category.create({
    data: {
      slug: "ensembles",
      name: "Ensembles",
      description: "Ensembles & tenues coordonnées — brassière + legging, veste + pantalon, sets running.",
      parentId: apparel?.id ?? null,
      isActive: true,
      sortOrder: 1,
    },
  });
}

async function main() {
  const ensemblesCat = await ensureEnsemblesCategory();
  console.log(`Catégorie 'ensembles' prête (id ${ensemblesCat.id})\n`);

  const stripSlugs = [...GARMENT_SUBCATS, ...STRIP_ALSO];
  const stripCats = await prisma.category.findMany({ where: { slug: { in: stripSlugs } } });
  const stripIds = new Set(stripCats.map((c) => c.id));

  // 1) Ensembles → catégorie 'ensembles' uniquement
  const ensembles = await prisma.product.findMany({
    where: { name: { contains: "Ensemble", mode: "insensitive" } },
    include: { categories: { include: { category: true } } },
  });
  console.log(`=== ${ensembles.length} ensembles à recatégoriser ===`);
  for (const p of ensembles) {
    const before = p.categories.map((c) => c.category.slug);
    // remove garment/parent links
    await prisma.productCategory.deleteMany({
      where: { productId: p.id, categoryId: { in: [...stripIds] } },
    });
    // add ensembles link if missing
    const hasEnsembles = p.categories.some((c) => c.category.slug === "ensembles");
    if (!hasEnsembles) {
      await prisma.productCategory.create({
        data: { productId: p.id, categoryId: ensemblesCat.id },
      });
    }
    const after = await prisma.productCategory.findMany({
      where: { productId: p.id },
      include: { category: true },
    });
    console.log(`  ${p.name}\n     avant: ${before.join(", ") || "(aucune)"}\n     après: ${after.map((c) => c.category.slug).join(", ")}`);
  }

  // 2) Tout Alo → genre Femme
  const alo = await prisma.brand.findUnique({ where: { slug: "alo" } });
  if (alo) {
    const res = await prisma.product.updateMany({
      where: { brandId: alo.id, gender: { not: "WOMEN" } },
      data: { gender: "WOMEN" },
    });
    console.log(`\n=== Alo → Femme : ${res.count} produit(s) repassé(s) en WOMEN ===`);
  }

  // 3) Désactiver 'Survêtements' (tracksuits) s'il est désormais vide
  const tracksuits = await prisma.category.findUnique({ where: { slug: "tracksuits" } });
  if (tracksuits) {
    const count = await prisma.productCategory.count({ where: { categoryId: tracksuits.id } });
    if (count === 0 && tracksuits.isActive) {
      await prisma.category.update({ where: { id: tracksuits.id }, data: { isActive: false } });
      console.log(`\n'Survêtements' (tracksuits) désormais vide → désactivé.`);
    } else {
      console.log(`\n'Survêtements' (tracksuits) conserve ${count} produit(s) → laissé actif.`);
    }
  }

  console.log("\nDONE.");
}

main()
  .catch((e) => {
    console.error("fix-categories failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
