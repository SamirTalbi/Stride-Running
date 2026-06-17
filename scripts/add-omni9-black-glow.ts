import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const PRODUCT_SLUG = "progrid-omni-9";
const COLOR = "Black Glow";
const COLOR_HEX = "#1a1a1a";
const SIZES = ["39", "40", "41", "42", "43", "44", "45", "46"];
const PRICE = 75;
const STOCK = 1;

const REMOTE_IMAGES = [
  "https://noirfonce.eu/cdn/shop/files/Saucony_Progrid_Omni_9_Black_Glow_S70934-3_1.jpg?v=1750926511&width=1445",
  "https://noirfonce.eu/cdn/shop/files/Saucony_Progrid_Omni_9_Black_Glow_S70934-3_2.jpg?v=1750926523&width=1445",
  "https://noirfonce.eu/cdn/shop/files/Saucony_Progrid_Omni_9_Black_Glow_S70934-3_3.jpg?v=1750926536&width=1445",
  "https://noirfonce.eu/cdn/shop/files/Saucony_Progrid_Omni_9_Black_Glow_S70934-3_4.jpg?v=1750926546&width=1445",
];

async function uploadRemote(url: string, filename: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Referer: new URL(url).origin },
  });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = ct.startsWith("image/") ? ct.split(";")[0].trim() : "image/jpeg";
  const base64 = `data:${mime};base64,${buf.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: mime, size: buf.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

function colorSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    include: { variants: true },
  });
  if (!product) throw new Error("ProGrid Omni 9 product not found");

  const existing = new Set(product.variants.map((v) => v.color));
  if (existing.has(COLOR)) {
    console.log(`Color "${COLOR}" already exists. Aborting to avoid duplicate.`);
    return;
  }

  // Variants
  await prisma.productVariant.createMany({
    data: SIZES.map((size) => ({
      productId: product.id,
      size,
      color: COLOR,
      colorHex: COLOR_HEX,
      price: PRICE,
      stock: STOCK,
      isActive: true,
    })),
  });
  console.log(`+ ${SIZES.length} variants for "${COLOR}"`);

  // Images
  const baseSort = await prisma.productImage.count({ where: { productId: product.id } });
  let added = 0;
  for (let i = 0; i < REMOTE_IMAGES.length; i++) {
    const url = await uploadRemote(
      REMOTE_IMAGES[i],
      `${PRODUCT_SLUG}-${colorSlug(COLOR)}-${i + 1}.jpg`
    );
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: COLOR,
        sortOrder: baseSort + i,
        isPrimary: false,
        altText: `ProGrid Omni 9 ${COLOR}`,
      },
    });
    added++;
  }
  console.log(`+ ${added} images uploaded`);
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
