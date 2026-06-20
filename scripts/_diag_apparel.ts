/** Diagnostic lecture seule : couleurs des variantes vs tags couleur des images. */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { variants: true, images: true, categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[] = [];
  let problems = 0;

  for (const p of products) {
    const colors = [...new Set(p.variants.map((v) => v.color))];
    const imgColors = [...new Set(p.images.map((i) => i.color).filter(Boolean))] as string[];
    const imgsNoColor = p.images.filter((i) => !i.color).length;
    const cats = p.categories.map((c) => c.category.slug).join(",");

    const multiColor = colors.length > 1;
    const imagesTagged = imgColors.length > 0;

    // Cas problématique : plusieurs couleurs mais images pas (ou mal) taguées
    const broken = multiColor && !imagesTagged;
    // Couleurs de variantes sans image correspondante
    const colorsMissingImages = multiColor
      ? colors.filter((c) => !imgColors.includes(c))
      : [];

    if (broken || (multiColor && colorsMissingImages.length > 0)) {
      problems++;
      rows.push(
        `❌ ${p.slug}\n   cats=[${cats}] couleurs(variantes)=${colors.length} [${colors.join(", ")}]\n` +
        `   images=${p.images.length} taguées=[${imgColors.join(", ") || "—"}] sans_tag=${imgsNoColor}\n` +
        (broken ? `   → SÉLECTEUR VISIBLE mais GALERIE NE FILTRE PAS (images color=null)\n` : "") +
        (colorsMissingImages.length ? `   → couleurs sans image dédiée: ${colorsMissingImages.join(", ")}\n` : "")
      );
    }
  }

  console.log(`\n=== ${products.length} produits, ${problems} problématiques ===\n`);
  console.log(rows.join("\n"));

  // Récap par catégorie
  console.log("\n=== Récap couleurs/images (tous produits multi-couleurs) ===");
  for (const p of products) {
    const colors = [...new Set(p.variants.map((v) => v.color))];
    if (colors.length <= 1) continue;
    const imgColors = [...new Set(p.images.map((i) => i.color).filter(Boolean))];
    console.log(`${imgColors.length > 0 ? "✓" : "✗"} ${p.slug}: ${colors.length} coul / images taguées=${imgColors.length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
