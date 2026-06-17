import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const SRC = "Photos/femme/alo/_thumbs";
const OUT = "Photos/femme/alo/_grids";
const TILE = 500;
const COLS = 3;
const ROWS = 2;
const GAP = 6;
const LABEL_H = 38;

await fs.mkdir(OUT, { recursive: true });

const files = (await fs.readdir(SRC))
  .filter((f) => f.toLowerCase().endsWith(".jpg"))
  .sort();

const pageW = COLS * TILE + (COLS + 1) * GAP;
const pageH = ROWS * (TILE + LABEL_H) + (ROWS + 1) * GAP;
const N = Math.ceil(files.length / (COLS * ROWS));

for (let p = 0; p < N; p++) {
  const items = files.slice(p * COLS * ROWS, (p + 1) * COLS * ROWS);
  const composites = [];
  for (let i = 0; i < items.length; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = GAP + col * (TILE + GAP);
    const y = GAP + row * (TILE + LABEL_H + GAP);

    const img = await sharp(path.join(SRC, items[i]))
      .resize({ width: TILE, height: TILE, fit: "contain", background: "#fff" })
      .toBuffer();
    composites.push({ input: img, top: y + LABEL_H, left: x });

    const m = items[i].match(/(\d\d\.\d\d\.\d\d(?: \(\d+\))?)/);
    const label = m ? m[1] : items[i];
    const svg = Buffer.from(`
      <svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#222"/>
        <text x="10" y="26" font-family="monospace" font-size="22" fill="#fff">${label}</text>
      </svg>`);
    composites.push({ input: svg, top: y, left: x });
  }

  const page = await sharp({
    create: { width: pageW, height: pageH, channels: 3, background: "#ddd" },
  })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toBuffer();

  const outName = path.join(OUT, `page_${String(p).padStart(3, "0")}.jpg`);
  await fs.writeFile(outName, page);
  process.stdout.write(`\rpage ${p + 1}/${N}`);
}
console.log("\ndone");
