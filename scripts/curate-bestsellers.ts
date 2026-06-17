/** Met en avant les meilleurs produits (chaussures flagship) sur l'accueil. */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Chaussures + 2 pièces vitrine, dans un ordre de mise en avant.
const FEATURED = [
  "gel-kayano-14", "cloud", "progrid-omni-9", "u1906", "740", "xt-6",
  "wave-prophecy", "saucony-progrid-triumph-4-keith-haring-nyc", "racer-s-oarism",
  "xt-quest-adv", "mind", "phantom-moon-black-burgundy",
];

(async () => {
  // 1) On retire le flag best-seller partout (repart propre)
  await prisma.product.updateMany({ data: { isBestSeller: false } });
  // 2) On le met sur la sélection
  const res = await prisma.product.updateMany({ where: { slug: { in: FEATURED } }, data: { isBestSeller: true } });
  console.log(`✓ ${res.count}/${FEATURED.length} produits mis en avant (best-seller)`);

  // Récap de ce qui s'affichera en premier sur l'accueil
  const top = await prisma.product.findMany({ where: { isActive: true }, orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }], take: 8, select: { name: true, isBestSeller: true } });
  console.log("\nTop 8 accueil :");
  top.forEach((t, i) => console.log(`${i + 1}. ${t.isBestSeller ? "★" : " "} ${t.name}`));
  await prisma.$disconnect();
})();
