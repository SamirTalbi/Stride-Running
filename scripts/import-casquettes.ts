import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const ROOT = path.join(process.cwd(), "Photos", "casquettes", "products");
const SIZES = ["TU"]; // taille unique
const PRICE = 35;
const STOCK = 1;
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// FR color slug -> hex
const HEX: Record<string, string> = {
  noir: "#111111",
  gris: "#6b6f72",
  creme: "#e8ddc7",
  rose: "#f08ba0",
  "bleu-ciel": "#8fbce0",
  rouge: "#c0322f",
  "bleu-marine": "#1c2740",
  bleu: "#34548c",
  "bleu-denim": "#6f8cb0",
  blanc: "#f4f4f2",
};

type Spec = {
  folder: string; // sub-dir under ROOT
  slug: string;
  name: string;
  sku: string;
  brandSlug: string;
  description: string;
  searchKeywords: string[];
};

const SPECS: Spec[] = [
  {
    folder: "alo-casquette",
    slug: "alo-casquette",
    name: "Casquette Alo",
    sku: "ALO-CAP",
    brandSlug: "alo",
    description:
      "Casquette Alo à logo brodé, profil bas et coupe ajustée, tissu coton léger. Sangle arrière réglable.",
    searchKeywords: ["alo", "casquette", "cap", "logo"],
  },
  {
    folder: "nike-casquette-flammes",
    slug: "nike-casquette-flammes",
    name: "Casquette Nike Flammes",
    sku: "NK-CAP-FLM",
    brandSlug: "nike",
    description:
      "Casquette Nike 5 panneaux à imprimé flammes all-over, swoosh brodé et sangle réglable à boucle.",
    searchKeywords: ["nike", "casquette", "cap", "flammes", "flames"],
  },
  {
    folder: "the-north-face-casquette",
    slug: "the-north-face-casquette",
    name: "Casquette The North Face 5-Panel",
    sku: "TNF-CAP-5P",
    brandSlug: "the-north-face",
    description:
      "Casquette The North Face 5 panneaux en nylon technique léger, écusson logo brodé, bord plat et sangle réglable à boucle.",
    searchKeywords: ["the north face", "tnf", "casquette", "cap", "5 panel"],
  },
  {
    folder: "canada-goose-casquette",
    slug: "canada-goose-casquette",
    name: "Casquette Canada Goose Arctic",
    sku: "CG-CAP-ARC",
    brandSlug: "canada-goose",
    description:
      "Casquette Canada Goose en nylon, écusson rond Arctic Program, coupe sport et sangle réglable à boucle.",
    searchKeywords: ["canada goose", "casquette", "cap", "arctic"],
  },
  {
    folder: "on-casquette",
    slug: "on-casquette",
    name: "Casquette On Running",
    sku: "ON-CAP-RUN",
    brandSlug: "on",
    description:
      "Casquette On Running ultra-légère, panneaux perforés découpés au laser pour la respirabilité, logo On et sangle réglable.",
    searchKeywords: ["on", "casquette", "cap", "running", "perfore"],
  },
];

// Front-facing photo per product/color → placed first so it becomes the
// gallery hero for that color (and the product's primary image).
const FRONTS: Record<string, Record<string, string>> = {
  "alo-casquette": {
    "bleu-ciel": "WhatsApp Image 2026-05-28 at 18.26.10 (6).jpeg",
    gris: "WhatsApp Image 2026-05-28 at 18.26.12 (4).jpeg",
    noir: "WhatsApp Image 2026-05-28 at 18.26.13.jpeg",
    rose: "WhatsApp Image 2026-05-28 at 18.26.10 (3).jpeg",
  },
  "nike-casquette-flammes": {
    "bleu-marine": "WhatsApp Image 2026-05-28 at 18.26.18 (5).jpeg",
    creme: "WhatsApp Image 2026-05-28 at 18.26.15 (3).jpeg",
    noir: "WhatsApp Image 2026-05-28 at 18.26.15 (6).jpeg",
    rouge: "WhatsApp Image 2026-05-28 at 18.26.18 (1).jpeg",
  },
  "the-north-face-casquette": {
    noir: "WhatsApp Image 2026-05-28 at 18.26.21.jpeg",
  },
  "canada-goose-casquette": {
    "bleu-marine": "WhatsApp Image 2026-05-28 at 18.26.22 (5).jpeg",
  },
  "on-casquette": {
    blanc: "WhatsApp Image 2026-05-28 at 18.26.55 (3).jpeg",
    bleu: "WhatsApp Image 2026-05-28 at 18.26.25.jpeg",
    "bleu-denim": "WhatsApp Image 2026-05-28 at 18.26.52.jpeg",
    creme: "WhatsApp Image 2026-05-28 at 18.27.07 (1).jpeg",
    noir: "WhatsApp Image 2026-05-28 at 18.27.08.jpeg",
  },
};

function colorLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fileSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function listImages(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}
async function listColorDirs(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}
async function uploadLocal(absPath: string, filename: string) {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: mime, size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

async function ensureBrand(slug: string, name: string, description: string) {
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.brand.create({ data: { slug, name, description, isActive: true } });
}

async function ensureCapsCategory() {
  const existing = await prisma.category.findUnique({ where: { slug: "caps" } });
  if (existing) return existing;
  const accessories = await prisma.category.findUnique({ where: { slug: "accessories" } });
  return prisma.category.create({
    data: {
      slug: "caps",
      name: "Casquettes",
      description: "Casquettes de running et lifestyle — Alo, Nike, On, The North Face, Canada Goose.",
      parentId: accessories?.id ?? null,
      isActive: true,
      sortOrder: 0,
    },
  });
}

async function importSpec(spec: Spec, categoryIds: string[]) {
  const dir = path.join(ROOT, spec.folder);
  const colorDirs = await listColorDirs(dir);

  const fronts = FRONTS[spec.slug] ?? {};
  const colorImages = new Map<string, string[]>();
  for (const cs of colorDirs) {
    const imgs = await listImages(path.join(dir, cs));
    if (!imgs.length) continue;
    // put the chosen front photo first so it becomes the color's hero / primary
    const front = fronts[cs];
    if (front) {
      const i = imgs.indexOf(front);
      if (i > 0) imgs.unshift(imgs.splice(i, 1)[0]);
    }
    colorImages.set(cs, imgs);
  }
  const total = [...colorImages.values()].reduce((a, b) => a + b.length, 0);
  if (total === 0) {
    console.log(`[skip] ${spec.slug}: no images`);
    return;
  }

  const brand = await prisma.brand.findUnique({ where: { slug: spec.brandSlug } });
  if (!brand) throw new Error(`brand not found: ${spec.brandSlug}`);

  // idempotent
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
      gender: "UNISEX",
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

  // Variants: 1 per (color × size). Color = sub-folder slug.
  const colorList = [...colorImages.keys()].map((cs) => ({
    slug: cs,
    name: colorLabel(cs),
    hex: HEX[cs] || (console.warn(`  [warn] no hex for "${cs}" -> #888`), "#888888"),
  }));
  const variants = colorList.flatMap((c) =>
    SIZES.map((size) => ({
      productId: product.id,
      size,
      color: c.name,
      colorHex: c.hex,
      price: PRICE,
      stock: STOCK,
      isActive: true,
    }))
  );
  await prisma.productVariant.createMany({ data: variants });

  // Images tagged by color
  let sort = 0;
  let uploaded = 0;
  for (const [colorSlug, files] of colorImages) {
    const colorName = colorLabel(colorSlug);
    for (const file of files) {
      const url = await uploadLocal(
        path.join(dir, colorSlug, file),
        `${spec.slug}-${colorSlug}-${fileSlug(file)}.jpg`
      );
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          color: colorName,
          sortOrder: sort++,
          isPrimary: sort === 1,
          altText: `${spec.name} — ${colorName}`,
        },
      });
      uploaded++;
    }
  }
  console.log(
    `  + ${spec.name}: ${colorList.length} colors (${colorList.map((c) => c.name).join(", ")}), ${variants.length} variants, ${uploaded} images`
  );
}

async function main() {
  await ensureBrand("the-north-face", "The North Face", "Marque outdoor américaine — vestes, sacs et accessoires techniques.");
  await ensureBrand("canada-goose", "Canada Goose", "Marque canadienne de vêtements techniques grand froid.");
  console.log("brands ok");

  const caps = await ensureCapsCategory();
  const capsBeanies = await prisma.category.findUnique({ where: { slug: "caps-beanies" } });
  const categoryIds = [caps.id, capsBeanies?.id].filter(Boolean) as string[];
  console.log(`category 'caps' ok (id ${caps.id}); linking to ${categoryIds.length} categories`);

  for (const spec of SPECS) {
    try {
      await importSpec(spec, categoryIds);
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
