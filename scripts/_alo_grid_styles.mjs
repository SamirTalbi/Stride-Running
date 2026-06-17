import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const ROOT = "Photos/femme/alo/products/ensemble brassiere short legging";
const OUT = "Photos/femme/alo/_grids_styles";
const TILE = 400;
const COLS = 4;
const GAP = 6;
const LABEL_H = 32;
const HEADER_H = 60;

await fs.mkdir(OUT, { recursive: true });

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const styles = (await fs.readdir(ROOT, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const s of styles) {
  const dir = path.join(ROOT, s);
  const files = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name).sort();
  if (files.length === 0) continue;

  const rows = Math.ceil(files.length / COLS);
  const pageW = COLS * TILE + (COLS + 1) * GAP;
  const pageH = HEADER_H + rows * (TILE + LABEL_H) + (rows + 1) * GAP;
  const composites = [];

  const headerSvg = Buffer.from(`
    <svg width="${pageW}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="20" y="38" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff">${s} (${files.length} photos)</text>
    </svg>`);
  composites.push({ input: headerSvg, top: 0, left: 0 });

  for (let i = 0; i < files.length; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = GAP + col * (TILE + GAP);
    const y = HEADER_H + GAP + row * (TILE + LABEL_H + GAP);
    const img = await sharp(path.join(dir, files[i]))
      .resize({ width: TILE, height: TILE, fit: "contain", background: "#fff" })
      .toBuffer();
    composites.push({ input: img, top: y + LABEL_H, left: x });
    const m = files[i].match(/(\d\d\.\d\d\.\d\d(?: \(\d+\))?)/);
    const label = m ? m[1] : files[i].slice(0, 22);
    const svg = Buffer.from(`
      <svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#222"/>
        <text x="8" y="22" font-family="monospace" font-size="18" fill="#fff">${label}</text>
      </svg>`);
    composites.push({ input: svg, top: y, left: x });
  }

  const page = await sharp({ create: { width: pageW, height: pageH, channels: 3, background: "#ddd" } })
    .composite(composites).jpeg({ quality: 85 }).toBuffer();
  const safe = s.replace(/[^a-z0-9]+/gi, "-");
  await fs.writeFile(path.join(OUT, `${safe}.jpg`), page);
  console.log(`${s}: ${files.length} → ${safe}.jpg`);
}
console.log("done");
