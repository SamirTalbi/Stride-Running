import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
const SRC = path.join("Photos","femme","alo","a trier");
const OUT = path.join("Photos","femme","alo","_thumbs");
await fs.mkdir(OUT, { recursive: true });
const files = (await fs.readdir(SRC)).filter(f=>/\.(jpe?g|png|webp)$/i.test(f));
let n=0;
for (const f of files) {
  const out = path.join(OUT, f.replace(/\.(jpe?g|png|webp)$/i,".jpg"));
  try { await sharp(path.join(SRC,f)).resize({width:1000,height:1000,fit:"inside",withoutEnlargement:true}).jpeg({quality:78}).toFile(out); n++; }
  catch(e){ console.error("FAIL",f,e.message); }
}
console.log("done",n,"of",files.length);
