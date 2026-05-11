import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(process.cwd(), "photos", "Baskets", "mizuno_vrac");
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 80;
const STOCK = 999;

type ColorVariant = {
  color: string;
  hex: string;
  files: string[]; // numeric IDs without padding, will resolve to actual filename
};

// Mapping: color name → image ID list (the suffix number in the filename)
const VARIANTS: ColorVariant[] = [
  { color: "Black",            hex: "#111111", files: ["292", "293", "294"] },
  { color: "White Silver",     hex: "#e8e8e8", files: ["299", "300"] },
  { color: "Gunmetal",         hex: "#4a4a52", files: ["301", "302"] },
  { color: "Navy",             hex: "#1e3a5f", files: ["303", "304"] },
  { color: "Stone Green",      hex: "#c8c2a8", files: ["305", "306"] },
  { color: "Black Green",      hex: "#2a4a2a", files: ["307", "308", "309"] },
  { color: "Gray",             hex: "#9ca3af", files: ["310", "311"] },
  { color: "Cream Silver",     hex: "#e6dcc8", files: ["312", "313", "314"] },
  { color: "Lavender Pink",    hex: "#a89bb5", files: ["298", "315", "316", "317", "318", "319", "320", "321", "322"] },
  { color: "Black Silver",     hex: "#2a2a2a", files: ["323", "324", "325", "326", "327", "328", "329", "330", "331", "332"] },
  { color: "Black Neon Green", hex: "#1a1a1a", files: ["333", "334", "335", "336", "337", "338", "339", "340", "341"] },
];

// Variant chosen as the cover (most photogenic) and which file is the hero
const PRIMARY_COLOR = "Black Silver";
const PRIMARY_FILE = "323";

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
  console.log("🌱 Importing Mizuno Wave Prophecy from vrac...\n");

  const brand = await prisma.brand.findUnique({ where: { slug: "mizuno" } });
  if (!brand) throw new Error("Brand 'mizuno' not found");

  const fileIndex = await buildFileIndex();

  const SLUG = "wave-prophecy";
  const SKU = "MZ-WPRO";
  const NAME = "Wave Prophecy";

  // Idempotent: drop if exists
  const existing = await prisma.product.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`Removing existing "${NAME}"...`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  console.log(`Creating "${NAME}"...`);
  const product = await prisma.product.create({
    data: {
      name: NAME,
      slug: SLUG,
      sku: SKU,
      description:
        "Mizuno Wave Prophecy — la plaque Infinity Wave signature, retour de l'énergie permanent. Look futuriste, amorti unique, allure intemporelle.",
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MAX",
      stability: "NEUTRAL",
      isActive: true,
    },
  });

  // Categorize as road-running
  const cat = await prisma.category.findUnique({ where: { slug: "road-running" } });
  if (cat) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
  }

  // Variants (size × color)
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
  console.log(`  ${variantData.length} variants (${VARIANTS.length} colors × ${SIZES.length} sizes)`);

  // Images
  const imageRecords: { productId: string; url: string; color: string; sortOrder: number; isPrimary: boolean; altText: string }[] = [];
  let sort = 0;
  let uploaded = 0;
  let missing = 0;

  for (const v of VARIANTS) {
    for (const id of v.files) {
      const filename = fileIndex.get(id);
      if (!filename) {
        console.warn(`  ⚠️  Missing file ID ${id} (color: ${v.color})`);
        missing++;
        continue;
      }
      const abs = path.join(SOURCE, filename);
      const url = await uploadImage(abs, `${SLUG}-${v.color.replace(/\s+/g, "-").toLowerCase()}-${id}.jpg`);
      const isPrimary = v.color === PRIMARY_COLOR && id === PRIMARY_FILE;
      imageRecords.push({
        productId: product.id,
        url,
        color: v.color,
        sortOrder: sort++,
        isPrimary,
        altText: `${NAME} ${v.color}`,
      });
      uploaded++;
    }
  }

  await prisma.productImage.createMany({ data: imageRecords });
  console.log(`  ${uploaded} images uploaded${missing ? `, ${missing} missing` : ""}`);
  console.log("\n✅ Done");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
