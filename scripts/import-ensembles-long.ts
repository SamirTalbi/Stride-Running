import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const ROOT = path.join(process.cwd(), "Photos", "Ensemble long");
const SIZES = ["S", "M", "L", "XL", "XXL"];
const PRICE = 75;
const STOCK = 1;
const CATEGORY_SLUG = "tracksuits";

type Variant = { file: string; color: string; hex: string };

type BrandSpec = {
  brandSlug: string;
  brandName: string;
  folder: string;
  productName: string;
  slug: string;
  sku: string;
  description: string;
  variants: Variant[];
  primaryColor: string;
};

const SPECS: BrandSpec[] = [
  {
    brandSlug: "on",
    brandName: "On",
    folder: "On",
    productName: "On Ensemble Running Long",
    slug: "on-ensemble-running-long",
    sku: "ON-ENS-LONG",
    description:
      "Ensemble running long On — veste + pantalon. Tissu technique léger, coupe athlétique, logo On signature.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.22.21.jpeg",       color: "Cream Vest Black", hex: "#e6dcc8" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (1).jpeg",   color: "Dark Grey",        hex: "#3a3a3e" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (2).jpeg",   color: "Black",            hex: "#111111" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (3).jpeg",   color: "White Grey",       hex: "#e8e8e8" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (4).jpeg",   color: "Steel Blue Navy",  hex: "#6f86a8" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (5).jpeg",   color: "Burgundy Black",   hex: "#7a3a3a" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (6).jpeg",   color: "White Full",       hex: "#ffffff" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.21 (7).jpeg",   color: "Cream Grey",       hex: "#d9d2bf" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22.jpeg",       color: "Blue Navy",        hex: "#3c5a82" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (1).jpeg",   color: "White Hooded Grey",hex: "#f3f3f3" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (2).jpeg",   color: "White Hooded Black", hex: "#fafafa" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (3).jpeg",   color: "Yellow Navy",      hex: "#e6a93a" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (4).jpeg",   color: "Olive Green",      hex: "#6a7a3a" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (5).jpeg",   color: "Black Hooded",     hex: "#1a1a1a" },
      { file: "WhatsApp Image 2026-05-19 at 20.22.22 (6).jpeg",   color: "Grey Black",       hex: "#5a5a5e" },
    ],
  },
  {
    brandSlug: "nike",
    brandName: "Nike",
    folder: "Nike",
    productName: "Nike Ensemble Running Long",
    slug: "nike-ensemble-running-long",
    sku: "NK-ENS-LONG",
    description:
      "Ensemble running Nike — veste à capuche + pantalon technique. Coupe athlétique, swoosh signature, motifs réfléchissants.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.24.43.jpeg",     color: "Black",                hex: "#111111" },
      { file: "WhatsApp Image 2026-05-19 at 20.24.44.jpeg",     color: "Black Green Gradient", hex: "#1f3a2a" },
      { file: "WhatsApp Image 2026-05-19 at 20.24.46.jpeg",     color: "Black Grey Gradient",  hex: "#3a3a3a" },
      { file: "WhatsApp Image 2026-05-19 at 20.24.46 (1).jpeg", color: "White",                hex: "#ffffff" },
    ],
  },
  {
    brandSlug: "under-armour",
    brandName: "Under Armour",
    folder: "Under",
    productName: "Under Armour Ensemble Running Long",
    slug: "under-armour-ensemble-running-long",
    sku: "UA-ENS-LONG",
    description:
      "Ensemble running Under Armour — veste à capuche + pantalon technique. Coupe ajustée, lettrage \"Blood Sweat Respect\" signature.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.24.48.jpeg",     color: "White Grey", hex: "#e8e8e8" },
      { file: "WhatsApp Image 2026-05-19 at 20.24.48 (1).jpeg", color: "Black",      hex: "#111111" },
      { file: "WhatsApp Image 2026-05-19 at 20.24.48 (2).jpeg", color: "Grey White", hex: "#a8a8a8" },
    ],
  },
  {
    brandSlug: "alo",
    brandName: "Alo",
    folder: "Alo",
    productName: "Alo Ensemble Fleece Long",
    slug: "alo-ensemble-fleece-long",
    sku: "ALO-ENS-LONG",
    description:
      "Ensemble Alo fleece — sweat à demi-zip + pantalon coupe relax. Tissu polaire doux, logo alo signature, idéal lifestyle.",
    primaryColor: "Beige",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.19.jpeg", color: "Beige", hex: "#d4c4a8" },
    ],
  },
];

async function uploadLocal(absPath: string, filename: string) {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: {
      filename,
      mimeType: mime,
      size: buffer.length,
      folder: "products",
      data: base64,
    },
  });
  return `/api/media/${media.id}`;
}

function colorSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function ensureBrand(slug: string, name: string) {
  return prisma.brand.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

async function importSpec(spec: BrandSpec) {
  console.log(`\n=== ${spec.brandName}: ${spec.productName} ===`);
  const brand = await ensureBrand(spec.brandSlug, spec.brandName);

  // Idempotent: drop if exists
  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log(`  Removing existing product...`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: spec.productName,
      slug: spec.slug,
      sku: spec.sku,
      description: spec.description,
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
      searchKeywords: [spec.brandName.toLowerCase(), "ensemble", "running", "long", "tracksuit"],
    },
  });

  const cat = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (cat) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId: cat.id },
    });
  }

  // Variants: sizes × colors
  const variantData = spec.variants.flatMap((v) =>
    SIZES.map((size) => ({
      productId: product.id,
      size,
      color: v.color,
      colorHex: v.hex,
      price: PRICE,
      stock: STOCK,
      isActive: true,
    }))
  );
  await prisma.productVariant.createMany({ data: variantData });
  console.log(`  ${variantData.length} variants (${spec.variants.length} colors × ${SIZES.length} sizes)`);

  const folderPath = path.join(ROOT, spec.folder);
  let sort = 0;
  let uploaded = 0;
  let missing = 0;

  for (const v of spec.variants) {
    const absPath = path.join(folderPath, v.file);
    try {
      await fs.access(absPath);
    } catch {
      console.warn(`  [warn] missing: ${v.file}`);
      missing++;
      continue;
    }
    const url = await uploadLocal(
      absPath,
      `${spec.slug}-${colorSlug(v.color)}.jpeg`
    );
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: v.color,
        sortOrder: sort++,
        isPrimary: v.color === spec.primaryColor,
        altText: `${spec.productName} ${v.color}`,
      },
    });
    uploaded++;
  }
  console.log(`  ${uploaded} images${missing ? `, ${missing} missing` : ""}`);
}

async function main() {
  console.log("Importing Ensembles Long for 4 brands...");
  for (const spec of SPECS) {
    await importSpec(spec);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
