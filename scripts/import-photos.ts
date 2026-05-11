import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const PHOTOS_ROOT = path.join(process.cwd(), "photos", "Baskets");
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 80;
const STOCK = 999;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

type VariantSpec = {
  folder: string;
  color: string;
  hex: string;
};

type ProductSpec = {
  name: string;
  slug: string;
  sku: string;
  brandSlug: string;
  description: string;
  variants: VariantSpec[];
  primaryVariantFolder: string;
  baseFolder: string;
  categorySlugs?: string[];
};

const DEFAULT_CATEGORIES = ["road-running"];

const PRODUCTS: ProductSpec[] = [
  {
    name: "Gel Kayano 14",
    slug: "gel-kayano-14",
    sku: "AS-KAY14",
    brandSlug: "asics",
    description: "Le Gel Kayano 14 reprend les codes du running des années 2000 avec un amorti GEL signature et un mesh respirant. Maintien stable, design retro premium.",
    baseFolder: "Kayano",
    primaryVariantFolder: "Asics_Gel_Kayano_14_Cream",
    variants: [
      { folder: "Asics_Gel_Kayano_14_Cream",      color: "Cream",       hex: "#f5e6d3" },
      { folder: "Asics_Gel_Kayano_14_Fjord_Grey", color: "Fjord Grey",  hex: "#7f8b96" },
      { folder: "bleu_blanc",                     color: "Light Blue",  hex: "#aed6e8" },
      { folder: "noname",                         color: "Pink Cream",  hex: "#e8c2c0" },
      { folder: "noname1",                        color: "Cream Beige", hex: "#e6dcc8" },
      { folder: "noname2",                        color: "Black Beige", hex: "#3a3128" },
    ],
  },
  {
    name: "Mind",
    slug: "mind",
    sku: "NK-MIND",
    brandSlug: "nike",
    description: "Nike Mind — claquette signature avec semelle à plots, confort moelleux et style affirmé. Parfaite pour la récup ou le quotidien.",
    baseFolder: "Nike/Mind",
    primaryVariantFolder: "Blanc",
    categorySlugs: ["trail-running"],
    variants: [
      { folder: "Blanc",       color: "White",       hex: "#ffffff" },
      { folder: "Noir",        color: "Black",       hex: "#111111" },
      { folder: "noir_bleu",   color: "Black Blue",  hex: "#1a2540" },
      { folder: "Rouge",       color: "Red",         hex: "#ef4444" },
      { folder: "rouge_noir",  color: "Red Black",   hex: "#7a1c1c" },
      { folder: "jaune_bleu",  color: "Yellow Blue", hex: "#f4d03f" },
    ],
  },
  {
    name: "Cloud",
    slug: "cloud",
    sku: "ON-CLOUD",
    brandSlug: "on",
    description: "On Cloud — l'iconique. Technologie CloudTec® pour un atterrissage doux et un décollage explosif. Légère, moderne, adaptée à tous les terrains urbains.",
    baseFolder: "On",
    primaryVariantFolder: "on4",
    variants: [
      { folder: "on1",  color: "Pink Coral",  hex: "#e8a094" },
      { folder: "on2",  color: "Navy",        hex: "#1e3a5f" },
      { folder: "on3",  color: "Black",       hex: "#111111" },
      { folder: "on4",  color: "White",       hex: "#ffffff" },
      { folder: "on5",  color: "Grey",        hex: "#9ca3af" },
      { folder: "on6",  color: "Olive",       hex: "#c8c895" },
      { folder: "on7",  color: "Mint Green",  hex: "#b8e6b8" },
      { folder: "on8",  color: "White Black", hex: "#dddddd" },
      { folder: "on9",  color: "Mauve",       hex: "#a87778" },
      { folder: "on10", color: "Soft Pink",   hex: "#fce4ec" },
      { folder: "on11", color: "Triple Black", hex: "#000000" },
    ],
  },
  {
    name: "ProGrid Omni 9",
    slug: "progrid-omni-9",
    sku: "SC-OMNI9",
    brandSlug: "saucony",
    description: "Saucony ProGrid Omni 9 — running stability classique, technologie ProGrid pour un amorti optimal. Coloris vintage et signatures iconiques.",
    baseFolder: "Saucony",
    primaryVariantFolder: "Progrid_Omni_9_Black",
    variants: [
      { folder: "Progrid_Omni_9_Black",                          color: "Black",          hex: "#111111" },
      { folder: "ProGrid_Omni_9_Black_Silver",                   color: "Black Silver",   hex: "#3a3a3a" },
      { folder: "ProGrid_Omni_9_Deep_Navy",                      color: "Deep Navy",      hex: "#0f1e3a" },
      { folder: "ProGrid_Omni_9_Distract",                       color: "Distract",       hex: "#7a8c5c" },
      { folder: "ProGrid_Omni_9_Fade",                           color: "Fade",           hex: "#a8b8c8" },
      { folder: "Progrid_Omni_9_GLOWACONSTRICTOR_Green",         color: "Glow Green",     hex: "#7fff00" },
      { folder: "Progrid_Omni_9_GLOWACONSTRICTOR_PINK_GLOW",     color: "Pink Glow",      hex: "#ff66cc" },
      { folder: "ProGrid_Omni_9_Grey_Silver",                    color: "Grey Silver",    hex: "#b8b8b8" },
      { folder: "ProGrid_Omni_9_Mutant",                         color: "Mutant",         hex: "#5d6b48" },
      { folder: "ProGrid_Omni_9_Pink_Purple",                    color: "Pink Purple",    hex: "#c879b8" },
      { folder: "Saucony_Progrid_Omni_9_Blue_Lime",              color: "Blue Lime",      hex: "#3399cc" },
      { folder: "Saucony_ProGrid_Omni_9_OG_Silver_Gold",         color: "OG Silver Gold", hex: "#c9b27a" },
      { folder: "Saucony_Progrid_Omni_9_Torte",                  color: "Torte",          hex: "#8a6a4f" },
    ],
  },
];

async function readImageFiles(folderPath: string): Promise<string[]> {
  const entries = await fs.readdir(folderPath);
  const images = entries.filter((e) => IMAGE_EXT.test(e)).sort();
  // Side views first ("cote*"), then the rest
  const sides = images.filter((f) => /^cote/i.test(f));
  const others = images.filter((f) => !/^cote/i.test(f));
  return [...sides, ...others];
}

function pickPrimaryFile(files: string[]): string {
  const preferred = ["cote.jpg", "cote.jpeg", "face.jpg", "haut.jpg"];
  for (const p of preferred) {
    const hit = files.find((f) => f.toLowerCase() === p);
    if (hit) return hit;
  }
  return files[0];
}

async function uploadImage(absPath: string, filename: string): Promise<string> {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(filename).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
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

async function importProduct(spec: ProductSpec) {
  const brand = await prisma.brand.findUnique({ where: { slug: spec.brandSlug } });
  if (!brand) throw new Error(`Brand not found: ${spec.brandSlug}`);

  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log(`  → Product "${spec.name}" exists, deleting and re-importing...`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  console.log(`  → Creating product "${spec.name}"...`);
  const product = await prisma.product.create({
    data: {
      name: spec.name,
      slug: spec.slug,
      sku: spec.sku,
      description: spec.description,
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isActive: true,
    },
  });

  const catSlugs = spec.categorySlugs ?? DEFAULT_CATEGORIES;
  const cats = await prisma.category.findMany({ where: { slug: { in: catSlugs } }, select: { id: true } });
  if (cats.length > 0) {
    await prisma.productCategory.createMany({
      data: cats.map((c) => ({ productId: product.id, categoryId: c.id })),
      skipDuplicates: true,
    });
  }

  const variantData: { size: string; color: string; colorHex: string; price: number; stock: number; productId: string; isActive: boolean }[] = [];
  for (const v of spec.variants) {
    for (const size of SIZES) {
      variantData.push({
        productId: product.id,
        size,
        color: v.color,
        colorHex: v.hex,
        price: PRICE,
        stock: STOCK,
        isActive: true,
      });
    }
  }
  await prisma.productVariant.createMany({ data: variantData });
  console.log(`     ${variantData.length} variants created`);

  const imageRecords: { productId: string; url: string; color: string; sortOrder: number; isPrimary: boolean; altText: string }[] = [];
  let imageCount = 0;
  let globalSort = 0;

  for (const v of spec.variants) {
    const folderPath = path.join(PHOTOS_ROOT, spec.baseFolder, v.folder);
    const files = await readImageFiles(folderPath);
    if (files.length === 0) {
      console.warn(`     ⚠️  No images in ${folderPath}`);
      continue;
    }
    const primaryFile = pickPrimaryFile(files);

    for (const file of files) {
      const absPath = path.join(folderPath, file);
      const url = await uploadImage(absPath, `${spec.slug}-${v.folder}-${file}`);
      const isProductPrimary = v.folder === spec.primaryVariantFolder && file === primaryFile;
      imageRecords.push({
        productId: product.id,
        url,
        color: v.color,
        sortOrder: globalSort++,
        isPrimary: isProductPrimary,
        altText: `${spec.name} ${v.color}`,
      });
      imageCount++;
    }
  }

  await prisma.productImage.createMany({ data: imageRecords });
  console.log(`     ${imageCount} images uploaded`);
}

async function main() {
  console.log("🌱 Importing products from photos folder...\n");
  for (const spec of PRODUCTS) {
    console.log(`▶ ${spec.name} (${spec.brandSlug})`);
    await importProduct(spec);
    console.log("");
  }
  console.log("✅ Done");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
