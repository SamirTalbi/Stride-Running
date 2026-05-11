import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(process.cwd(), "photos", "Baskets", "newbalance", "740");
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
  { color: "Black Silver",       hex: "#1a1a1a", fileIds: range(407, 415) },
  { color: "Silver Gray",        hex: "#b8b8b8", fileIds: range(416, 424) },
  { color: "Pink White",         hex: "#f0c8d0", fileIds: range(425, 433) },
  { color: "Multi Purple Orange",hex: "#7a3aa8", fileIds: range(434, 442) },
  { color: "Silver Yellow",      hex: "#e8e8a8", fileIds: range(443, 451) },
  { color: "Pink Silver",        hex: "#f0a8b8", fileIds: range(452, 460) },
  { color: "Cream Beige",        hex: "#e6dcc8", fileIds: range(461, 469) },
  { color: "Gray Teal",          hex: "#5a7a8a", fileIds: range(470, 478) },
  { color: "Black Navy Blue",    hex: "#0a1a3a", fileIds: range(479, 487) },
  { color: "Light Gray",         hex: "#cfd2d6", fileIds: range(488, 496) },
  { color: "White Burgundy",     hex: "#7a1a2a", fileIds: range(497, 505) },
  { color: "Triple Black",       hex: "#000000", fileIds: range(506, 514) },
  { color: "White Blue",         hex: "#3a78d4", fileIds: range(515, 523) },
  { color: "Cream Green",        hex: "#a8b890", fileIds: range(524, 532) },
  { color: "Classic Gray",       hex: "#8a8e92", fileIds: range(533, 541) },
];

const PRIMARY_COLOR = "Silver Gray";
const PRIMARY_FILE = "421";

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
  console.log("🌱 Creating New Balance 740 product...\n");

  const brand = await prisma.brand.findUnique({ where: { slug: "new-balance" } });
  if (!brand) throw new Error("Brand 'new-balance' not found");

  const SLUG = "740";
  const SKU = "NB-740";
  const NAME = "740";

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
        "740 — silhouette running 2000s revival, mesh aéré, inserts métallisés, amorti ABZORB. La basket retro-tech à coloris multiples.",
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isActive: true,
    },
  });
  console.log(`Created "${NAME}"`);

  // Categorize as road-running
  const cat = await prisma.category.findUnique({ where: { slug: "road-running" } });
  if (cat) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
  }

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
  console.log(`+${variantData.length} variants (${VARIANTS.length} colors × ${SIZES.length} sizes)`);

  let sort = 0;
  let uploaded = 0;
  let missing = 0;
  const imageRecords: { productId: string; url: string; color: string; sortOrder: number; isPrimary: boolean; altText: string }[] = [];

  for (const v of VARIANTS) {
    for (const id of v.fileIds) {
      const filename = fileIndex.get(id);
      if (!filename) {
        console.warn(`  ⚠️  Missing file ID ${id} (${v.color})`);
        missing++;
        continue;
      }
      const abs = path.join(SOURCE, filename);
      const url = await uploadImage(abs, `740-${v.color.replace(/\s+/g, "-").toLowerCase()}-${id}.jpg`);
      const isPrimary = v.color === PRIMARY_COLOR && id === PRIMARY_FILE;
      imageRecords.push({
        productId: product.id,
        url,
        color: v.color,
        sortOrder: sort++,
        isPrimary,
        altText: `740 ${v.color}`,
      });
      uploaded++;
    }
  }
  await prisma.productImage.createMany({ data: imageRecords });
  console.log(`+${uploaded} images${missing ? `, ${missing} missing` : ""}`);

  console.log("\n✅ Done");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
