import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const LOCAL_PHOTO = path.join(
  process.cwd(),
  "Photos",
  "Baskets",
  "Saucony a chercher",
  "WhatsApp Image 2026-05-19 at 20.25.44.jpeg"
);

const REMOTE_IMAGES = [
  "https://snkrdunk.s3.ap-northeast-1.amazonaws.com/en/magazine/wp-content/uploads/2025/02/19105303/Keith-Haring-x-Saucony-ProGrid-Triumph-400002.webp",
  "https://snkrdunk.s3.ap-northeast-1.amazonaws.com/en/magazine/wp-content/uploads/2025/02/19105258/Keith-Haring-x-Saucony-ProGrid-Triumph-400001.webp",
  "https://snkrdunk.s3.ap-northeast-1.amazonaws.com/en/magazine/wp-content/uploads/2025/02/19110814/Keith-Haring-x-Saucony-ProGrid-Triumph-400007-1024x977.webp",
  "https://snkrdunk.s3.ap-northeast-1.amazonaws.com/en/magazine/wp-content/uploads/2025/02/19105312/Keith-Haring-x-Saucony-ProGrid-Triumph-400005.webp",
];

const SLUG = "saucony-progrid-triumph-4-keith-haring-nyc";
const SKU = "SC-PT4-KH-NYC";
const NAME = "ProGrid Triumph 4 × Keith Haring NYC";
const COLOR = "Black / Orange NYC";
const COLOR_HEX = "#111111";
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 75;
const STOCK = 1;

async function uploadLocalFile(absPath: string, baseFilename: string) {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: {
      filename: baseFilename,
      mimeType: mime,
      size: buffer.length,
      folder: "products",
      data: base64,
    },
  });
  return `/api/media/${media.id}`;
}

async function uploadRemote(url: string, baseFilename: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Referer: new URL(url).origin },
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = ct.startsWith("image/")
    ? ct.split(";")[0].trim()
    : url.toLowerCase().includes(".webp")
    ? "image/webp"
    : "image/jpeg";
  const base64 = `data:${mime};base64,${buf.toString("base64")}`;
  const media = await prisma.media.create({
    data: {
      filename: baseFilename,
      mimeType: mime,
      size: buf.length,
      folder: "products",
      data: base64,
    },
  });
  return `/api/media/${media.id}`;
}

async function main() {
  console.log(`Importing "${NAME}"...`);

  const brand = await prisma.brand.findUnique({ where: { slug: "saucony" } });
  if (!brand) throw new Error("Brand 'saucony' not found");

  const existing = await prisma.product.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`  Removing existing product...`);
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: NAME,
      slug: SLUG,
      sku: SKU,
      description:
        "La ProGrid Triumph 4 réinterprétée par la succession Keith Haring. Édition NYC capsule : mesh noir, semelle orange MTA, accents bleu ciel et artwork « New York » + Dancing Figure signature.",
      longDescription:
        "Collaboration officielle entre Saucony et la succession de Keith Haring, cette ProGrid Triumph 4 « NYC » rend hommage à New York avec l'iconique silhouette d'amorti ProGrid de 2007. Mesh respirant, panneaux synthétiques, ArchLock, semelle orange MTA et talon bleu ciel signature, le tout rehaussé d'artwork Keith Haring (Dancing Figure, pomme et lettrage manuscrit « New York »).",
      brandId: brand.id,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "HIGH",
      stability: "NEUTRAL",
      features: ["ProGrid cushioning", "Arch-Lock", "Mesh respirant", "Artwork Keith Haring", "Édition limitée NYC"],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      searchKeywords: ["saucony", "keith haring", "triumph 4", "nyc", "new york", "collab"],
      isActive: true,
    },
  });

  const cat = await prisma.category.findUnique({ where: { slug: "road-running" } });
  if (cat) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId: cat.id },
    });
  }

  // Variants: 8 sizes × 1 color
  const variantData = SIZES.map((size) => ({
    productId: product.id,
    size,
    color: COLOR,
    colorHex: COLOR_HEX,
    price: PRICE,
    stock: STOCK,
    isActive: true,
  }));
  await prisma.productVariant.createMany({ data: variantData });
  console.log(`  ${variantData.length} variants (${SIZES.length} sizes × 1 color)`);

  // Images: local user photo first (as fallback origin), then remote
  const localUrl = await uploadLocalFile(LOCAL_PHOTO, `${SLUG}-original.jpeg`);
  const remoteUrls = await Promise.all(
    REMOTE_IMAGES.map((u, i) => uploadRemote(u, `${SLUG}-${i + 1}.webp`))
  );

  const allUrls = [...remoteUrls, localUrl];
  await prisma.productImage.createMany({
    data: allUrls.map((url, i) => ({
      productId: product.id,
      url,
      color: COLOR,
      sortOrder: i,
      isPrimary: i === 0,
      altText: `${NAME} ${COLOR}`,
    })),
  });
  console.log(`  ${allUrls.length} images uploaded (1 local + ${remoteUrls.length} remote)`);
  console.log(`\nDone. Product slug: /products/${SLUG}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
