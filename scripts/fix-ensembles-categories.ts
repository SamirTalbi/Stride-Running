import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// For each ensemble product, the additional categories beyond `tracksuits`
// (which is already assigned by the import script).
//
// Long ensemble = veste (jacket) + pantalon (jogger)
// Short ensemble = t-shirt (top) + short
const MAPPING: Record<string, string[]> = {
  // Long
  "on-ensemble-running-long":             ["jackets", "joggers"],
  "nike-ensemble-running-long":           ["jackets", "joggers"],
  "under-armour-ensemble-running-long":   ["jackets", "joggers"],
  "alo-ensemble-fleece-long":             ["hoodies", "joggers"], // demi-zip = hoodie/sweat

  // Short
  "on-ensemble-running-short":            ["tops", "shorts"],
  "nike-ensemble-running-short":          ["tops", "shorts"],
  "under-armour-ensemble-running-short":  ["tops", "shorts"],
  "alo-ensemble-short":                   ["tops", "shorts"],
};

async function main() {
  let added = 0;
  let skipped = 0;

  for (const [productSlug, catSlugs] of Object.entries(MAPPING)) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      console.warn(`  [warn] Product not found: ${productSlug}`);
      continue;
    }

    for (const catSlug of catSlugs) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (!cat) {
        console.warn(`  [warn] Category not found: ${catSlug}`);
        continue;
      }

      const existing = await prisma.productCategory.findUnique({
        where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
      });
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.productCategory.create({
        data: { productId: product.id, categoryId: cat.id },
      });
      added++;
      console.log(`  + ${productSlug} → ${catSlug}`);
    }
  }

  console.log(`\nAdded ${added}, skipped ${skipped} (already linked).`);
}

main()
  .catch((e) => {
    console.error("Fix failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
