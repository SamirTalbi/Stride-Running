import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const PHOTOS = path.join(process.cwd(), "Photos");
const SIZES = ["S", "M", "L", "XL", "XXL"];
const PRICE = 45;
const STOCK = 1;
const BRAND_SLUG = "salomon";

type ImageSpec = { file: string; color?: string; folder: string };

type ProductSpec = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  categorySlug: string;
  colorways: { name: string; hex: string }[];
  images: ImageSpec[];
  searchKeywords: string[];
};

const SPECS: ProductSpec[] = [
  {
    name: "Salomon T-shirt Big Logo",
    slug: "salomon-tshirt-big-logo",
    sku: "SAL-TSH-BIG",
    description: "T-shirt Salomon coton coupe regular avec gros logo SALOMON imprimé devant.",
    categorySlug: "tops",
    colorways: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#ffffff" },
    ],
    images: [
      { file: "duo.jpeg", folder: "Tshirt/Salomon" },
      { file: "duo2.jpeg", folder: "Tshirt/Salomon" },
    ],
    searchKeywords: ["salomon", "tshirt", "big logo"],
  },
  {
    name: "Salomon T-shirt Mountain Expand Your Horizons",
    slug: "salomon-tshirt-mountain-expand-horizons",
    sku: "SAL-TSH-MNT",
    description: "T-shirt Salomon en coton avec print montagne + lettrage \"EXPAND YOUR HORIZONS\" au dos.",
    categorySlug: "tops",
    colorways: [
      { name: "Black", hex: "#111111" },
      { name: "Beige", hex: "#c8b896" },
      { name: "Cream", hex: "#e8dccc" },
    ],
    images: [
      { file: "trio.jpeg", folder: "Tshirt/Salomon" },
    ],
    searchKeywords: ["salomon", "tshirt", "mountain", "expand horizons", "print"],
  },
  {
    name: "Salomon T-shirt Minimal Logo",
    slug: "salomon-tshirt-minimal-logo",
    sku: "SAL-TSH-MIN",
    description: "T-shirt Salomon coton avec petit logo poitrine + gros logo \"SALOMON Born In The French Alps\" au dos.",
    categorySlug: "tops",
    colorways: [
      { name: "White", hex: "#ffffff" },
      { name: "Navy", hex: "#1a2a3a" },
    ],
    images: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.12.jpeg", color: "White", folder: "Tshirt/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.15.jpeg", color: "White", folder: "Tshirt/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.16.jpeg", color: "Navy",  folder: "Tshirt/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.17.jpeg", color: "Navy",  folder: "Tshirt/Salomon" },
    ],
    searchKeywords: ["salomon", "tshirt", "minimal"],
  },
  {
    name: "Salomon Pull Crewneck",
    slug: "salomon-pull-crewneck",
    sku: "SAL-PUL-CRW",
    description: "Pull Salomon col rond en tissu technique léger, logo SALOMON \"Born In The French Alps\" imprimé au dos.",
    categorySlug: "hoodies",
    colorways: [
      { name: "Orange", hex: "#e85c1a" },
      { name: "Grey",   hex: "#5a5a5e" },
      { name: "Black",  hex: "#111111" },
    ],
    images: [
      { file: "orange_dos.jpeg",                                color: "Orange", folder: "Pulls/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.09.jpeg",     color: "Orange", folder: "Pulls/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.11.jpeg",     color: "Grey",   folder: "Pulls/Salomon" },
      { file: "1.jpeg",                                         color: "Grey",   folder: "Pulls/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.08.jpeg",     color: "Black",  folder: "Pulls/Salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.07.jpeg",     color: "Black",  folder: "Pulls/Salomon" },
      { file: "trio.jpeg",                                                       folder: "Pulls/Salomon" },
    ],
    searchKeywords: ["salomon", "pull", "crewneck", "sweat"],
  },
  {
    name: "Salomon Pull Anorak Zip Poche",
    slug: "salomon-pull-anorak-zip-poche",
    sku: "SAL-PUL-ANK",
    description: "Pull anorak Salomon en tissu technique imperméable, poche zippée poitrine signature, ourlet ajustable par cordon.",
    categorySlug: "hoodies",
    colorways: [
      { name: "Black", hex: "#111111" },
    ],
    images: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.16.jpeg", color: "Black", folder: "veste/salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.17.jpeg", color: "Black", folder: "veste/salomon" },
      { file: "WhatsApp Image 2026-05-19 at 20.31.18.jpeg", color: "Black", folder: "veste/salomon" },
    ],
    searchKeywords: ["salomon", "pull", "anorak", "zip", "technique"],
  },
  {
    name: "Salomon Veste GTX Hooded",
    slug: "salomon-veste-gtx-hooded",
    sku: "SAL-VES-GTX",
    description: "Veste Salomon GORE-TEX à capuche imperméable, panneaux ergonomiques, logo \"S\" + \"SALOMON\" imprimé au dos.",
    categorySlug: "jackets",
    colorways: [
      { name: "Grey", hex: "#5a5a5e" },
      { name: "Tan",  hex: "#a8804a" },
    ],
    images: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.19.jpeg", folder: "veste/salomon" },
    ],
    searchKeywords: ["salomon", "veste", "gtx", "gore-tex", "hooded"],
  },
  {
    name: "Salomon Short",
    slug: "salomon-short",
    sku: "SAL-SHO",
    description: "Short Salomon en tissu technique léger, ceinture élastique, logo Salomon couleur au bas de jambe.",
    categorySlug: "shorts",
    colorways: [
      { name: "Navy",  hex: "#1a2a3a" },
      { name: "Beige", hex: "#d4c4a8" },
    ],
    images: [
      { file: "WhatsApp Image 2026-05-19 at 20.31.18.jpeg", folder: "Short/Salomon" },
    ],
    searchKeywords: ["salomon", "short", "running"],
  },
];

async function uploadLocal(absPath: string, filename: string) {
  const buffer = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: mime, size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

function fileSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function importSpec(spec: ProductSpec) {
  console.log(`\n=== ${spec.name} ===`);

  const brand = await prisma.brand.findUnique({ where: { slug: BRAND_SLUG } });
  if (!brand) throw new Error("Brand salomon not found");

  // Idempotent
  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log("  Removing existing...");
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

  const cat = await prisma.category.findUnique({ where: { slug: spec.categorySlug } });
  if (cat) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
  }

  const variants = spec.colorways.flatMap((c) =>
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
  console.log(`  ${variants.length} variants (${spec.colorways.length} colors × ${SIZES.length} sizes)`);

  let sort = 0;
  let uploaded = 0;
  for (const img of spec.images) {
    const absPath = path.join(PHOTOS, img.folder, img.file);
    try {
      await fs.access(absPath);
    } catch {
      console.warn(`  [warn] missing: ${img.folder}/${img.file}`);
      continue;
    }
    const url = await uploadLocal(absPath, `${spec.slug}-${fileSlug(img.file)}.jpeg`);
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: img.color ?? null,
        sortOrder: sort++,
        isPrimary: sort === 1,
        altText: `${spec.name}${img.color ? " " + img.color : ""}`,
      },
    });
    uploaded++;
  }
  console.log(`  ${uploaded} images uploaded`);
}

async function main() {
  for (const spec of SPECS) {
    await importSpec(spec);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error("Import failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
