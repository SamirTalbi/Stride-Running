/**
 * Prépare le tri des photos par couleur pour les vêtements multi-couleurs.
 * Pour chaque produit à >1 couleur :
 *   - crée des sous-dossiers <produit>/_couleurs/<Couleur>/ (vides)
 *   - génère une planche contact numérotée dans Photos/_planches/colortri/<slug>.jpg
 *     + un mapping <slug>.txt (index -> fichier)
 * Ne déplace ni ne supprime aucune photo. Idempotent.
 *
 * Ensuite : tu glisses chaque photo dans le dossier _couleurs/<Couleur> correspondant.
 * Les photos « génériques » (plusieurs coloris / packshot) → laisse-les à la racine du produit.
 * Puis : npx tsx scripts/import-apparel.ts (relit les sous-dossiers et tague par couleur).
 *
 * Usage: npx tsx scripts/prep-color-folders.ts
 */
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { SPECS, PHOTOS, IMG_EXT, colorFolder } from "./apparel-specs";

const OUT = path.join(PHOTOS, "_planches", "colortri");

async function listFlat(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isFile() && IMG_EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function contactSheet(dir: string, files: string[], outFile: string) {
  const cols = 5, tile = 240, pad = 6, labelH = 22;
  const cell = tile + pad * 2, cellH = tile + pad * 2 + labelH;
  const rows = Math.ceil(files.length / cols) || 1;
  const W = cols * cell, H = rows * cellH;

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < files.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = col * cell + pad, y = row * cellH + pad + labelH;
    try {
      const thumb = await sharp(path.join(dir, files[i]))
        .resize(tile, tile, { fit: "inside", background: "#fff" }).jpeg().toBuffer();
      composites.push({ input: thumb, left: x, top: y });
    } catch {}
    const label = Buffer.from(
      `<svg width="${cell}" height="${labelH}"><text x="4" y="16" font-family="sans-serif" font-size="14" font-weight="bold" fill="#b00">#${i}</text></svg>`
    );
    composites.push({ input: label, left: col * cell, top: row * cellH + 2 });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#f0f0f0" } })
    .composite(composites).jpeg({ quality: 78 }).toFile(outFile);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const multi = SPECS.filter((s) => s.colors.length > 1);
  let done = 0, missing = 0;

  for (const spec of multi) {
    const dir = path.join(PHOTOS, spec.dir);
    const files = await listFlat(dir);
    if (files.length === 0) {
      console.log(`  [!] ${spec.slug}: dossier vide ou introuvable (${spec.dir})`);
      missing++;
      continue;
    }

    // Sous-dossiers couleur
    for (const color of spec.colors) {
      await fs.mkdir(path.join(dir, "_couleurs", colorFolder(color)), { recursive: true });
    }

    // Planche contact + mapping
    const sheet = path.join(OUT, `${spec.slug}.jpg`);
    await contactSheet(dir, files, sheet);
    const mapping = files.map((f, i) => `#${i}\t${f}`).join("\n");
    await fs.writeFile(
      path.join(OUT, `${spec.slug}.txt`),
      `${spec.name}\nDossier: ${spec.dir}\nCouleurs: ${spec.colors.join(", ")}\n\n${mapping}\n`,
      "utf8"
    );

    console.log(`  + ${spec.slug}: ${files.length} photos, ${spec.colors.length} dossiers [${spec.colors.join(", ")}]`);
    done++;
  }

  console.log(`\n=== ${done} produits préparés, ${missing} sans photos ===`);
  console.log(`Planches contact : ${OUT}`);
  console.log(`\nProchaine étape :`);
  console.log(`  1. Ouvre chaque planche, glisse les photos dans Photos/<produit>/_couleurs/<Couleur>/`);
  console.log(`  2. Laisse les photos "tous coloris" à la racine du dossier produit`);
  console.log(`  3. npx tsx scripts/import-apparel.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
