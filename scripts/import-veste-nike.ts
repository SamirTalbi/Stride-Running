/** Import des 3 vestes Nike (Photos/veste/nike/veste 1..3), catégorie jackets, homme. */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();
const ROOT = path.join(process.cwd(), "Photos", "veste", "nike");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const HEX: Record<string, string> = { Noir: "#1a1a1a", Vert: "#3f7a4f", "Bleu Marine": "#1c2740" };

const SPECS = [
  { dir: "veste 1", slug: "nike-run-division-demizip-noir", name: "Nike Run Division — Demi-zip Noir", color: "Noir",
    description: "Demi-zip de running Nike Run Division, col montant, imprimé crosshatch réfléchissant sur les manches et inscription Run Division. Tissu léger respirant." },
  { dir: "veste 2", slug: "nike-run-division-demizip-vert", name: "Nike Run Division — Demi-zip Vert", color: "Vert",
    description: "Demi-zip de running Nike Run Division en vert, col montant et détails réfléchissants crosshatch sur les manches. Tissu léger respirant." },
  { dir: "veste 3", slug: "nike-veste-running-zippee", name: "Nike — Veste Running Zippée", color: "Bleu Marine",
    description: "Veste de running Nike full-zip, col montant, manches à rayures texturées et swoosh brodé. Coupe ajustée, tissu stretch respirant." },
];

const PRICE = 75, STOCK = 15, SIZES = ["S", "M", "L", "XL", "XXL"];

async function listImages(d: string) {
  try { return (await fs.readdir(d, { withFileTypes: true })).filter((e) => e.isFile() && IMG_EXT.has(path.extname(e.name).toLowerCase())).map((e) => e.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); } catch { return []; }
}
async function upload(absPath: string, filename: string) {
  const buffer = await sharp(absPath).resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const media = await prisma.media.create({ data: { filename, mimeType: "image/jpeg", size: buffer.length, folder: "products", data: `data:image/jpeg;base64,${buffer.toString("base64")}` } });
  return `/api/media/${media.id}`;
}

async function main() {
  const brand = await prisma.brand.findUnique({ where: { slug: "nike" } });
  const cat = await prisma.category.findUnique({ where: { slug: "jackets" } });
  if (!brand || !cat) throw new Error("brand/cat manquant");
  for (const s of SPECS) {
    const dir = path.join(ROOT, s.dir);
    const files = await listImages(dir);
    if (!files.length) { console.log(`  [skip] ${s.slug}: aucune image`); continue; }
    const existing = await prisma.product.findUnique({ where: { slug: s.slug } });
    if (existing) await prisma.product.delete({ where: { id: existing.id } });
    const product = await prisma.product.create({
      data: { name: s.name, slug: s.slug, sku: s.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 32), description: s.description,
        brandId: brand.id, gender: "MEN", terrain: "ROAD", cushionLevel: "MEDIUM", stability: "NEUTRAL", isNewArrival: true, isActive: true,
        searchKeywords: ["nike", "veste", "demi-zip", "run division", "running"] },
    });
    await prisma.productCategory.create({ data: { productId: product.id, categoryId: cat.id } });
    await prisma.productVariant.createMany({ data: SIZES.map((size) => ({ productId: product.id, size, color: s.color, colorHex: HEX[s.color] ?? "#888", price: PRICE, stock: STOCK, isActive: true })) });
    let sort = 0;
    for (const f of files) { const url = await upload(path.join(dir, f), `${s.slug}-${sort}.jpg`); await prisma.productImage.create({ data: { productId: product.id, url, sortOrder: sort, isPrimary: sort === 0, altText: s.name } }); sort++; }
    console.log(`  + ${s.name} (${s.color}): ${files.length} img`);
  }
  console.log("\nDONE.");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
