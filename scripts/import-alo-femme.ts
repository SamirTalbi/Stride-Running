import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

const ROOT = path.join(process.cwd(), "Photos", "femme", "alo", "products");
const SIZES = ["XS", "S", "M", "L", "XL"];
const PRICE = 75;
const STOCK = 1;
const BRAND_SLUG = "alo";

type Spec = {
  folder: string;
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  description: string;
  searchKeywords: string[];
  colors?: { name: string; hex: string }[]; // if missing → 1 default "Multicolor" variant
};

// 1 entry per folder in Photos/femme/alo/products/
const SPECS: Spec[] = [
  { folder: "brassier noir blanche", slug: "alo-brassiere-sport-cropped",
    name: "Alo Brassière Sport Cropped", sku: "ALO-BRA-CRP",
    categorySlug: "tops",
    description: "Brassière Alo sport cropped col rond, maintien medium, idéale yoga et running.",
    searchKeywords: ["alo", "brassiere", "sport", "cropped", "noir", "blanc"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
    ] },

  { folder: "brassiere decolté 3 coloris dispo", slug: "alo-brassiere-decoltee",
    name: "Alo Brassière Décolletée Dos-V", sku: "ALO-BRA-DEC",
    categorySlug: "tops",
    description: "Brassière Alo dos-V décolletée, 3 coloris disponibles, maintien léger.",
    searchKeywords: ["alo", "brassiere", "decoltee", "vneck"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Rose", hex: "#f5b5c8" },
    ] },

  { folder: "coloris ensemble brassiere", slug: "alo-ensemble-brassiere-lookbook",
    name: "Alo Ensemble Brassière Coloris Lookbook", sku: "ALO-ENS-LB",
    categorySlug: "apparel",
    description: "Lookbook coloris des ensembles brassière Alo, vue d'ensemble de la collection.",
    searchKeywords: ["alo", "ensemble", "brassiere", "lookbook", "coloris"],
    colors: [
      { name: "Bleu", hex: "#2e5ea3" },
      { name: "Rose", hex: "#f5b5c8" },
      { name: "Rouge", hex: "#c83030" },
    ] },

  { folder: "debardeur blanc et autre coloris dispo", slug: "alo-debardeur-sport",
    name: "Alo Débardeur Sport", sku: "ALO-DEB-SPT",
    categorySlug: "tops",
    description: "Débardeur Alo style sport avec ourlet courbe, plusieurs coloris disponibles.",
    searchKeywords: ["alo", "debardeur", "tank", "sport"],
    colors: [
      { name: "Blanc", hex: "#ffffff" },
      { name: "Noir", hex: "#111111" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
      { name: "Vert foret", hex: "#2d4a2d" },
      { name: "Rose pale", hex: "#fbd5d5" },
      { name: "Jaune", hex: "#f5d76e" },
    ] },

  { folder: "debardeur zip", slug: "alo-debardeur-zip",
    name: "Alo Débardeur Zip", sku: "ALO-DEB-ZIP",
    categorySlug: "tops",
    description: "Débardeur Alo avec demi-zip, coupe ajustée, idéal training.",
    searchKeywords: ["alo", "debardeur", "tank", "zip"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Jaune", hex: "#f5d76e" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
    ] },

  { folder: "ensemble brassiere decolté legging", slug: "alo-ensemble-brassiere-decoltee-legging",
    name: "Alo Ensemble Brassière Décolletée + Leggings", sku: "ALO-SET-BRA-DEC-LEG",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière dos-V décolletée + leggings assortis, coupe sculptante.",
    searchKeywords: ["alo", "ensemble", "brassiere", "leggings", "decoltee"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Gris", hex: "#808080" },
      { name: "Marron", hex: "#6b4423" },
      { name: "Os blanc", hex: "#f1e8d0" },
      { name: "Vert jade", hex: "#4caf94" },
      { name: "Prune", hex: "#6b3a5e" },
      { name: "Bleu", hex: "#2e5ea3" },
      { name: "Rose fushia", hex: "#d83c75" },
      { name: "Rose pale", hex: "#fbd5d5" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
    ] },

  { folder: "ensemble brassiere legging gris noir", slug: "alo-ensemble-brassiere-legging-varsity",
    name: "Alo Ensemble Brassière + Leggings Varsity", sku: "ALO-SET-BRA-LEG-VAR",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière + leggings style varsity, bordures contrastées blanches, bande logo.",
    searchKeywords: ["alo", "ensemble", "brassiere", "leggings", "varsity"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Gris", hex: "#b8b8b8" },
    ] },

  { folder: "ensemble brassiere legging noir", slug: "alo-ensemble-brassiere-legging-noir",
    name: "Alo Ensemble Brassière + Leggings Noir", sku: "ALO-SET-BRA-LEG-NR",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière + leggings tout noir, tissu stretch technique.",
    searchKeywords: ["alo", "ensemble", "brassiere", "leggings", "noir"],
    colors: [{ name: "Noir", hex: "#111111" }] },

  // === ensemble brassière + legging yoga : 2 styles distincts (coloris en sous-dossiers) ===
  { folder: "ensemble brassiere legging yoga/style 1",
    slug: "alo-ensemble-brassiere-debardeur-legging-yoga",
    name: "Alo Ensemble Brassière Débardeur + Legging Yoga", sku: "ALO-SET-BRA-DEB-YG",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière débardeur (bretelles larges, dos couvrant col U) + legging taille haute assorti, coupe sculptante yoga.",
    searchKeywords: ["alo", "ensemble", "brassiere", "debardeur", "legging", "yoga"] },

  { folder: "ensemble brassiere legging yoga/style 2",
    slug: "alo-ensemble-brassiere-bretelles-legging-yoga",
    name: "Alo Ensemble Brassière Bretelles Fines + Legging Yoga", sku: "ALO-SET-BRA-BRT-YG",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière à fines bretelles croisées dans le dos + legging taille haute assorti, coupe sculptante yoga.",
    searchKeywords: ["alo", "ensemble", "brassiere", "bretelles", "strappy", "legging", "yoga"] },

  // === 6 styles distincts d'ensembles brassière + cycliste ===
  { folder: "ensemble brassiere short legging/style 1",
    slug: "alo-ensemble-brassiere-uneck-cycliste",
    name: "Alo Ensemble Brassière U-neck + Cycliste",
    sku: "ALO-SET-BRA-UNK-CYC",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière U-neck avec bordure blanche contrastée + short cycliste assorti.",
    searchKeywords: ["alo", "ensemble", "brassiere", "uneck", "cycliste", "piping"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Bleu marine", hex: "#1a2a3a" },
      { name: "Rose taupe", hex: "#b89f93" },
      { name: "Gris clair", hex: "#c8c8c8" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
    ] },

  { folder: "ensemble brassiere short legging/style 2",
    slug: "alo-ensemble-brassiere-cami-cycliste",
    name: "Alo Ensemble Brassière Cami + Cycliste",
    sku: "ALO-SET-BRA-CAM-CYC",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière bretelles fines avec piping contrasté + short cycliste assorti.",
    searchKeywords: ["alo", "ensemble", "brassiere", "cami", "strappy", "cycliste"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Os blanc", hex: "#f1e8d0" },
      { name: "Gris clair", hex: "#c8c8c8" },
      { name: "Rose vif", hex: "#e85aa8" },
      { name: "Corail", hex: "#ff7f64" },
    ] },

  { folder: "ensemble brassiere short legging/style 3",
    slug: "alo-ensemble-brassiere-cycliste-cotele",
    name: "Alo Ensemble Brassière + Cycliste Côtelé",
    sku: "ALO-SET-BRA-CYC-COT",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière + cycliste en maille côtelée stretch ribbed.",
    searchKeywords: ["alo", "ensemble", "brassiere", "cycliste", "ribbed", "cotele"],
    colors: [
      { name: "Gris", hex: "#808080" },
      { name: "Blanc casse", hex: "#ece5d4" },
      { name: "Rose", hex: "#f5b5c8" },
      { name: "Noir", hex: "#111111" },
    ] },

  { folder: "ensemble brassiere short legging/style 4",
    slug: "alo-ensemble-brassiere-cycliste-piping",
    name: "Alo Ensemble Brassière Col Carré + Cycliste Piping",
    sku: "ALO-SET-BRA-CYC-PIP",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière col carré + short cycliste avec piping contrasté (modèle D25152).",
    searchKeywords: ["alo", "ensemble", "brassiere", "cycliste", "piping"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Bleu marine", hex: "#1a2a3a" },
      { name: "Blanc", hex: "#ffffff" },
    ] },

  { folder: "ensemble brassiere short legging/style 5",
    slug: "alo-ensemble-brassiere-dos-v-cycliste",
    name: "Alo Ensemble Brassière Dos-V + Cycliste",
    sku: "ALO-SET-BRA-DV-CYC",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière dos-V uni + short cycliste haute taille assorti.",
    searchKeywords: ["alo", "ensemble", "brassiere", "vneck", "dos-v", "cycliste"],
    colors: [
      { name: "Marron", hex: "#6b4423" },
      { name: "Vert jade", hex: "#4caf94" },
      { name: "Gris", hex: "#808080" },
      { name: "Orange abricot", hex: "#e8a070" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
      { name: "Bleu", hex: "#2e5ea3" },
      { name: "Vert foret", hex: "#2d4a2d" },
      { name: "Prune", hex: "#6b3a5e" },
    ] },

  { folder: "ensemble brassiere short legging/style 6",
    slug: "alo-ensemble-brassiere-asymetrique-cycliste",
    name: "Alo Ensemble Brassière Asymétrique + Cycliste",
    sku: "ALO-SET-BRA-ASY-CYC",
    categorySlug: "apparel",
    description: "Ensemble Alo brassière une épaule asymétrique + short cycliste assorti (modèle DK067).",
    searchKeywords: ["alo", "ensemble", "brassiere", "asymetrique", "one shoulder", "cycliste"],
    colors: [
      { name: "Orange abricot", hex: "#e8a070" },
      { name: "Bleu jade", hex: "#4c8b8b" },
      { name: "Vert pomme", hex: "#9acd32" },
      { name: "Noir", hex: "#111111" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
      { name: "Prune", hex: "#6b3a5e" },
      { name: "Rose fushia", hex: "#d83c75" },
      { name: "Nude", hex: "#d4baa0" },
    ] },

  { folder: "ensemble jupe haut tennis", slug: "alo-ensemble-tennis-haut-jupe",
    name: "Alo Ensemble Tennis Haut + Jupe Plissée", sku: "ALO-SET-TEN",
    categorySlug: "apparel",
    description: "Ensemble Alo style tennis : haut col polo + jupe plissée avec short intégré.",
    searchKeywords: ["alo", "ensemble", "tennis", "jupe", "polo"],
    colors: [
      { name: "Lavande", hex: "#c4b4e0" },
      { name: "Rose", hex: "#f5b5c8" },
      { name: "Noir", hex: "#111111" },
      { name: "Jaune", hex: "#f5d76e" },
      { name: "Vert jade", hex: "#4caf94" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
    ] },

  { folder: "ensemble tshirt pantalon", slug: "alo-ensemble-tshirt-pantalon",
    name: "Alo Ensemble T-shirt + Pantalon", sku: "ALO-SET-TSH-PAN",
    categorySlug: "apparel",
    description: "Ensemble Alo loungewear t-shirt manches courtes + pantalon ample assorti.",
    searchKeywords: ["alo", "ensemble", "loungewear", "tshirt", "pantalon"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Bleu marine", hex: "#1a2a3a" },
    ] },

  { folder: "ensemble veste brassiere jupe noir", slug: "alo-ensemble-veste-brassiere-jupe",
    name: "Alo Ensemble Veste + Brassière + Jupe", sku: "ALO-SET-VES-BRA-JUP",
    categorySlug: "tracksuits",
    description: "Ensemble Alo 3 pièces : veste cropped + brassière + jupe assorties.",
    searchKeywords: ["alo", "ensemble", "veste", "brassiere", "jupe"],
    colors: [{ name: "Noir", hex: "#111111" }] },

  { folder: "ensemble veste et jupe", slug: "alo-ensemble-veste-jupe",
    name: "Alo Ensemble Veste + Jupe", sku: "ALO-SET-VES-JUP",
    categorySlug: "tracksuits",
    description: "Ensemble Alo veste + jupe assortis, style sportif preppy.",
    searchKeywords: ["alo", "ensemble", "veste", "jupe"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Gris", hex: "#808080" },
      { name: "Bleu marine", hex: "#1a2a3a" },
    ] },

  { folder: "ensemble veste pantalon", slug: "alo-ensemble-veste-pantalon",
    name: "Alo Ensemble Veste + Pantalon", sku: "ALO-SET-VES-PAN",
    categorySlug: "tracksuits",
    description: "Ensemble Alo veste zippée + pantalon ample assorti, tracksuit lifestyle.",
    searchKeywords: ["alo", "ensemble", "veste", "pantalon", "tracksuit"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Gris", hex: "#808080" },
      { name: "Blanc", hex: "#ffffff" },
    ] },

  { folder: "joggins", slug: "alo-pantalon-jogging",
    name: "Alo Pantalon Jogging", sku: "ALO-PAN-JOG",
    categorySlug: "joggers",
    description: "Jogging Alo en molleton doux, taille élastique cordon, poches, ourlet resserré.",
    searchKeywords: ["alo", "pantalon", "jogging", "sweatpants", "fleece"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Bleu marine", hex: "#1a2a3a" },
      { name: "Gris clair", hex: "#d0d0d0" },
      { name: "Taupe bois", hex: "#9a8470" },
      { name: "Os blanc", hex: "#f1e8d0" },
      { name: "Rose", hex: "#f5b5c8" },
    ] },

  { folder: "jupes", slug: "alo-jupe-tennis-plissee",
    name: "Alo Jupe Tennis Plissée", sku: "ALO-JUP-TEN",
    categorySlug: "shorts",
    description: "Jupe Alo style tennis plissée avec short intégré, plusieurs coloris.",
    searchKeywords: ["alo", "jupe", "tennis", "plissee", "skort"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
      { name: "Lavande", hex: "#c4b4e0" },
      { name: "Jaune", hex: "#f5d76e" },
      { name: "Rose", hex: "#f5b5c8" },
      { name: "Vert jade", hex: "#4caf94" },
      { name: "Gris pierre", hex: "#8a8580" },
    ] },

  { folder: "legging 3 coloris dispo", slug: "alo-legging",
    name: "Alo Legging", sku: "ALO-LEG",
    categorySlug: "tights",
    description: "Legging Alo en tissu technique stretch, taille haute, 3 coloris disponibles.",
    searchKeywords: ["alo", "legging", "tights"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Rose", hex: "#f5b5c8" },
    ] },

  { folder: "mannequin brassiere pantalon", slug: "alo-look-brassiere-pantalon",
    name: "Alo Look Brassière + Pantalon Large", sku: "ALO-LK-BRA-PAN",
    categorySlug: "apparel",
    description: "Look Alo brassière + pantalon large stretch, lifestyle sport.",
    searchKeywords: ["alo", "look", "brassiere", "pantalon"] },

  { folder: "mannequin ensemble brassiere legging noir blanc", slug: "alo-look-brassiere-legging-varsity",
    name: "Alo Look Brassière + Leggings Varsity", sku: "ALO-LK-BRA-LEG",
    categorySlug: "apparel",
    description: "Look Alo brassière + leggings varsity, photos portées modèle.",
    searchKeywords: ["alo", "look", "brassiere", "leggings", "varsity"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Blanc", hex: "#ffffff" },
    ] },

  { folder: "pull court et short", slug: "alo-ensemble-pull-cropped-short",
    name: "Alo Ensemble Pull Cropped + Short", sku: "ALO-SET-PUL-CRP-SHO",
    categorySlug: "tracksuits",
    description: "Ensemble Alo pull cropped col rond + short assorti, molleton doux loungewear.",
    searchKeywords: ["alo", "ensemble", "pull", "cropped", "short"],
    colors: [
      { name: "Rose", hex: "#f5b5c8" },
      { name: "Noir", hex: "#111111" },
    ] },

  { folder: "robe sport", slug: "alo-robe-sport",
    name: "Alo Robe Sport", sku: "ALO-ROB-SPT",
    categorySlug: "apparel",
    description: "Robe Alo style sport avec short intégré, tissu technique respirant.",
    searchKeywords: ["alo", "robe", "dress", "sport"],
    colors: [
      { name: "Sable", hex: "#c8b896" },
      { name: "Gris clair", hex: "#a8a8a8" },
      { name: "Bleu marine", hex: "#1a2a3a" },
      { name: "Marron", hex: "#7a5f4a" },
      { name: "Noir", hex: "#111111" },
    ] },

  { folder: "tshirt", slug: "alo-tshirt-mc",
    name: "Alo T-shirt Manches Courtes", sku: "ALO-TSH",
    categorySlug: "tops",
    description: "T-shirt Alo col rond ajusté en coton doux, petit logo signature.",
    searchKeywords: ["alo", "tshirt", "manches courtes"],
    colors: [
      { name: "Marron", hex: "#6b4423" },
      { name: "Noir", hex: "#111111" },
      { name: "Vert", hex: "#4a7a3a" },
      { name: "Blanc", hex: "#ffffff" },
      { name: "Bleu marine", hex: "#1a2a3a" },
    ] },

  { folder: "veste sport", slug: "alo-veste-sport",
    name: "Alo Veste Sport Running", sku: "ALO-VES-SPT",
    categorySlug: "jackets",
    description: "Veste Alo running zippée légère, tissu technique respirant, plusieurs coloris.",
    searchKeywords: ["alo", "veste", "running", "windbreaker"],
    colors: [
      { name: "Noir", hex: "#111111" },
      { name: "Bleu marine", hex: "#1a2a3a" },
      { name: "Bleu glacier", hex: "#b5d4e8" },
      { name: "Gris bleu", hex: "#6a7d8e" },
    ] },
];

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// FR color slug → hex
const HEX: Record<string, string> = {
  "noir": "#111111", "blanc": "#ffffff",
  "gris": "#808080", "gris-clair": "#c8c8c8", "gris-chine": "#b8b8b8",
  "gris-anthracite": "#404040", "gris-bleu": "#6a7d8e", "gris-pierre": "#8a8580",
  "gris-kaki": "#8f8c7a",
  "bleu-marine": "#1a2a3a", "bleu-acier": "#6a8caa", "bleu-glacier": "#b5d4e8",
  "bleu": "#2e5ea3", "bleu-jade": "#4c8b8b",
  "vert": "#4a7a3a", "vert-olive": "#6b6f3a", "vert-foret": "#2d4a2d",
  "vert-jade": "#4caf94", "vert-pomme": "#9acd32",
  "marron": "#6b4423", "taupe": "#8a7a6a", "taupe-bois": "#9a8470",
  "rose": "#f5b5c8", "rose-pale": "#fbd5d5", "rose-poudre": "#f5c8c4",
  "rose-bonbon": "#f08ba0", "rose-fushia": "#d83c75", "rose-taupe": "#b89f93",
  "nude": "#d4baa0", "jaune": "#f5d76e", "lavande": "#c4b4e0",
  "prune": "#6b3a5e", "orange-abricot": "#e8a070", "orange": "#e6843a",
  "rouge": "#c83030", "os-blanc": "#f1e8d0", "blanc-casse": "#ece5d4",
  "sable": "#c8b896", "beige": "#c8b896",
  "corail": "#ff7f64",
  "violet": "#8b5cf6",
  "rose-vif": "#e85aa8",
};

function colorLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function listImages(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function listColorDirs(productDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(productDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}

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

async function importSpec(spec: Spec) {
  const productDir = path.join(ROOT, spec.folder);

  // Detect mode: nested (color sub-dirs present) vs flat (only images in root)
  const colorDirs = await listColorDirs(productDir);
  const rootImages = await listImages(productDir);

  // Build (colorSlug | null) → image-files map
  const colorImages = new Map<string | null, string[]>();
  if (colorDirs.length > 0) {
    for (const cs of colorDirs) {
      const imgs = await listImages(path.join(productDir, cs));
      if (imgs.length > 0) colorImages.set(cs, imgs);
    }
    if (rootImages.length > 0) colorImages.set(null, rootImages); // unsorted/group shots
  } else if (rootImages.length > 0) {
    colorImages.set(null, rootImages);
  }

  const totalImages = [...colorImages.values()].reduce((a, b) => a + b.length, 0);
  if (totalImages === 0) {
    console.log(`[skip] ${spec.slug}: no images in "${spec.folder}"`);
    return { skipped: true };
  }

  console.log(`\n=== ${spec.name} (${totalImages} img, ${colorDirs.length || "flat"} colors) ===`);

  const brand = await prisma.brand.findUnique({ where: { slug: BRAND_SLUG } });
  if (!brand) throw new Error("Brand 'alo' not found");

  // Idempotent
  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  if (existing) {
    console.log("  removing existing");
    await prisma.product.delete({ where: { id: existing.id } });
  }

  const product = await prisma.product.create({
    data: {
      name: spec.name,
      slug: spec.slug,
      sku: spec.sku,
      description: spec.description,
      brandId: brand.id,
      gender: "WOMEN",
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
  } else {
    console.warn(`  [warn] category not found: ${spec.categorySlug}`);
  }

  // Variants
  let colorList: { slug: string | null; name: string; hex: string }[];
  if (colorDirs.length > 0) {
    // Nested mode: 1 variant per color sub-folder that has images
    const subColors = colorDirs
      .filter((cs) => colorImages.has(cs))
      .map((cs) => ({
        slug: cs,
        name: colorLabel(cs),
        hex: HEX[cs] || (console.warn(`  [warn] no hex for "${cs}" → #888`), "#888888"),
      }));
    // Add spec.colors not represented in subfolders (variants without tagged images)
    const subNames = new Set(subColors.map((s) => s.name.toLowerCase()));
    const extraSpec = (spec.colors ?? []).filter(
      (c) => !subNames.has(c.name.toLowerCase()),
    );
    colorList = [
      ...subColors,
      ...extraSpec.map((c) => ({ slug: null, name: c.name, hex: c.hex })),
    ];
  } else if (spec.colors) {
    // Flat mode + spec colorways defined
    colorList = spec.colors.map((c) => ({ slug: null, name: c.name, hex: c.hex }));
  } else {
    // Flat mode + no colors → 1 default variant
    colorList = [{ slug: null, name: "Multicolor", hex: "#888888" }];
  }
  const variants = colorList.flatMap((c) =>
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
  console.log(`  ${variants.length} variants (${colorList.length} colors × ${SIZES.length} sizes)`);

  // Images
  let sort = 0;
  let uploaded = 0;
  for (const [colorSlug, files] of colorImages) {
    const colorName = colorSlug ? colorLabel(colorSlug) : null;
    const subDir = colorSlug ? path.join(productDir, colorSlug) : productDir;
    for (const file of files) {
      const absPath = path.join(subDir, file);
      const url = await uploadLocal(absPath, `${spec.slug}-${colorSlug || "x"}-${fileSlug(file)}.jpg`);
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          color: colorName,
          sortOrder: sort++,
          isPrimary: sort === 1,
          altText: colorName ? `${spec.name} — ${colorName}` : spec.name,
        },
      });
      uploaded++;
    }
  }
  console.log(`  ${uploaded} images uploaded`);
  return { skipped: false, images: uploaded };
}

async function main() {
  let created = 0;
  let skipped = 0;
  let totalImages = 0;
  for (const spec of SPECS) {
    try {
      const r = await importSpec(spec);
      if (r.skipped) skipped++;
      else {
        created++;
        totalImages += r.images || 0;
      }
    } catch (e) {
      console.error(`[fail] ${spec.slug}:`, e);
    }
  }
  console.log(`\n=== DONE ===`);
  console.log(`  created: ${created}  skipped: ${skipped}  images: ${totalImages}`);
}

main()
  .catch((e) => { console.error("Import failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
