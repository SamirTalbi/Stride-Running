import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const PRODUCT_SLUG = "progrid-omni-9";

// For each user colorway, add 3 supplementary images from the closest noirfonce
// match (silhouette identical, colorway slightly different — accepted by user).
// The user's original WhatsApp photo stays as the primary image.
const ENRICH: { color: string; sourceLabel: string; urls: string[] }[] = [
  {
    color: "Sky Blue Silver",
    sourceLabel: "White Navy S70832-12",
    urls: [
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-12_1.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-12_2.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-12_3.jpg",
    ],
  },
  {
    color: "Marble Multicolor",
    sourceLabel: "Wisteria S71034-2",
    urls: [
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S71034-2_1.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S71034-2_2.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S71034-2_3.jpg",
    ],
  },
  {
    color: "Love White Pink",
    sourceLabel: "Coral S70739-26",
    urls: [
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70739-26_1.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70739-26_2.jpg",
    ],
  },
  {
    color: "Teal Green",
    sourceLabel: "Pine Green S70739-56",
    urls: [
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70739-56_1.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70739-56_2.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70739-56_3.jpg",
    ],
  },
  {
    color: "Tan Brown Green",
    sourceLabel: "Brown S70832-9",
    urls: [
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-9_1.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-9_2.jpg",
      "https://cdn.shopify.com/s/files/1/0933/1060/files/Saucony_Progrid_Omni_9_S70832-9_3.jpg",
    ],
  },
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
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) throw new Error("ProGrid Omni 9 not found");

  let totalAdded = 0;
  for (const e of ENRICH) {
    const existingForColor = product.images.filter((i) => i.color === e.color);
    if (existingForColor.length > 1) {
      console.log(`[skip] "${e.color}" already has ${existingForColor.length} images`);
      continue;
    }
    console.log(`\n${e.color} (source: ${e.sourceLabel})`);
    let nextSort = await prisma.productImage.count({ where: { productId: product.id } });
    for (let i = 0; i < e.urls.length; i++) {
      const url = await uploadRemote(
        e.urls[i],
        `${PRODUCT_SLUG}-${colorSlug(e.color)}-supp-${i + 1}.jpg`
      );
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          color: e.color,
          sortOrder: nextSort + i,
          isPrimary: false,
          altText: `ProGrid Omni 9 ${e.color}`,
        },
      });
      totalAdded++;
      console.log(`  + image ${i + 1}`);
    }
  }
  console.log(`\nTotal added: ${totalAdded} images.`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
