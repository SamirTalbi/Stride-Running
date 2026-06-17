/**
 * Import :
 *  - Chaussettes On "Run on Clouds" — coffret 5 paires : le client choisit son PACK
 *    (4 compositions de couleurs). Chaque pack = un crop d'un quadrant de la planche.
 *  - Veste Adidas Originals suède (boutons brandebourgs / 3-stripes) — 7 coloris,
 *    photos plein cadre (1 par coloris), proprement séparées.
 * Idempotent (supprime puis recrée).
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

const SOCK_DIR = path.join(process.cwd(), "Photos", "chaussettes");
const VESTE_DIR = path.join(process.cwd(), "Photos", "veste", "adidas");

const ON_DEPLIE = path.join(SOCK_DIR, "image_pack_deplié.jpeg");
const ON_RANGE = path.join(SOCK_DIR, "pack_rangé.jpeg");
const a = (n: number) =>
  path.join(VESTE_DIR, n === 0 ? "WhatsApp Image 2026-06-14 at 19.59.13.jpeg" : `WhatsApp Image 2026-06-14 at 19.59.13 (${n}).jpeg`);

const HEX: Record<string, string> = {
  // Packs On (couleur représentative pour la pastille)
  "Orange / Noir / Bordeaux / Blanc": "#e8722a",
  "Noir / Blanc / Gris / Jaune / Bleu": "#e3d23a",
  "Noir / Blanc / Gris": "#9ca3af",
  "Menthe / Rose / Violet / Crème": "#8fd6c4",
  // Veste Adidas
  "Vert Olive": "#6b6e4b",
  Moutarde: "#c9a24b",
  "Gris Ardoise": "#5b626b",
  "Bleu Ciel": "#a9c4d8",
  "Bleu Denim": "#3f6285",
  "Crème": "#e8e2d4",
  Rose: "#c06a64",
};

type Crop = [number, number, number, number];
type Img = { src: string; crop?: Crop; color: string | null };
type Spec = {
  slug: string;
  name: string;
  sku: string;
  brandSlug: string;
  description: string;
  searchKeywords: string[];
  gender: "UNISEX" | "MEN" | "WOMEN";
  colors: string[];
  sizes: string[];
  price: number;
  categorySlugs: string[];
  images: Img[];
};

const SPECS: Spec[] = [
  {
    slug: "on-run-on-clouds-coffret-chaussettes",
    name: "On Run on Clouds — Coffret 5 Paires (Socquettes)",
    sku: "ON-SOCK-BOX",
    brandSlug: "on",
    description:
      "Coffret On Run on Clouds de 5 paires de socquettes. Maille respirante, talon maintenu et logo On tissé. Choisissez votre pack de couleurs ci-dessous.",
    searchKeywords: ["on", "on running", "chaussettes", "socquettes", "socks", "run on clouds", "coffret", "pack"],
    gender: "UNISEX",
    colors: [
      "Orange / Noir / Bordeaux / Blanc",
      "Noir / Blanc / Gris / Jaune / Bleu",
      "Noir / Blanc / Gris",
      "Menthe / Rose / Violet / Crème",
    ],
    sizes: ["41-46"],
    price: 35,
    categorySlugs: ["running-socks"],
    images: [
      { src: ON_RANGE, color: null }, // coffrets rangés = vignette catalogue
      { src: ON_DEPLIE, crop: [0, 0, 640, 640], color: "Orange / Noir / Bordeaux / Blanc" },
      { src: ON_DEPLIE, crop: [640, 0, 640, 640], color: "Noir / Blanc / Gris / Jaune / Bleu" },
      { src: ON_DEPLIE, crop: [0, 640, 640, 640], color: "Noir / Blanc / Gris" },
      { src: ON_DEPLIE, crop: [640, 640, 640, 640], color: "Menthe / Rose / Violet / Crème" },
    ],
  },
  {
    slug: "adidas-originals-veste-suede-brandebourgs",
    name: "Veste Adidas Originals Suède — Boutons Brandebourgs",
    sku: "ADI-VEST-SUEDE",
    brandSlug: "adidas",
    description:
      "Veste Adidas Originals en suède effet velours, fermeture à boutons brandebourgs d'inspiration asiatique, col montant et bandes 3-stripes contrastées. Coupe oversize, taille élastiquée. Logo Trèfle brodé.",
    searchKeywords: ["adidas", "originals", "veste", "jacket", "suede", "brandebourg", "3-stripes", "trefoil"],
    gender: "UNISEX",
    colors: ["Vert Olive", "Moutarde", "Gris Ardoise", "Bleu Ciel", "Bleu Denim", "Crème", "Rose"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    price: 75,
    categorySlugs: ["jackets"],
    images: [
      { src: a(1), color: "Vert Olive" }, // produit = vignette catalogue
      { src: a(0), color: "Vert Olive" },
      { src: a(3), color: "Moutarde" },
      { src: a(2), color: "Moutarde" },
      { src: a(5), color: "Gris Ardoise" },
      { src: a(4), color: "Gris Ardoise" },
      { src: a(7), color: "Bleu Ciel" },
      { src: a(6), color: "Bleu Ciel" },
      { src: a(9), color: "Bleu Denim" },
      { src: a(8), color: "Bleu Denim" },
      { src: a(13), color: "Crème" },
      { src: a(10), color: "Crème" },
      { src: a(12), color: "Rose" },
      { src: a(11), color: "Rose" },
    ],
  },
];

const STOCK = 15;

async function uploadImage(img: Img, filename: string): Promise<string> {
  let pipeline = sharp(img.src);
  if (img.crop) {
    const [left, top, width, height] = img.crop;
    pipeline = pipeline.extract({ left, top, width, height });
  }
  const buffer = await pipeline
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

async function importSpec(spec: Spec) {
  const brand = await prisma.brand.findUnique({ where: { slug: spec.brandSlug } });
  if (!brand) throw new Error(`brand not found: ${spec.brandSlug}`);

  const categoryIds: string[] = [];
  for (const cs of spec.categorySlugs) {
    const cat = await prisma.category.findUnique({ where: { slug: cs } });
    if (cat) categoryIds.push(cat.id);
    else console.warn(`  [warn] category not found: ${cs}`);
  }

  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log(`  removing existing ${spec.slug}`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: spec.name,
      slug: spec.slug,
      sku: spec.sku,
      description: spec.description,
      brandId: brand.id,
      gender: spec.gender,
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
      searchKeywords: spec.searchKeywords,
    },
  });

  for (const categoryId of categoryIds) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId } });
  }

  const variants = spec.colors.flatMap((color) =>
    spec.sizes.map((size) => ({
      productId: product.id,
      size,
      color,
      colorHex: HEX[color] ?? "#888888",
      price: spec.price,
      stock: STOCK,
      isActive: true,
    }))
  );
  await prisma.productVariant.createMany({ data: variants });

  let sort = 0;
  for (const img of spec.images) {
    const tag = img.color ? img.color.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "all";
    const url = await uploadImage(img, `${spec.slug}-${tag}-${sort}.jpg`);
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: img.color,
        sortOrder: sort,
        isPrimary: sort === 0,
        altText: img.color ? `${spec.name} — ${img.color}` : spec.name,
      },
    });
    sort++;
  }

  console.log(
    `  + ${spec.name}: ${spec.colors.length} ${spec.slug.includes("coffret") ? "packs" : "couleurs"} × ${spec.sizes.length} tailles = ${variants.length} variants, ${spec.images.length} images`
  );
}

async function main() {
  for (const spec of SPECS) {
    try {
      await importSpec(spec);
    } catch (e) {
      console.error(`[fail] ${spec.slug}:`, e);
    }
  }
  console.log("\nDONE.");
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
