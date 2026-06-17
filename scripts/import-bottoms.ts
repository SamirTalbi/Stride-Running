/**
 * Import des bas/joggings (dossier Photos/Bas/Nike, déjà sous-divisé en produits).
 * 1 produit par sous-dossier. bas_4 a plusieurs coloris (fichiers nommés par couleur).
 * Exclut les guides de tailles (noms avec "XL") et les images générées IA ("Gemini").
 * Catégorie joggers, genre MEN. Idempotent.
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();
const ROOT = path.join(process.cwd(), "Photos", "Bas", "Nike");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const HEX: Record<string, string> = {
  Noir: "#1a1a1a",
  "Gris Foncé": "#4b4f52",
  Bleu: "#34548c",
  "Noir / Gris": "#3a3f44",
  "Noir / Blanc": "#222222",
};

type ColorSpec = { color: string; match?: string }; // match = sous-chaîne du nom de fichier
type Spec = {
  folder: string;
  slug: string;
  name: string;
  description: string;
  colors: ColorSpec[];
};

const SPECS: Spec[] = [
  {
    folder: "Bas_1",
    slug: "nike-run-division-jogging-personnages",
    name: "Nike Run Division — Jogging Personnages",
    description: "Jogging de running Nike Run Division en tissu léger extensible, imprimés personnages réfléchissants aux genoux et bandes réfléchissantes. Taille élastiquée à cordon.",
    colors: [{ color: "Noir" }],
  },
  {
    folder: "bas_2",
    slug: "nike-run-division-jogging-runners-only",
    name: "Nike Run Division — Jogging Runners Only",
    description: "Jogging de running Nike Run Division, imprimé all-over « Runners Only » et grand swoosh orange. Tissu respirant, coupe fuselée.",
    colors: [{ color: "Noir" }],
  },
  {
    folder: "bas_3",
    slug: "nike-swift-pantalon-running",
    name: "Nike Swift — Pantalon de Running",
    description: "Pantalon de running Nike Swift, tissu technique respirant, poches zippées, empiècements ventilés et bas côtelé. Coupe ajustée.",
    colors: [{ color: "Gris Foncé" }],
  },
  {
    folder: "bas_4",
    slug: "nike-jogging-reflechissant",
    name: "Nike — Jogging Réfléchissant",
    description: "Jogging de running Nike, détails réfléchissants géométriques sur le bas des jambes, poches zippées et swoosh. Tissu léger.",
    colors: [
      { color: "Bleu", match: "bleu" },
      { color: "Noir / Gris", match: "noir_gris" },
      { color: "Noir / Blanc", match: "noir_blanc" },
    ],
  },
  {
    folder: "bas_5",
    slug: "nike-run-division-jogging-reflechissant",
    name: "Nike Run Division — Jogging Réfléchissant",
    description: "Jogging de running Nike Run Division, imprimé réfléchissant crosshatch sur les jambes, accents bleus et swoosh. Tissu léger respirant.",
    colors: [{ color: "Noir" }],
  },
  {
    folder: "bas_6",
    slug: "nike-run-division-jogging-crosshatch",
    name: "Nike Run Division — Jogging Crosshatch",
    description: "Jogging de running Nike Run Division avec ceinture imprimée et motif crosshatch réfléchissant sur la jambe. Tissu léger, coupe fuselée.",
    colors: [{ color: "Noir" }],
  },
  {
    folder: "bas_nike_trail",
    slug: "nike-trail-pantalon",
    name: "Nike Trail — Pantalon",
    description: "Pantalon Nike Trail léger et résistant, taille élastiquée à cordon, poches latérales et logo Nike Trail. Idéal sorties nature.",
    colors: [{ color: "Noir" }],
  },
];

const PRICE = 75;
const STOCK = 15;
const SIZES = ["S", "M", "L", "XL", "XXL"];

function fileSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function isUsable(name: string) {
  if (!IMG_EXT.has(path.extname(name).toLowerCase())) return false;
  if (/xl/i.test(name)) return false; // guides de tailles "S-2XL"
  if (/gemini/i.test(name)) return false; // image IA
  return true;
}

async function listImages(absDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && isUsable(e.name)).map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch { return []; }
}
async function upload(absPath: string, filename: string): Promise<string> {
  const buffer = await sharp(absPath).resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  const media = await prisma.media.create({ data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: base64 } });
  return `/api/media/${media.id}`;
}

async function importSpec(spec: Spec, brandId: string, categoryIds: string[]) {
  const dir = path.join(ROOT, spec.folder);
  const files = await listImages(dir);
  if (files.length === 0) { console.log(`  [skip] ${spec.slug}: aucune image`); return; }

  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) { console.log(`  removing existing ${spec.slug}`); await prisma.product.delete({ where: { id: existing.id } }); }

  const product = await prisma.product.create({
    data: {
      name: spec.name, slug: spec.slug, sku: spec.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 32),
      description: spec.description, brandId, gender: "MEN", terrain: "ROAD", cushionLevel: "MEDIUM", stability: "NEUTRAL",
      isNewArrival: true, isActive: true, searchKeywords: ["nike", "jogging", "pantalon", "bas", "running", "run division"],
    },
  });
  for (const categoryId of categoryIds) await prisma.productCategory.create({ data: { productId: product.id, categoryId } });

  // Variantes : couleur × taille
  await prisma.productVariant.createMany({
    data: spec.colors.flatMap((c) => SIZES.map((size) => ({
      productId: product.id, size, color: c.color, colorHex: HEX[c.color] ?? "#888888", price: PRICE, stock: STOCK, isActive: true,
    }))),
  });

  // Images : si la couleur a un "match", on tague par couleur ; sinon (mono-couleur) image partagée.
  const multi = spec.colors.length > 1;
  let sort = 0, uploaded = 0;
  for (const c of spec.colors) {
    const colorFiles = c.match ? files.filter((f) => f.toLowerCase().includes(c.match!)) : files;
    for (const f of colorFiles) {
      const url = await upload(path.join(dir, f), `${spec.slug}-${fileSlug(f)}.jpg`);
      await prisma.productImage.create({
        data: { productId: product.id, url, color: multi ? c.color : null, sortOrder: sort, isPrimary: sort === 0, altText: `${spec.name}${multi ? " — " + c.color : ""}` },
      });
      sort++; uploaded++;
    }
    if (!multi) break; // mono-couleur : un seul passage
  }
  console.log(`  + ${spec.name}: ${spec.colors.length} coul. (${spec.colors.map((c) => c.color).join(", ")}), ${uploaded} images`);
}

async function main() {
  const brand = await prisma.brand.findUnique({ where: { slug: "nike" } });
  if (!brand) throw new Error("brand nike introuvable");
  const joggers = await prisma.category.findUnique({ where: { slug: "joggers" } });
  if (!joggers) throw new Error("catégorie joggers introuvable");
  const categoryIds = [joggers.id];
  for (const spec of SPECS) {
    try { await importSpec(spec, brand.id, categoryIds); } catch (e) { console.error(`[fail] ${spec.slug}:`, e); }
  }
  console.log("\nDONE.");
}
main().catch((e) => { console.error("Import failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
