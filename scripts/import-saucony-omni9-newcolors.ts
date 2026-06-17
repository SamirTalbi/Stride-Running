import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const SOURCE_DIR = path.join(
  process.cwd(),
  "Photos",
  "Baskets",
  "Saucony a chercher"
);

const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 75;
const STOCK = 1;
const PRODUCT_SLUG = "progrid-omni-9";

type NewColor = {
  filename: string;
  color: string;
  hex: string;
};

// One color per user photo. The Keith Haring NYC (20.25.44.jpeg) is its own
// product (imported separately) and is NOT in this list.
const NEW_COLORS: NewColor[] = [
  {
    filename: "WhatsApp Image 2026-05-19 at 20.25.43.jpeg",
    color: "Sky Blue Silver",
    hex: "#9ec4d9",
  },
  {
    filename: "WhatsApp Image 2026-05-19 at 20.25.43 (1).jpeg",
    color: "Marble Multicolor",
    hex: "#7a90a8",
  },
  {
    filename: "WhatsApp Image 2026-05-19 at 20.25.43 (2).jpeg",
    color: "Love White Pink",
    hex: "#f4b8d4",
  },
  {
    filename: "WhatsApp Image 2026-05-19 at 20.25.44 (1).jpeg",
    color: "Teal Green",
    hex: "#3a8a8a",
  },
  {
    filename: "WhatsApp Image 2026-05-19 at 20.25.44 (2).jpeg",
    color: "Tan Brown Green",
    hex: "#a88060",
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
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
  console.log(`Adding ${NEW_COLORS.length} new colorways to ProGrid Omni 9...\n`);

  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    include: { variants: true, images: true },
  });
  if (!product) throw new Error(`Product '${PRODUCT_SLUG}' not found`);

  const existingColors = new Set(product.variants.map((v) => v.color));
  let totalVariants = 0;
  let totalImages = 0;

  for (const c of NEW_COLORS) {
    if (existingColors.has(c.color)) {
      console.log(`  [skip] "${c.color}" already exists`);
      continue;
    }

    const absPath = path.join(SOURCE_DIR, c.filename);
    try {
      await fs.access(absPath);
    } catch {
      console.warn(`  [warn] Source photo missing: ${c.filename}`);
      continue;
    }

    // Variants (8 sizes for this color)
    await prisma.productVariant.createMany({
      data: SIZES.map((size) => ({
        productId: product.id,
        size,
        color: c.color,
        colorHex: c.hex,
        price: PRICE,
        stock: STOCK,
        isActive: true,
      })),
    });

    // Image tagged with the color
    const url = await uploadLocal(
      absPath,
      `${PRODUCT_SLUG}-${colorSlug(c.color)}.jpeg`
    );
    const sortOrder = product.images.length + totalImages;
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: c.color,
        sortOrder,
        isPrimary: false,
        altText: `ProGrid Omni 9 ${c.color}`,
      },
    });

    totalVariants += SIZES.length;
    totalImages += 1;
    console.log(`  [ok]   "${c.color}" — ${SIZES.length} variants + 1 image`);
  }

  console.log(`\nTotal added: ${totalVariants} variants, ${totalImages} images`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
