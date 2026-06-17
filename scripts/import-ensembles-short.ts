import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const ROOT = path.join(process.cwd(), "Photos", "Ensembles Short");
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
    productName: "On Ensemble Running Short",
    slug: "on-ensemble-running-short",
    sku: "ON-ENS-SHORT",
    description:
      "Ensemble running On — t-shirt + short. Tissu technique respirant, coupe athlétique, logo On signature.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 18.53.26.jpeg",     color: "Grey Mid",           hex: "#9a9a9e" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.26 (1).jpeg", color: "Light Grey",         hex: "#c8c8cc" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.27.jpeg",     color: "Lavender Black",     hex: "#a896b8" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.30.jpeg",     color: "Salmon Pink Black",  hex: "#e88a8a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.30 (1).jpeg", color: "Sage Olive",         hex: "#8a8a6a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.30 (2).jpeg", color: "Olive Green",        hex: "#6a7a3a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31.jpeg",     color: "Lime Olive",         hex: "#c4d23a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (1).jpeg", color: "Burnt Orange Black", hex: "#c46a3a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (2).jpeg", color: "Steel Grey Black",   hex: "#6a7a8a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (3).jpeg", color: "Steel Blue Black",   hex: "#4a6a8a" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (4).jpeg", color: "Mint Sage",          hex: "#a8c4a8" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (5).jpeg", color: "Grey Heather Black", hex: "#7a7a82" },
      { file: "WhatsApp Image 2026-05-19 at 18.53.31 (6).jpeg", color: "Black",              hex: "#111111" },
      { file: "WhatsApp Image 2026-05-19 at 19.22.19.jpeg",     color: "Sage Mint",          hex: "#b8d2b8" },
      { file: "WhatsApp Image 2026-05-19 at 19.22.19 (1).jpeg", color: "Dark Navy",          hex: "#2a3a4a" },
      { file: "WhatsApp Image 2026-05-19 at 19.22.19 (2).jpeg", color: "White Black",        hex: "#fafafa" },
    ],
  },
  {
    brandSlug: "nike",
    brandName: "Nike",
    folder: "Nike",
    productName: "Nike Ensemble Running Short",
    slug: "nike-ensemble-running-short",
    sku: "NK-ENS-SHORT",
    description:
      "Ensemble running Nike — t-shirt Miler + short technique. Tissu Dri-FIT respirant, coupe ajustée, swoosh signature.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.26.34.jpeg",     color: "Black",        hex: "#111111" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.34 (1).jpeg", color: "Pink",         hex: "#e94c8a" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.35.jpeg",     color: "Mint Green",   hex: "#8eddb1" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.35 (1).jpeg", color: "Light Grey",   hex: "#c8c8cc" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.35 (2).jpeg", color: "Sky Blue",     hex: "#3ea8d0" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.36.jpeg",     color: "Lavender",     hex: "#c0a8e0" },
    ],
  },
  {
    brandSlug: "under-armour",
    brandName: "Under Armour",
    folder: "Under",
    productName: "Under Armour Ensemble Running Short",
    slug: "under-armour-ensemble-running-short",
    sku: "UA-ENS-SHORT",
    description:
      "Ensemble running Under Armour — t-shirt UA-Spec + short technique. Lettrage \"Blood Sweat Respect\" signature.",
    primaryColor: "Black",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.26.24.jpeg",     color: "White Navy",  hex: "#f4f4f4" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.25.jpeg",     color: "Light Grey White", hex: "#d8dadc" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.25 (1).jpeg", color: "Navy Black",  hex: "#2a3a5a" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.25 (2).jpeg", color: "White Full",  hex: "#ffffff" },
      { file: "WhatsApp Image 2026-05-19 at 20.26.25 (3).jpeg", color: "Black",       hex: "#111111" },
    ],
  },
  {
    brandSlug: "alo",
    brandName: "Alo",
    folder: "alo",
    productName: "Alo Ensemble Short",
    slug: "alo-ensemble-short",
    sku: "ALO-ENS-SHORT",
    description:
      "Ensemble Alo court — t-shirt oversize + short coupe ample. Coton doux, logo alo signature, idéal loungewear.",
    primaryColor: "Pink",
    variants: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.19.jpeg", color: "Pink", hex: "#d8a8c8" },
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
      searchKeywords: [spec.brandName.toLowerCase(), "ensemble", "running", "short", "tracksuit", "ete"],
    },
  });

  const cat = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (cat) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId: cat.id },
    });
  }

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
  console.log("Importing Ensembles Short for 4 brands...");
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
