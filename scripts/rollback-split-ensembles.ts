import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW_PRODUCT_SLUGS = [
  "on-tshirt-running",
  "on-short-running",
  "nike-tshirt-running-miler",
  "nike-short-running",
  "under-armour-tshirt-ua-spec",
  "under-armour-short-running",
  "alo-tshirt-oversize",
  "alo-short",
  "on-veste-running",
  "on-jogger-running",
  "nike-veste-running",
  "nike-jogger-running",
  "under-armour-veste-running",
  "under-armour-jogger-running",
  "alo-sweat-fleece-demi-zip",
  "alo-jogger-fleece",
];

// Restore the cross-categorization that was in place before the split.
// Each ensemble was linked to its component sub-categories.
const RESTORE: Record<string, string[]> = {
  "on-ensemble-running-long":           ["jackets", "joggers"],
  "nike-ensemble-running-long":         ["jackets", "joggers"],
  "under-armour-ensemble-running-long": ["jackets", "joggers"],
  "alo-ensemble-fleece-long":           ["hoodies", "joggers"],
  "on-ensemble-running-short":          ["tops", "shorts"],
  "nike-ensemble-running-short":        ["tops", "shorts"],
  "under-armour-ensemble-running-short":["tops", "shorts"],
  "alo-ensemble-short":                 ["tops", "shorts"],
};

async function main() {
  // 1. Delete the 16 standalone products (cascade kills variants + ProductImage rows;
  //    Media stays — it's still referenced by the parent ensembles' ProductImage rows).
  let deleted = 0;
  for (const slug of NEW_PRODUCT_SLUGS) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.delete({ where: { id: existing.id } });
      console.log(`- ${slug}`);
      deleted++;
    }
  }
  console.log(`\nDeleted ${deleted} standalone products.`);

  // 2. Re-link the ensembles to their component sub-categories.
  let restored = 0;
  for (const [productSlug, catSlugs] of Object.entries(RESTORE)) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) continue;
    for (const catSlug of catSlugs) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (!cat) continue;
      const exists = await prisma.productCategory.findUnique({
        where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
      });
      if (exists) continue;
      await prisma.productCategory.create({
        data: { productId: product.id, categoryId: cat.id },
      });
      restored++;
      console.log(`+ ${productSlug} → ${catSlug}`);
    }
  }
  console.log(`\nRestored ${restored} cross-cat links on ensembles.`);

  // Verify
  const slugs = ["tops", "shorts", "joggers", "jackets", "hoodies", "tracksuits"];
  console.log("\nFinal category counts:");
  for (const s of slugs) {
    const cat = await prisma.category.findUnique({ where: { slug: s } });
    if (!cat) continue;
    const cnt = await prisma.productCategory.count({ where: { categoryId: cat.id } });
    console.log(`  /apparel/${s.padEnd(12)} → ${cnt} produits`);
  }
}

main()
  .catch((e) => {
    console.error("Rollback failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
