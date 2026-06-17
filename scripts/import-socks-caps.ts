/**
 * Import chaussettes (Nike Everyday Plus, Nike No Show, Jordan Everyday)
 * + casquette Under Armour Blitzing.
 *
 * Les photos sources sont des planches (plusieurs coloris par image). Le script
 * découpe chaque coloris à la volée (sharp) pour que chaque couleur ait sa propre
 * image dans la galerie → couleurs bien séparées. Idempotent (supprime puis recrée).
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

const SOCK_DIR = path.join(process.cwd(), "Photos", "chaussettes");
const UA_SRC = path.join(
  process.cwd(),
  "Photos",
  "casquettes",
  "products",
  "Under",
  "WhatsApp Image 2026-06-14 at 18.21.53.jpeg"
);

const p = (n: number) => path.join(SOCK_DIR, `WhatsApp Image 2026-06-14 at 18.21.53 (${n}).jpeg`);
// La photo (2) (détail pack blanc Everyday Plus) a été renommée par l'utilisateur.
const P2_WHITE = path.join(SOCK_DIR, "image_manquante_pack_3_blanche_longue.jpeg");

// Socquettes Nike Dri-FIT à l'unité + pack des 3 couleurs.
const NK_DF_NOIR = path.join(SOCK_DIR, "noir.png");
const NK_DF_GRIS = path.join(SOCK_DIR, "gris.png");
const NK_DF_BLANC = path.join(SOCK_DIR, "blanche.png");
const NK_DF_PACK3 = path.join(SOCK_DIR, "pack_3.png");

const HEX: Record<string, string> = {
  Sarcelle: "#1f7a7a",
  Blanc: "#f4f4f2",
  Gris: "#6b6f72",
  Terracotta: "#c87d5e",
  "Bleu Gris": "#9aa0c0",
  Noir: "#1a1a1a",
  "Noir logo noir": "#111111",
  "Noir logo blanc": "#2b2b2b",
  "Noir / Gris / Blanc": "#6b7280",
  "Pack 3 Couleurs (Noir + Gris + Blanc)": "#6b7280",
  "Vert Olive": "#6b6e4b",
  Beige: "#cbb89a",
};

type Crop = [number, number, number, number]; // left, top, width, height
type Img = { src: string; crop?: Crop; color: string | null };
type Spec = {
  slug: string;
  name: string;
  sku: string;
  brandSlug: string;
  description: string;
  searchKeywords: string[];
  colors: string[];
  sizes: string[];
  price: number;
  priceByColor?: Record<string, number>; // prix spécifique par couleur (ex : pack plus cher)
  categorySlugs: string[];
  images: Img[];
};

const SPECS: Spec[] = [
  {
    slug: "nike-everyday-plus-chaussettes",
    name: "Nike Everyday Plus — Chaussettes Hautes (x3)",
    sku: "NK-SOCK-EP",
    brandSlug: "nike",
    description:
      "Lot de 3 paires de chaussettes hautes Nike Everyday Plus Cushioned. Tissu Dri-FIT respirant, zones d'amorti renforcées et maintien de la voûte plantaire. Swoosh tissé.",
    searchKeywords: ["nike", "chaussettes", "socks", "everyday", "plus", "dri-fit"],
    colors: ["Sarcelle", "Blanc", "Gris", "Terracotta", "Bleu Gris"],
    sizes: ["41-46"],
    price: 19,
    categorySlugs: ["running-socks"],
    images: [
      { src: p(1), color: null }, // planche coloris = vignette catalogue
      { src: p(1), crop: [10, 20, 345, 385], color: "Sarcelle" },
      { src: p(1), crop: [360, 20, 350, 385], color: "Blanc" },
      { src: P2_WHITE, color: "Blanc" },
      { src: p(1), crop: [720, 20, 355, 385], color: "Gris" },
      { src: p(1), crop: [10, 410, 345, 400], color: "Terracotta" },
      { src: p(1), crop: [360, 410, 350, 400], color: "Bleu Gris" },
    ],
  },
  {
    slug: "nike-everyday-no-show-chaussettes",
    name: "Nike Everyday Cushioned — Socquettes No Show (x3)",
    sku: "NK-SOCK-NS",
    brandSlug: "nike",
    description:
      "Lot de 3 paires de socquettes invisibles Nike Everyday Cushioned No Show. Tissu Dri-FIT, talon antidérapant et amorti sous le pied. Coupe basse invisible dans la chaussure.",
    searchKeywords: ["nike", "chaussettes", "socquettes", "socks", "no show", "invisible", "dri-fit"],
    colors: ["Blanc", "Noir"],
    sizes: ["41-46"],
    price: 19,
    categorySlugs: ["running-socks"],
    images: [
      { src: p(3), color: null },
      { src: p(3), crop: [0, 10, 1280, 630], color: "Blanc" },
      { src: p(3), crop: [0, 645, 1280, 630], color: "Noir" },
    ],
  },
  {
    slug: "nike-dri-fit-socquettes",
    name: "Nike Dri-FIT — Socquettes No Show",
    sku: "NK-SOCK-DF",
    brandSlug: "nike",
    description:
      "Socquettes invisibles Nike Dri-FIT, maille respirante et swoosh tissé. Disponibles à l'unité (noir, gris ou blanc) ou en pack des 3 couleurs réunies à prix réduit.",
    searchKeywords: ["nike", "chaussettes", "socquettes", "socks", "dri-fit", "no show", "pack"],
    colors: ["Noir", "Gris", "Blanc", "Pack 3 Couleurs (Noir + Gris + Blanc)"],
    sizes: ["41-46"],
    price: 9,
    priceByColor: { "Pack 3 Couleurs (Noir + Gris + Blanc)": 22 },
    categorySlugs: ["running-socks"],
    images: [
      { src: NK_DF_PACK3, color: null }, // les 3 réunies = vignette catalogue
      { src: NK_DF_NOIR, color: "Noir" },
      { src: NK_DF_GRIS, color: "Gris" },
      { src: NK_DF_BLANC, color: "Blanc" },
    ],
  },
  {
    slug: "jordan-everyday-chaussettes",
    name: "Jordan Everyday — Chaussettes (x3)",
    sku: "JD-SOCK-EP",
    brandSlug: "jordan",
    description:
      "Lot de 3 paires de chaussettes Jordan Everyday. Tissu Dri-FIT respirant, maintien renforcé et logo Jumpman tissé. Coupe mi-haute.",
    searchKeywords: ["jordan", "nike", "chaussettes", "socks", "everyday", "jumpman", "dri-fit"],
    colors: ["Noir", "Blanc", "Gris", "Noir / Gris / Blanc"],
    sizes: ["41-46"],
    price: 19,
    categorySlugs: ["running-socks"],
    images: [
      { src: p(4), color: null },
      { src: p(4), crop: [20, 30, 340, 430], color: "Noir" },
      { src: p(4), crop: [380, 30, 340, 430], color: "Blanc" },
      { src: p(5), crop: [300, 330, 430, 430], color: "Gris" },
      { src: p(5), color: "Noir / Gris / Blanc" }, // lot assorti : 1 noire + 1 grise + 1 blanche
    ],
  },
  {
    slug: "under-armour-casquette-blitzing",
    name: "Casquette Under Armour Blitzing",
    sku: "UA-CAP-BLZ",
    brandSlug: "under-armour",
    description:
      "Casquette Under Armour Blitzing en maille stretch respirante, logo UA brodé et bande anti-transpiration HeatGear. Réglage arrière. Trois tailles disponibles.",
    searchKeywords: ["under armour", "ua", "casquette", "cap", "blitzing", "heatgear"],
    colors: ["Noir logo noir", "Noir logo blanc", "Vert Olive", "Blanc", "Beige"],
    sizes: ["S/M", "M/L", "L/XL"],
    price: 35,
    categorySlugs: ["caps", "caps-beanies"],
    images: [
      { src: UA_SRC, color: null }, // photo de groupe = vignette catalogue
      { src: UA_SRC, crop: [20, 300, 330, 300], color: "Noir logo noir" },
      { src: UA_SRC, crop: [900, 560, 350, 340], color: "Noir logo blanc" },
      { src: UA_SRC, crop: [300, 230, 320, 300], color: "Vert Olive" },
      { src: UA_SRC, crop: [540, 260, 330, 300], color: "Blanc" },
      { src: UA_SRC, crop: [500, 600, 360, 340], color: "Blanc" },
      { src: UA_SRC, crop: [830, 300, 320, 310], color: "Beige" },
    ],
  },
];

const STOCK = 15;

async function uploadImage(img: Img, filename: string): Promise<string> {
  let pipeline = sharp(img.src);
  if (img.crop) {
    const [left, top, width, height] = img.crop;
    pipeline = pipeline.extract({ left, top, width, height });
  }
  const buffer = await pipeline.resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

async function ensureBrand(slug: string, name: string, description: string) {
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.brand.create({ data: { slug, name, description, isActive: true } });
}

async function ensureCategory(slug: string, name: string, description: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing;
  const accessories = await prisma.category.findUnique({ where: { slug: "accessories" } });
  return prisma.category.create({
    data: { slug, name, description, parentId: accessories?.id ?? null, isActive: true, sortOrder: 0 },
  });
}

async function importSpec(spec: Spec) {
  const brand = await prisma.brand.findUnique({ where: { slug: spec.brandSlug } });
  if (!brand) throw new Error(`brand not found: ${spec.brandSlug}`);

  const categoryIds: string[] = [];
  for (const cs of spec.categorySlugs) {
    const cat = await prisma.category.findUnique({ where: { slug: cs } });
    if (cat) categoryIds.push(cat.id);
  }

  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log(`  removing existing ${spec.slug}`);
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

  for (const categoryId of categoryIds) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId } });
  }

  // Variants : 1 par (couleur × taille)
  const variants = spec.colors.flatMap((color) =>
    spec.sizes.map((size) => ({
      productId: product.id,
      size,
      color,
      colorHex: HEX[color] ?? "#888888",
      price: spec.priceByColor?.[color] ?? spec.price,
      stock: STOCK,
      isActive: true,
    }))
  );
  await prisma.productVariant.createMany({ data: variants });

  // Images (planche partagée + crops tagués par couleur)
  let sort = 0;
  for (const img of spec.images) {
    const tag = img.color ? img.color.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "all";
    const url = await uploadImage(img, `${spec.slug}-${tag}-${sort}.jpg`);
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        color: img.color,
        sortOrder: sort,
        isPrimary: sort === 0,
        altText: img.color ? `${spec.name} — ${img.color}` : spec.name,
      },
    });
    sort++;
  }

  console.log(
    `  + ${spec.name}: ${spec.colors.length} couleurs × ${spec.sizes.length} tailles = ${variants.length} variants, ${spec.images.length} images`
  );
}

async function main() {
  await ensureBrand("jordan", "Jordan", "Marque Jordan (Nike) — sneakers et équipement basketball/lifestyle.");
  await ensureBrand("under-armour", "Under Armour", "Marque américaine d'équipement sportif technique.");
  console.log("brands ok");

  await ensureCategory("running-socks", "Chaussettes", "Chaussettes de running et lifestyle — Nike, Jordan.");
  console.log("categories ok");

  for (const spec of SPECS) {
    try {
      await importSpec(spec);
    } catch (e) {
      console.error(`[fail] ${spec.slug}:`, e);
    }
  }
  console.log("\nDONE.");
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
