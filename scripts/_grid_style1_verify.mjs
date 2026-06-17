import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const ROOT = "Photos/femme/alo/products/ensemble brassiere short legging/style 1";
const OUT = "Photos/femme/alo/_grids_styles/style-1-verify.jpg";
const TILE = 350;
const COLS = 4;
const GAP = 6;
const LABEL_H = 38;
const HEADER_H = 60;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Collect all photos with their current assignment
const items = [];
// Root files (unassigned)
const rootFiles = (await fs.readdir(ROOT, { withFileTypes: true }))
  .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
  .map((e) => ({ path: path.join(ROOT, e.name), color: "ROOT", file: e.name }))
  .sort((a, b) => a.file.localeCompare(b.file));
items.push(...rootFiles);

// Subdirs (assigned colors)
const subDirs = (await fs.readdir(ROOT, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();
for (const cd of subDirs) {
  const dir = path.join(ROOT, cd);
  const files = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => ({ path: path.join(dir, e.name), color: cd, file: e.name }))
    .sort((a, b) => a.file.localeCompare(b.file));
  items.push(...files);
}

const rows = Math.ceil(items.length / COLS);
const pageW = COLS * TILE + (COLS + 1) * GAP;
const pageH = HEADER_H + rows * (TILE + LABEL_H) + (rows + 1) * GAP;
const composites = [];

const headerSvg = Buffer.from(`
  <svg width="${pageW}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1a1a1a"/>
    <text x="20" y="38" font-family="sans-serif" font-size="26" font-weight="bold" fill="#fff">Style 1 verify (color → assignment)</text>
  </svg>`);
composites.push({ input: headerSvg, top: 0, left: 0 });

for (let i = 0; i < items.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = GAP + col * (TILE + GAP);
  const y = HEADER_H + GAP + row * (TILE + LABEL_H + GAP);
  const img = await sharp(items[i].path)
    .resize({ width: TILE, height: TILE, fit: "contain", background: "#fff" })
    .toBuffer();
  composites.push({ input: img, top: y + LABEL_H, left: x });
  const m = items[i].file.match(/(\d\d\.\d\d\.\d\d(?: \(\d+\))?)/);
  const ts = m ? m[1] : items[i].file.slice(0, 18);
  const label = `${items[i].color.toUpperCase()} · ${ts}`;
  const svg = Buffer.from(`
    <svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#222"/>
      <text x="8" y="26" font-family="monospace" font-size="18" fill="#fff">${label}</text>
    </svg>`);
  composites.push({ input: svg, top: y, left: x });
}

const page = await sharp({ create: { width: pageW, height: pageH, channels: 3, background: "#ddd" } })
  .composite(composites).jpeg({ quality: 85 }).toBuffer();
await fs.writeFile(OUT, page);
console.log("done →", OUT);
