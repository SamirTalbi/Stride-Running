/**
 * Import vêtements (shorts + t-shirts). 1 produit par sous-dossier.
 * Specs centralisées dans apparel-specs.ts.
 *
 * Tag couleur des images :
 *   - Photos dans <produit>/_couleurs/<Couleur>/  → taguées avec cette couleur (galerie filtrée).
 *   - Photos à la racine du dossier produit        → color:null (partagées, vues quel que soit le coloris).
 *   - Si aucun sous-dossier _couleurs              → comportement historique (tout en color:null).
 *
 * Préparer le tri : npx tsx scripts/prep-color-folders.ts
 * Idempotent.
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { SPECS, PHOTOS, IMG_EXT, hexFor, SIZES, STOCK, type Spec } from "./apparel-specs";

const prisma = new PrismaClient();

async function listFlat(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isFile() && IMG_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch { return []; }
}

async function upload(absPath: string, filename: string): Promise<string> {
  const buffer = await sharp(absPath).resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const media = await prisma.media.create({ data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: `data:image/jpeg;base64,${buffer.toString("base64")}` } });
  return `/api/media/${media.id}`;
}

type Img = { abs: string; file: string; color: string | null };

/** Normalise un nom de couleur en Title Case ("gris foncé" → "Gris Foncé"). */
function normalizeColor(s: string): string {
  return s.trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Lit les dossiers couleur remplis par l'utilisateur → couleur = nom du dossier (normalisé).
 * Tolérant : accepte les sous-dossiers sous _couleurs/<X> ET directement <produit>/<X>.
 * `abs` pointe vers l'emplacement réel ; les couleurs identiques sont fusionnées.
 */
async function readColorFolders(dir: string): Promise<{ color: string; files: { abs: string; file: string }[] }[]> {
  const map = new Map<string, { abs: string; file: string }[]>();
  const add = async (folderAbs: string, rawName: string) => {
    const files = await listFlat(folderAbs);
    if (!files.length) return;
    const color = normalizeColor(rawName);
    const arr = map.get(color) ?? [];
    for (const f of files) arr.push({ abs: path.join(folderAbs, f), file: f });
    map.set(color, arr);
  };
  // 1) sous-dossiers de _couleurs/
  try {
    const base = path.join(dir, "_couleurs");
    for (const s of (await fs.readdir(base, { withFileTypes: true })).filter((e) => e.isDirectory())) {
      await add(path.join(base, s.name), s.name);
    }
  } catch { /* pas de _couleurs */ }
  // 2) sous-dossiers couleur directement à la racine du produit (hors _couleurs)
  try {
    for (const s of (await fs.readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory() && e.name !== "_couleurs")) {
      await add(path.join(dir, s.name), s.name);
    }
  } catch { /* ignore */ }

  return [...map.entries()].map(([color, files]) => ({ color, files })).sort((a, b) => a.color.localeCompare(b.color));
}

async function collectImages(dir: string, colorFolders: { color: string; files: { abs: string; file: string }[] }[]): Promise<Img[]> {
  const out: Img[] = [];
  // 1) Images taguées (dossiers couleur remplis par l'utilisateur)
  for (const cf of colorFolders) {
    for (const f of cf.files) out.push({ abs: f.abs, file: f.file, color: cf.color });
  }
  // 2) Images partagées (racine du dossier produit)
  for (const f of await listFlat(dir)) out.push({ abs: path.join(dir, f), file: f, color: null });
  return out;
}

async function importSpec(spec: Spec) {
  const dir = path.join(PHOTOS, spec.dir);
  const colorFolders = await readColorFolders(dir);
  const images = await collectImages(dir, colorFolders);
  if (images.length === 0) { console.log(`  [skip] ${spec.slug}: aucune image`); return; }

  // Les couleurs viennent des dossiers triés ; sinon repli sur la spec (produit non trié).
  const colors = colorFolders.length ? colorFolders.map((c) => c.color) : spec.colors;

  const brand = await prisma.brand.findUnique({ where: { slug: spec.brand } });
  if (!brand) { console.log(`  [skip] ${spec.slug}: marque ${spec.brand} absente`); return; }
  const cat = await prisma.category.findUnique({ where: { slug: spec.cat } });
  if (!cat) { console.log(`  [skip] ${spec.slug}: catégorie ${spec.cat} absente`); return; }

  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) await prisma.product.delete({ where: { id: existing.id } });

  const product = await prisma.product.create({
    data: {
      name: spec.name, slug: spec.slug, sku: spec.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 32),
      description: `${spec.name}. Pièce de running respirante. Coloris disponibles : ${colors.join(", ")}.`,
      brandId: brand.id, gender: spec.gender, terrain: "ROAD", cushionLevel: "MEDIUM", stability: "NEUTRAL",
      isNewArrival: true, isActive: true, searchKeywords: [spec.brand, spec.cat === "tops" ? "t-shirt" : "short", "running"],
    },
  });
  await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
  await prisma.productVariant.createMany({
    data: colors.flatMap((c) => SIZES.map((size) => ({ productId: product.id, size, color: c, colorHex: hexFor(c), price: spec.price, stock: STOCK, isActive: true }))),
  });

  let sort = 0;
  for (const img of images) {
    const url = await upload(img.abs, `${spec.slug}-${sort}.jpg`);
    await prisma.productImage.create({
      data: { productId: product.id, url, color: img.color, sortOrder: sort, isPrimary: sort === 0, altText: img.color ? `${spec.name} — ${img.color}` : spec.name },
    });
    sort++;
  }

  const tagged = images.filter((i) => i.color).length;
  const src = colorFolders.length ? `[${colors.join(", ")}]` : "(non trié → spec)";
  console.log(`  + ${spec.name} (${spec.brand}/${spec.gender}): ${colors.length} coul. ${src}, ${images.length} img (${tagged} taguées, ${images.length - tagged} partagées)`);
}

async function main() {
  for (const spec of SPECS) {
    try { await importSpec(spec); } catch (e) { console.error(`[fail] ${spec.slug}:`, e); }
  }
  console.log("\nDONE.");
}
main().catch((e) => { console.error("Import failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
