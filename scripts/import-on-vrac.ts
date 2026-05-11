import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE = path.join(process.cwd(), "photos", "Baskets", "On", "on_vrac");
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 80;
const STOCK = 999;

type ColorVariant = {
  color: string;
  hex: string;
  fileIds: string[]; // suffix numbers from filename
};

// 9 new color variants for the existing Cloud product, 9 images each
const NEW_COLORS: ColorVariant[] = [
  {
    color: "Frost Royal",
    hex: "#d8dde6",
    fileIds: ["211", "212", "213", "214", "215", "216", "217", "218", "219"],
  },
  {
    color: "Sand",
    hex: "#d4c5a0",
    fileIds: ["220", "221", "222", "223", "224", "225", "226", "227", "228"],
  },
  {
    color: "Lavender",
    hex: "#d6c0d4",
    fileIds: ["229", "230", "231", "232", "233", "234", "235", "236", "237"],
  },
  {
    color: "Bone Gum",
    hex: "#ede4d3",
    fileIds: ["238", "239", "240", "241", "242", "243", "244", "245", "246"],
  },
  {
    color: "Loewe Stone Gray",
    hex: "#9aa0a8",
    fileIds: ["247", "248", "249", "250", "251", "252", "253", "254", "255"],
  },
  {
    color: "Loewe Onyx",
    hex: "#1a1a1a",
    fileIds: ["256", "257", "258", "259", "260", "261", "262", "263", "264"],
  },
  {
    color: "Loewe Sage",
    hex: "#86a877",
    fileIds: ["265", "266", "267", "268", "269", "270", "271", "272", "273"],
  },
  {
    color: "Loewe Ivory",
    hex: "#f0eadf",
    fileIds: ["274", "275", "276", "277", "278", "279", "280", "281", "282"],
  },
  {
    color: "Black Mesh",
    hex: "#2a2a2a",
    fileIds: ["283", "284", "285", "286", "287", "288", "289", "290", "291"],
  },
];

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
  console.log("🌱 Adding On Cloud variants from vrac...\n");

  const product = await prisma.product.findUnique({
    where: { slug: "cloud" },
    include: { variants: true, images: true },
  });
  if (!product) throw new Error('Product "cloud" not found — run import-photos first');

  const fileIndex = await buildFileIndex();

  // Drop only the colors we're about to add (so re-running is safe)
  const newColorNames = NEW_COLORS.map((c) => c.color);
  const removedVariants = await prisma.productVariant.deleteMany({
    where: { productId: product.id, color: { in: newColorNames } },
  });
  const removedImages = await prisma.productImage.deleteMany({
    where: { productId: product.id, color: { in: newColorNames } },
  });
  if (removedVariants.count || removedImages.count) {
    console.log(`Cleaned previous run: -${removedVariants.count} variants, -${removedImages.count} images`);
  }

  // Variants (size × color)
  const variantData = NEW_COLORS.flatMap((v) =>
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
  console.log(`+${variantData.length} variants (${NEW_COLORS.length} new colors × ${SIZES.length} sizes)`);

  // Compute next sortOrder so new images appear after existing ones
  const maxSort = product.images.reduce((m, img) => Math.max(m, img.sortOrder), -1);
  let sort = maxSort + 1;

  // Images — never set isPrimary (the existing Cloud already has its primary)
  const imageRecords: { productId: string; url: string; color: string; sortOrder: number; isPrimary: boolean; altText: string }[] = [];
  let uploaded = 0;
  let missing = 0;

  for (const v of NEW_COLORS) {
    for (const id of v.fileIds) {
      const filename = fileIndex.get(id);
      if (!filename) {
        console.warn(`  ⚠️  Missing file ID ${id} (${v.color})`);
        missing++;
        continue;
      }
      const abs = path.join(SOURCE, filename);
      const url = await uploadImage(abs, `cloud-${v.color.replace(/\s+/g, "-").toLowerCase()}-${id}.jpg`);
      imageRecords.push({
        productId: product.id,
        url,
        color: v.color,
        sortOrder: sort++,
        isPrimary: false,
        altText: `Cloud ${v.color}`,
      });
      uploaded++;
    }
  }

  await prisma.productImage.createMany({ data: imageRecords });
  console.log(`+${uploaded} images${missing ? `, ${missing} missing` : ""}`);

  // Verify totals
  const after = await prisma.product.findUnique({
    where: { id: product.id },
    select: { _count: { select: { variants: true, images: true } } },
  });
  console.log(`\nCloud now has: ${after?._count.variants} variants, ${after?._count.images} images`);
  console.log("✅ Done");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
