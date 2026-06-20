/**
 * Source unique des specs vêtements (shorts + t-shirts).
 * Utilisé par import-apparel.ts ET les scripts de tri couleur.
 */
import path from "path";

export const PHOTOS = path.join(process.cwd(), "Photos");
export const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const STOCK = 15;
export const SIZES = ["S", "M", "L", "XL", "XXL"];

export const HEX: Record<string, string> = {
  Noir: "#1a1a1a", Blanc: "#f4f4f2", Gris: "#9ca3af", "Gris Foncé": "#4b4f52",
  "Gris Bleu": "#6b7d8c", Bleu: "#34548c", "Bleu Marine": "#1c2740", "Bleu Ciel": "#8fbce0",
  "Bleu Foncé": "#1f3a5f",
  Vert: "#3f7a4f", Menthe: "#8fd6c4", Beige: "#d8c9a8", Orange: "#e8722a",
  Rose: "#e08aa6", Violet: "#8b86d0", Lilas: "#c3b8e0",
  "Os Blanc": "#efe9dd", "Bleu Sombre": "#1f3a5f", "Crème": "#efe6d2", Marron: "#6b4a2b",
};

/** Recherche de teinte insensible à la casse/accents superflus. */
export function hexFor(color: string): string {
  const direct = HEX[color];
  if (direct) return direct;
  const lower = color.toLowerCase();
  const found = Object.entries(HEX).find(([k]) => k.toLowerCase() === lower);
  return found ? found[1] : "#888888";
}

export type Spec = {
  dir: string;
  brand: string;
  gender: "MEN" | "WOMEN";
  cat: string;
  slug: string;
  name: string;
  colors: string[];
  price: number;
};

export const TOPS = "tops", SHORTS = "shorts";

export const SPECS: Spec[] = [
  // ───────── SHORTS ─────────
  { dir: "Short/Nike/short 1", brand: "nike", gender: "MEN", cat: SHORTS, slug: "nike-short-2en1", name: "Nike — Short 2-en-1", colors: ["Gris", "Bleu", "Noir"], price: 45 },
  { dir: "Short/Nike/short 2", brand: "nike", gender: "MEN", cat: SHORTS, slug: "nike-short-running-imprime", name: "Nike — Short de Running Imprimé", colors: ["Gris", "Noir", "Bleu Marine"], price: 45 },
  { dir: "Short/Nike/short 3", brand: "nike", gender: "MEN", cat: SHORTS, slug: "nike-run-division-short", name: "Nike Run Division — Short Imprimé", colors: ["Noir", "Bleu Marine", "Gris", "Vert"], price: 45 },
  { dir: "Short/Nike/short 4", brand: "nike", gender: "MEN", cat: SHORTS, slug: "nike-short-2en1-imprime", name: "Nike — Short 2-en-1 Imprimé", colors: ["Bleu", "Gris"], price: 45 },
  { dir: "Short/Nike/short 5", brand: "nike", gender: "MEN", cat: SHORTS, slug: "nike-short-tisse", name: "Nike — Short Tissé", colors: ["Beige", "Noir", "Gris"], price: 45 },
  { dir: "Short/under/short 1", brand: "under-armour", gender: "MEN", cat: SHORTS, slug: "ua-short-clair", name: "Under Armour — Short Clair", colors: ["Blanc", "Bleu Ciel"], price: 40 },
  { dir: "Short/under/short 2", brand: "under-armour", gender: "MEN", cat: SHORTS, slug: "ua-short-mesh", name: "Under Armour — Short Mesh", colors: ["Bleu", "Blanc", "Gris", "Noir"], price: 40 },
  { dir: "Short/under/short 3", brand: "under-armour", gender: "MEN", cat: SHORTS, slug: "ua-short-uni", name: "Under Armour — Short Uni", colors: ["Bleu", "Gris", "Noir"], price: 40 },
  { dir: "Short/under/short 4", brand: "under-armour", gender: "MEN", cat: SHORTS, slug: "ua-short-tech", name: "Under Armour — Short Tech", colors: ["Noir", "Gris", "Bleu"], price: 40 },
  { dir: "Short/under/short 5", brand: "under-armour", gender: "MEN", cat: SHORTS, slug: "ua-short-cargo", name: "Under Armour — Short Cargo", colors: ["Noir", "Beige", "Gris Bleu"], price: 40 },
  { dir: "Short/Salomon", brand: "salomon", gender: "MEN", cat: SHORTS, slug: "salomon-short", name: "Salomon — Short", colors: ["Bleu Marine", "Beige"], price: 45 },

  // ───────── T-SHIRTS ─────────
  // Alo (femme)
  { dir: "Tshirt/alo/tshirt_1", brand: "alo", gender: "WOMEN", cat: TOPS, slug: "alo-tshirt-uni", name: "Alo — T-shirt", colors: ["Blanc", "Menthe", "Bleu Ciel", "Gris", "Noir"], price: 39 },
  { dir: "Tshirt/alo/tshirt_2", brand: "alo", gender: "WOMEN", cat: TOPS, slug: "alo-tshirt-motif", name: "Alo — T-shirt Motif", colors: ["Noir", "Gris"], price: 39 },
  // adidas
  { dir: "Tshirt/adidas/tshirt_1", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-3stripes-gris", name: "Adidas — T-shirt 3-Stripes Gris", colors: ["Gris", "Vert"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_2", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-gris-fonce", name: "Adidas — T-shirt Gris Foncé", colors: ["Gris Foncé", "Noir"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_3", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-blanc", name: "Adidas — T-shirt Blanc", colors: ["Blanc", "Gris"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_4", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-bleu", name: "Adidas — T-shirt Bleu", colors: ["Bleu", "Bleu Ciel"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_5", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-camo", name: "Adidas — T-shirt Camo", colors: ["Beige", "Gris"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_6", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-menthe", name: "Adidas — T-shirt Menthe", colors: ["Menthe", "Gris"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_7", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-big-logo", name: "Adidas — T-shirt Big Logo", colors: ["Gris", "Bleu", "Orange", "Noir"], price: 35 },
  { dir: "Tshirt/adidas/tshirt_8", brand: "adidas", gender: "MEN", cat: TOPS, slug: "adidas-tshirt-imprime", name: "Adidas — T-shirt Imprimé", colors: ["Gris", "Blanc"], price: 35 },
  // nike
  { dir: "Tshirt/nike/tshirt_1", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-dri-fit", name: "Nike — T-shirt Dri-FIT", colors: ["Gris", "Blanc", "Lilas"], price: 35 },
  { dir: "Tshirt/nike/tshirt_1 - Copie (5)", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-vert", name: "Nike — T-shirt Vert", colors: ["Menthe", "Vert"], price: 35 },
  { dir: "Tshirt/nike/tshirt_1 - Copie (6)", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-noir", name: "Nike — T-shirt Noir", colors: ["Noir", "Gris"], price: 35 },
  { dir: "Tshirt/nike/tshirt_2", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-imprime-marine", name: "Nike — T-shirt Imprimé Marine", colors: ["Bleu Marine", "Noir"], price: 35 },
  { dir: "Tshirt/nike/tshirt_3", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-multicolore", name: "Nike — T-shirt Coloré", colors: ["Orange", "Bleu", "Rose", "Violet", "Menthe"], price: 35 },
  { dir: "Tshirt/nike/tshirt_4", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-classique", name: "Nike — T-shirt Classique", colors: ["Gris", "Noir", "Blanc"], price: 35 },
  { dir: "Tshirt/nike/tshirt_5", brand: "nike", gender: "MEN", cat: TOPS, slug: "nike-tshirt-sport", name: "Nike — T-shirt Sport", colors: ["Bleu", "Vert"], price: 35 },
  // On
  { dir: "Tshirt/On/tshirt_1", brand: "on", gender: "MEN", cat: TOPS, slug: "on-tshirt-imprime", name: "On — T-shirt Imprimé", colors: ["Blanc", "Noir"], price: 39 },
  { dir: "Tshirt/On/tshirt_2", brand: "on", gender: "MEN", cat: TOPS, slug: "on-tshirt-camo", name: "On — T-shirt Camo", colors: ["Menthe", "Gris", "Noir"], price: 39 },
  { dir: "Tshirt/On/tshirt_3", brand: "on", gender: "MEN", cat: TOPS, slug: "on-tshirt-clair", name: "On — T-shirt Clair", colors: ["Bleu Ciel", "Blanc", "Gris"], price: 39 },
  { dir: "Tshirt/On/tshirt_4", brand: "on", gender: "MEN", cat: TOPS, slug: "on-tshirt-performance", name: "On — T-shirt Performance", colors: ["Blanc", "Menthe", "Gris", "Noir"], price: 39 },
  // Under
  { dir: "Tshirt/Under/debardeur", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-debardeur", name: "Under Armour — Débardeur", colors: ["Noir", "Blanc", "Gris", "Bleu Ciel"], price: 32 },
  { dir: "Tshirt/Under/thsirt_1", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-clair", name: "Under Armour — T-shirt Clair", colors: ["Blanc", "Gris"], price: 35 },
  { dir: "Tshirt/Under/tshirt_2", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-marine", name: "Under Armour — T-shirt Marine", colors: ["Noir", "Bleu Marine"], price: 35 },
  { dir: "Tshirt/Under/tshirt_3", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-tech", name: "Under Armour — T-shirt Tech", colors: ["Bleu", "Gris", "Noir"], price: 35 },
  { dir: "Tshirt/Under/tshirt_4", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-sport", name: "Under Armour — T-shirt Sport", colors: ["Blanc", "Gris", "Bleu"], price: 35 },
  { dir: "Tshirt/Under/tshirt_5", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-uni", name: "Under Armour — T-shirt Uni", colors: ["Gris", "Noir"], price: 35 },
  { dir: "Tshirt/Under/tshirt_6", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-imprime", name: "Under Armour — T-shirt Imprimé", colors: ["Gris", "Bleu"], price: 35 },
  { dir: "Tshirt/Under/tshirt_7", brand: "under-armour", gender: "MEN", cat: TOPS, slug: "ua-tshirt-ciel", name: "Under Armour — T-shirt Ciel", colors: ["Bleu Ciel"], price: 35 },
  // The North Face
  { dir: "Tshirt/the north face/tshirt_1", brand: "the-north-face", gender: "MEN", cat: TOPS, slug: "tnf-tshirt-logo", name: "The North Face — T-shirt Logo", colors: ["Blanc", "Bleu Marine"], price: 39 },
  { dir: "Tshirt/the north face/tshirt_2", brand: "the-north-face", gender: "MEN", cat: TOPS, slug: "tnf-tshirt-rayures", name: "The North Face — T-shirt Texturé", colors: ["Noir", "Bleu"], price: 39 },
  // Salomon
  { dir: "Tshirt/Salomon", brand: "salomon", gender: "MEN", cat: TOPS, slug: "salomon-tshirt", name: "Salomon — T-shirt", colors: ["Noir", "Blanc", "Bleu Marine"], price: 39 },
];

/** Nom de sous-dossier sûr pour une couleur (pas de slash). */
export function colorFolder(color: string): string {
  return color.replace(/\s*\/\s*/g, "-");
}
