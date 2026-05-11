import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(process.cwd(), "photos", "Baskets", "mizuno_vrac", "MIZUNO RACER S OARISM");
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 80;
const STOCK = 999;

type ColorVariant = { color: string; hex: string; fileIds: string[] };

function range(start: number, end: number): string[] {
  const arr: string[] = [];
  for (let i = start; i <= end; i++) arr.push(String(i));
  return arr;
}

const VARIANTS: ColorVariant[] = [
  { color: "Cream Light Blue", hex: "#cfe6ec", fileIds: range(543, 551) },
  { color: "White Red Black",  hex: "#e8e8e8", fileIds: range(552, 560) },
  { color: "Black Mint",       hex: "#1a2a26", fileIds: range(561, 569) },
  { color: "Gray Purple",      hex: "#a89fb0", fileIds: range(570, 578) },
  { color: "Sage Teal Navy",   hex: "#5a6b5a", fileIds: range(579, 587) },
];

const PRIMARY_COLOR = "Cream Light Blue";
const PRIMARY_FILE = "543";

async function buildFileIndex(): Promise<Map<string, string>> {
  const entries = await fs.readdir(SOURCE);
  const map = new Map<string, string>();
  for (const e of entries) {
    const m = e.match(/_(\d+)_2\.(jpe?g|png|webp)$/i);
    if (m) map.set(m[1], e);
  }
  return map;
}

async function uploadImage(absPath: string, filename: string): Promise<string> {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(filename).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: mime, size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

async function main() {
  console.log("🌱 Creating Mizuno Racer S Oarism...\n");

  const brand = await prisma.brand.findUnique({ where: { slug: "mizuno" } });
  if (!brand) throw new Error("Brand 'mizuno' not found");

  const SLUG = "racer-s-oarism";
  const SKU = "MZ-RACER-S";
  const NAME = "Racer S Oarism";

  const existing = await prisma.product.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`Removing existing "${NAME}"...`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: NAME,
      slug: SLUG,
      sku: SKU,
      description:
        "Racer S Oarism — silhouette running technique des années 2000, mesh respirant et plaque Wave signature. Look retro racer, amorti tonique.",
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isActive: true,
    },
  });
  console.log(`Created "${NAME}"`);

  const cat = await prisma.category.findUnique({ where: { slug: "road-running" } });
  if (cat) await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });

  const fileIndex = await buildFileIndex();

  const variantData = VARIANTS.flatMap((v) =>
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
  console.log(`+${variantData.length} variants`);

  let sort = 0, uploaded = 0, missing = 0;
  const imageRecords: { productId: string; url: string; color: string; sortOrder: number; isPrimary: boolean; altText: string }[] = [];

  for (const v of VARIANTS) {
    for (const id of v.fileIds) {
      const filename = fileIndex.get(id);
      if (!filename) { missing++; continue; }
      const abs = path.join(SOURCE, filename);
      const url = await uploadImage(abs, `racer-${v.color.replace(/\s+/g, "-").toLowerCase()}-${id}.jpg`);
      imageRecords.push({
        productId: product.id, url, color: v.color, sortOrder: sort++,
        isPrimary: v.color === PRIMARY_COLOR && id === PRIMARY_FILE,
        altText: `${NAME} ${v.color}`,
      });
      uploaded++;
    }
  }
  await prisma.productImage.createMany({ data: imageRecords });
  console.log(`+${uploaded} images${missing ? `, ${missing} missing` : ""}`);
  console.log("✅ Done");
}

main().catch((e) => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
