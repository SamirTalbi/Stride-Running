/**
 * Génère une planche contact numérotée d'un dossier d'images (récursif).
 * Usage: npx tsx scripts/_contact_sheet.ts "<dossier>" "<sortie.png>" [cols] [tile]
 * Affiche aussi le mapping index -> chemin relatif.
 */
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir: string, base: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(abs, base)));
    else if (IMG_EXT.has(path.extname(e.name).toLowerCase())) out.push(abs);
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

(async () => {
  const [folder, outFile, colsArg, tileArg] = process.argv.slice(2);
  const cols = parseInt(colsArg || "6");
  const tile = parseInt(tileArg || "240");
  const pad = 6;
  const labelH = 22;
  const cell = tile + pad * 2;
  const cellH = tile + pad * 2 + labelH;

  const files = (await walk(folder, folder)).sort((a, b) =>
    path.relative(folder, a).localeCompare(path.relative(folder, b), undefined, { numeric: true })
  );
  const rows = Math.ceil(files.length / cols);
  const W = cols * cell;
  const H = rows * cellH;

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < files.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = col * cell + pad, y = row * cellH + pad + labelH;
    try {
      const thumb = await sharp(files[i]).resize(tile, tile, { fit: "inside", background: "#fff" }).jpeg().toBuffer();
      composites.push({ input: thumb, left: x, top: y });
    } catch {}
    const lbl = path.relative(folder, files[i]).replace(/\\/g, "/");
    const dirLbl = path.dirname(lbl) === "." ? "" : path.dirname(lbl);
    const label = Buffer.from(
      `<svg width="${cell}" height="${labelH}"><text x="4" y="16" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b00">${i} ${dirLbl}</text></svg>`
    );
    composites.push({ input: label, left: col * cell, top: row * cellH + 2 });
    console.log(`${i}\t${path.relative(folder, files[i])}`);
  }

  await sharp({ create: { width: W, height: H, channels: 3, background: "#f0f0f0" } })
    .composite(composites).jpeg({ quality: 78 }).toFile(outFile);
  console.log(`\nPlanche: ${outFile} (${files.length} images, ${cols}x${rows})`);
})();
