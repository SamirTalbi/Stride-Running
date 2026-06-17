/**
 * Sépare les collections homme/femme :
 *  - Les ensembles Nike/On/Under Armour et les vêtements Salomon sont des
 *    coupes homme (vérifié sur les photos) → gender MEN.
 *  - Les sneakers, claquettes et casquettes restent UNISEX (39–46, mixte).
 *  - Les produits Alo restent WOMEN.
 * Renomme aussi la catégorie road-running → chaussures ("Chaussures").
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MEN_PRODUCT_NAMES = [
  "Nike Ensemble Running Long",
  "Nike Ensemble Running Short",
  "On Ensemble Running Long",
  "On Ensemble Running Short",
  "Under Armour Ensemble Running Long",
  "Under Armour Ensemble Running Short",
  "Salomon Pull Anorak Zip Poche",
  "Salomon Pull Crewneck",
  "Salomon Short",
  "Salomon T-shirt Big Logo",
  "Salomon T-shirt Minimal Logo",
  "Salomon T-shirt Mountain Expand Your Horizons",
  "Salomon Veste GTX Hooded",
];

(async () => {
  const res = await prisma.product.updateMany({
    where: { name: { in: MEN_PRODUCT_NAMES } },
    data: { gender: "MEN" },
  });
  console.log(`✓ ${res.count}/${MEN_PRODUCT_NAMES.length} produits passés en MEN`);

  const cat = await prisma.category.update({
    where: { slug: "road-running" },
    data: {
      slug: "chaussures",
      name: "Chaussures",
      description: "Chaussures de running et sneakers",
    },
  });
  console.log(`✓ Catégorie renommée : ${cat.slug} (${cat.name})`);

  // Récap final
  const byGender = await prisma.product.groupBy({ by: ["gender"], _count: true });
  console.log("Répartition :", byGender.map((g) => `${g.gender}=${g._count}`).join(", "));
  await prisma.$disconnect();
})();
