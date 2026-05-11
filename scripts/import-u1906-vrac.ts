import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(process.cwd(), "photos", "Baskets", "newbalance", "U1906");
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 80;
const STOCK = 999;

type ColorVariant = { color: string; hex: string; fileIds: string[] };

const VARIANTS: ColorVariant[] = [
  { color: "Silver Blue Mint",  hex: "#c8d2dc", fileIds: ["342", "343", "344", "345", "346", "347", "348", "349", "350"] },
  { color: "Black Green",       hex: "#2a3a2a", fileIds: ["351", "352", "353", "354", "355", "356", "357", "358", "359"] },
  { color: "Black Pink",        hex: "#3a1a2a", fileIds: ["360", "361", "362", "363", "364", "365", "366", "367", "368"] },
  { color: "Black",             hex: "#111111", fileIds: ["369", "370", "371", "372", "373", "374", "375", "376", "377"] },
  { color: "Cream Yellow",      hex: "#e8dfb8", fileIds: ["378", "379", "380", "381", "382", "383", "384", "385", "386"] },
  { color: "Black Gray Yellow", hex: "#3a3a3a", fileIds: ["387", "388", "389", "390", "391", "392", "393", "394", "395"] },
  { color: "Gray Yellow",       hex: "#aab0b0", fileIds: ["396", "397", "398", "399", "400", "401", "402", "403", "404"] },
];

const PRIMARY_COLOR = "Silver Blue Mint";
const PRIMARY_FILE = "342";

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
  console.log("🌱 Updating New Balance U1906 with vrac variants...\n");

  // Find existing 1906 product (the user wants to keep it)
  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: { contains: "1906" } }, { name: { contains: "1906" } }] },
  });
  if (!existing) throw new Error("Existing U1906 product not found");

  // Wipe placeholder variants/images, clean up name+slug
  await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
  await prisma.productImage.deleteMany({ where: { productId: existing.id } });

  // Ensure desired slug is free (in case of leftover)
  const slugInUse = await prisma.product.findUnique({ where: { slug: "u1906" } });
  if (slugInUse && slugInUse.id !== existing.id) {
    await prisma.product.delete({ where: { id: slugInUse.id } });
  }

  const nbBrand = await prisma.brand.findUnique({ where: { slug: "new-balance" } });

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: "U1906",
      slug: "u1906",
      sku: "NB-U1906",
      description:
        "U1906 — silhouette running technique des années 2000 réinterprétée. Mesh respirant, inserts métallisés et amorti N-ergy/ABZORB pour un look retro tonique.",
      brandId: nbBrand?.id ?? existing.brandId,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isActive: true,
    },
  });
  console.log(`Cleaned up product: ${product.name} (${product.slug})`);

  // Make sure road-running category is attached
  const cat = await prisma.category.findUnique({ where: { slug: "road-running" } });
  if (cat) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
      update: {},
      create: { productId: product.id, categoryId: cat.id },
    });
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
      const url = await uploadImage(abs, `u1906-${v.color.replace(/\s+/g, "-").toLowerCase()}-${id}.jpg`);
      const isPrimary = v.color === PRIMARY_COLOR && id === PRIMARY_FILE;
      imageRecords.push({
        productId: product.id,
        url,
        color: v.color,
        sortOrder: sort++,
        isPrimary,
        altText: `U1906 ${v.color}`,
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
