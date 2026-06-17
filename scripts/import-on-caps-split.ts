/**
 * Scinde la casquette On Running en 2 produits (2 styles distincts) :
 *  - Légère  : tissu perforé laser, sangle arrière, logo "On" (running)
 *  - Structurée : 6 panneaux, tissu plein, logo embossé (classique)
 * Source : Photos/casquettes/products/on-casquette/<couleur>/<sous-dossier style>
 * (dossiers nommés provisoirement s/syt/sdf/sfd/cwx/df → classés ici par style).
 * Supprime l'ancien produit unique "on-casquette". Idempotent.
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();
const ROOT = path.join(process.cwd(), "Photos", "casquettes", "products", "on-casquette");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const HEX: Record<string, string> = {
  Blanc: "#f4f4f2",
  Bleu: "#34548c",
  Noir: "#111111",
  "Bleu Denim": "#6f8cb0",
  "Crème": "#e8ddc7",
};

type ColorSpec = { color: string; dirs: string[]; front?: string };
type Spec = {
  slug: string;
  name: string;
  sku: string;
  description: string;
  colors: ColorSpec[];
};

const SPECS: Spec[] = [
  {
    slug: "on-casquette-legere",
    name: "Casquette On Running Légère",
    sku: "ON-CAP-LIGHT",
    description:
      "Casquette On Running légère et respirante : tissu perforé au laser, sangle arrière réglable et logo On. Profil souple, idéale pour courir.",
    colors: [
      { color: "Blanc", dirs: ["blanc/style 1"], front: "WhatsApp Image 2026-05-28 at 18.26.54 (3).jpeg" },
      { color: "Noir", dirs: ["noir/df"], front: "WhatsApp Image 2026-05-28 at 18.26.24 (6).jpeg" },
      { color: "Bleu Denim", dirs: ["bleu-denim/sdf", "bleu-denim/sfd"], front: "WhatsApp Image 2026-05-28 at 18.26.48 (1).jpeg" },
    ],
  },
  {
    slug: "on-casquette-structuree",
    name: "Casquette On Running Structurée",
    sku: "ON-CAP-STRUCT",
    description:
      "Casquette On Running 6 panneaux structurée : panneau avant plein, profil classique, logo On embossé, panneaux arrière perforés et sangle réglable.",
    colors: [
      { color: "Bleu", dirs: ["bleu/s", "bleu/syt"], front: "WhatsApp Image 2026-05-28 at 18.27.02.jpeg" },
      { color: "Noir", dirs: ["noir/cwx"], front: "WhatsApp Image 2026-05-28 at 18.27.07 (6).jpeg" },
      { color: "Blanc", dirs: ["blanc/style 2"] },
      { color: "Crème", dirs: ["creme"] },
    ],
  },
];

const PRICE = 35;
const STOCK = 15;

async function listImages(absDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMG_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => path.join(absDir, e.name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function upload(absPath: string, filename: string): Promise<string> {
  const buffer = await sharp(absPath)
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({
    data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: base64 },
  });
  return `/api/media/${media.id}`;
}

function fileSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function importSpec(spec: Spec, categoryIds: string[], brandId: string) {
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
      brandId,
      gender: "UNISEX",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      isNewArrival: true,
      isActive: true,
      searchKeywords: ["on", "on running", "casquette", "cap", spec.slug.includes("legere") ? "legere perforee running" : "structuree 6 panneaux"],
    },
  });

  for (const categoryId of categoryIds) {
    await prisma.productCategory.create({ data: { productId: product.id, categoryId } });
  }

  // Variantes : 1 par couleur (taille unique)
  await prisma.productVariant.createMany({
    data: spec.colors.map((c) => ({
      productId: product.id,
      size: "TU",
      color: c.color,
      colorHex: HEX[c.color] ?? "#888888",
      price: PRICE,
      stock: STOCK,
      isActive: true,
    })),
  });

  // Images taguées par couleur
  let sort = 0;
  let uploaded = 0;
  for (const c of spec.colors) {
    const files: string[] = [];
    for (const d of c.dirs) files.push(...(await listImages(path.join(ROOT, d))));
    // Place la photo de face (si indiquée) en premier → vignette/héros de la couleur
    if (c.front) {
      const i = files.findIndex((f) => path.basename(f) === c.front);
      if (i > 0) files.unshift(files.splice(i, 1)[0]);
    }
    for (const f of files) {
      const url = await upload(f, `${spec.slug}-${fileSlug(c.color)}-${fileSlug(path.basename(f))}.jpg`);
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          color: c.color,
          sortOrder: sort,
          isPrimary: sort === 0,
          altText: `${spec.name} — ${c.color}`,
        },
      });
      sort++;
      uploaded++;
    }
  }
  console.log(`  + ${spec.name}: ${spec.colors.length} couleurs (${spec.colors.map((c) => c.color).join(", ")}), ${uploaded} images`);
}

async function main() {
  const brand = await prisma.brand.findUnique({ where: { slug: "on" } });
  if (!brand) throw new Error("brand 'on' introuvable");
  const caps = await prisma.category.findUnique({ where: { slug: "caps" } });
  const capsBeanies = await prisma.category.findUnique({ where: { slug: "caps-beanies" } });
  const categoryIds = [caps?.id, capsBeanies?.id].filter(Boolean) as string[];

  // Supprime l'ancien produit unique
  const old = await prisma.product.findUnique({ where: { slug: "on-casquette" } });
  if (old) {
    console.log("  removing old single product on-casquette");
    await prisma.product.delete({ where: { id: old.id } });
  }

  for (const spec of SPECS) {
    try {
      await importSpec(spec, categoryIds, brand.id);
    } catch (e) {
      console.error(`[fail] ${spec.slug}:`, e);
    }
  }
  console.log("\nDONE.");
}

main()
  .catch((e) => { console.error("Import failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
