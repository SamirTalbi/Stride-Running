import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRICE = 45;
const STOCK = 1;
const SIZES = ["S", "M", "L", "XL", "XXL"];

type SplitSpec = {
  parentSlug: string;
  topProduct: {
    name: string;
    slug: string;
    sku: string;
    categorySlug: string; // "tops" or "jackets" or "hoodies"
    description: string;
    keyword: string;
  };
  bottomProduct: {
    name: string;
    slug: string;
    sku: string;
    categorySlug: string; // "shorts" or "joggers"
    description: string;
    keyword: string;
  };
};

const SPLITS: SplitSpec[] = [
  // SHORT ensembles → t-shirt + short
  {
    parentSlug: "on-ensemble-running-short",
    topProduct: {
      name: "On T-shirt Running",
      slug: "on-tshirt-running",
      sku: "ON-TSH-RUN",
      categorySlug: "tops",
      description: "T-shirt running On — tissu technique respirant, coupe athlétique, logo On signature.",
      keyword: "tshirt",
    },
    bottomProduct: {
      name: "On Short Running",
      slug: "on-short-running",
      sku: "ON-SHO-RUN",
      categorySlug: "shorts",
      description: "Short running On — tissu léger respirant, coupe athlétique, logo On signature.",
      keyword: "short",
    },
  },
  {
    parentSlug: "nike-ensemble-running-short",
    topProduct: {
      name: "Nike T-shirt Running Miler",
      slug: "nike-tshirt-running-miler",
      sku: "NK-TSH-MIL",
      categorySlug: "tops",
      description: "T-shirt Nike Miler — tissu Dri-FIT respirant, coupe ajustée, swoosh signature.",
      keyword: "tshirt",
    },
    bottomProduct: {
      name: "Nike Short Running",
      slug: "nike-short-running",
      sku: "NK-SHO-RUN",
      categorySlug: "shorts",
      description: "Short Nike running — tissu Dri-FIT léger, coupe athlétique, swoosh signature.",
      keyword: "short",
    },
  },
  {
    parentSlug: "under-armour-ensemble-running-short",
    topProduct: {
      name: "Under Armour T-shirt UA-Spec",
      slug: "under-armour-tshirt-ua-spec",
      sku: "UA-TSH-SPEC",
      categorySlug: "tops",
      description: "T-shirt Under Armour UA-Spec — tissu technique, lettrage \"Blood Sweat Respect\" signature.",
      keyword: "tshirt",
    },
    bottomProduct: {
      name: "Under Armour Short Running",
      slug: "under-armour-short-running",
      sku: "UA-SHO-RUN",
      categorySlug: "shorts",
      description: "Short Under Armour — tissu technique léger, lettrage \"Armour\" signature.",
      keyword: "short",
    },
  },
  {
    parentSlug: "alo-ensemble-short",
    topProduct: {
      name: "Alo T-shirt Oversize",
      slug: "alo-tshirt-oversize",
      sku: "ALO-TSH-OS",
      categorySlug: "tops",
      description: "T-shirt Alo oversize — coton doux, coupe ample, logo alo signature.",
      keyword: "tshirt",
    },
    bottomProduct: {
      name: "Alo Short",
      slug: "alo-short",
      sku: "ALO-SHO",
      categorySlug: "shorts",
      description: "Short Alo coupe ample — coton doux, logo alo signature, idéal loungewear.",
      keyword: "short",
    },
  },

  // LONG ensembles → veste + jogger
  {
    parentSlug: "on-ensemble-running-long",
    topProduct: {
      name: "On Veste Running",
      slug: "on-veste-running",
      sku: "ON-VES-RUN",
      categorySlug: "jackets",
      description: "Veste running On — tissu technique léger, coupe athlétique, logo On signature.",
      keyword: "veste",
    },
    bottomProduct: {
      name: "On Jogger Running",
      slug: "on-jogger-running",
      sku: "ON-JOG-RUN",
      categorySlug: "joggers",
      description: "Pantalon jogger On — tissu technique léger, coupe athlétique, logo On signature.",
      keyword: "jogger",
    },
  },
  {
    parentSlug: "nike-ensemble-running-long",
    topProduct: {
      name: "Nike Veste Running",
      slug: "nike-veste-running",
      sku: "NK-VES-RUN",
      categorySlug: "jackets",
      description: "Veste Nike running à capuche — tissu Dri-FIT, coupe athlétique, motifs réfléchissants.",
      keyword: "veste",
    },
    bottomProduct: {
      name: "Nike Jogger Running",
      slug: "nike-jogger-running",
      sku: "NK-JOG-RUN",
      categorySlug: "joggers",
      description: "Pantalon Nike running — tissu Dri-FIT, motifs réfléchissants, swoosh signature.",
      keyword: "jogger",
    },
  },
  {
    parentSlug: "under-armour-ensemble-running-long",
    topProduct: {
      name: "Under Armour Veste Running",
      slug: "under-armour-veste-running",
      sku: "UA-VES-RUN",
      categorySlug: "jackets",
      description: "Veste Under Armour à capuche — tissu technique, coupe ajustée, lettrage signature.",
      keyword: "veste",
    },
    bottomProduct: {
      name: "Under Armour Jogger Running",
      slug: "under-armour-jogger-running",
      sku: "UA-JOG-RUN",
      categorySlug: "joggers",
      description: "Pantalon Under Armour technique — coupe ajustée, lettrage \"Blood Sweat Respect\".",
      keyword: "jogger",
    },
  },
  {
    parentSlug: "alo-ensemble-fleece-long",
    topProduct: {
      name: "Alo Sweat Fleece Demi-Zip",
      slug: "alo-sweat-fleece-demi-zip",
      sku: "ALO-SWE-FL",
      categorySlug: "hoodies", // Alo top is a half-zip sweat, not a real jacket
      description: "Sweat Alo fleece demi-zip — tissu polaire doux, coupe relax, logo alo signature.",
      keyword: "sweat",
    },
    bottomProduct: {
      name: "Alo Jogger Fleece",
      slug: "alo-jogger-fleece",
      sku: "ALO-JOG-FL",
      categorySlug: "joggers",
      description: "Pantalon Alo fleece — coupe ample relax, tissu polaire doux, logo alo signature.",
      keyword: "jogger",
    },
  },
];

async function createSplitProduct(
  parent: any,
  spec: SplitSpec["topProduct"]
) {
  // Idempotent: drop if exists
  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: spec.name,
      slug: spec.slug,
      sku: spec.sku,
      description: spec.description,
      brandId: parent.brandId,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
      searchKeywords: [
        parent.brand?.name?.toLowerCase() ?? "",
        spec.keyword,
        "running",
      ].filter(Boolean),
    },
  });

  const cat = await prisma.category.findUnique({ where: { slug: spec.categorySlug } });
  if (cat) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId: cat.id },
    });
  }

  // Variants: same colors as parent, but at split price
  const parentColors = new Map<string, string | null>();
  for (const v of parent.variants) {
    if (!parentColors.has(v.color)) parentColors.set(v.color, v.colorHex);
  }
  const variantData = Array.from(parentColors.entries()).flatMap(([color, hex]) =>
    SIZES.map((size) => ({
      productId: product.id,
      size,
      color,
      colorHex: hex,
      price: PRICE,
      stock: STOCK,
      isActive: true,
    }))
  );
  await prisma.productVariant.createMany({ data: variantData });

  // Images: re-use parent image URLs (same media) with same color tags
  const imageData = parent.images.map((img: any, i: number) => ({
    productId: product.id,
    url: img.url,
    color: img.color,
    sortOrder: i,
    isPrimary: img.isPrimary,
    altText: `${spec.name} ${img.color ?? ""}`.trim(),
  }));
  await prisma.productImage.createMany({ data: imageData });

  return { product, variants: variantData.length, images: imageData.length };
}

async function removeEnsembleFromSubCategories(parentSlug: string) {
  const product = await prisma.product.findUnique({ where: { slug: parentSlug } });
  if (!product) return 0;
  const subCats = ["tops", "shorts", "joggers", "jackets", "hoodies"];
  const cats = await prisma.category.findMany({ where: { slug: { in: subCats } } });
  const result = await prisma.productCategory.deleteMany({
    where: {
      productId: product.id,
      categoryId: { in: cats.map((c) => c.id) },
    },
  });
  return result.count;
}

async function main() {
  let createdProducts = 0;
  let createdVariants = 0;
  let createdImages = 0;
  let removedCatLinks = 0;

  for (const split of SPLITS) {
    const parent = await prisma.product.findUnique({
      where: { slug: split.parentSlug },
      include: { brand: true, variants: true, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!parent) {
      console.warn(`[warn] Parent not found: ${split.parentSlug}`);
      continue;
    }

    console.log(`\n=== ${parent.name} ===`);

    const top = await createSplitProduct(parent, split.topProduct);
    console.log(`  + ${split.topProduct.name}: ${top.variants} variants, ${top.images} images`);
    createdProducts++;
    createdVariants += top.variants;
    createdImages += top.images;

    const bottom = await createSplitProduct(parent, split.bottomProduct);
    console.log(`  + ${split.bottomProduct.name}: ${bottom.variants} variants, ${bottom.images} images`);
    createdProducts++;
    createdVariants += bottom.variants;
    createdImages += bottom.images;

    const removed = await removeEnsembleFromSubCategories(split.parentSlug);
    if (removed > 0) console.log(`  - removed ${removed} sub-cat links from parent`);
    removedCatLinks += removed;
  }

  console.log(`\nDone.`);
  console.log(`  ${createdProducts} new products`);
  console.log(`  ${createdVariants} new variants`);
  console.log(`  ${createdImages} new ProductImage rows (reusing existing Media)`);
  console.log(`  ${removedCatLinks} ensemble→sub-cat links removed (ensembles now only in tracksuits)`);
}

main()
  .catch((e) => {
    console.error("Split failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
