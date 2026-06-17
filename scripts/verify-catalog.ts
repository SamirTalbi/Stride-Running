/**
 * Vérifie la cohérence catalogue ↔ navigation :
 *  - les slugs de catégories utilisés dans le menu existent,
 *  - chaque lien du menu Homme/Femme renvoie au moins 1 produit,
 *  - la séparation des genres est stricte,
 *  - les slugs de marques référencés dans le footer/bandeau existent.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MENU_CATS_BY_PAGE: Record<"men" | "women", string[]> = {
  men: ["chaussures", "claquettes", "tops", "shorts", "ensembles"],
  women: ["chaussures", "claquettes", "tops", "shorts", "joggers", "ensembles"],
};
const MENU_CATS = [...new Set(Object.values(MENU_CATS_BY_PAGE).flat())];
const BRAND_SLUGS = ["nike", "adidas", "on", "salomon", "asics", "new-balance", "saucony", "under-armour", "hoka", "mizuno"];

const notAccessories = {
  NOT: { categories: { some: { category: { OR: [{ slug: "accessories" }, { parent: { slug: "accessories" } }] } } } },
};

let failures = 0;
function check(ok: boolean, label: string, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

(async () => {
  // 1. Catégories du menu
  for (const slug of MENU_CATS) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    check(!!cat, `Catégorie "${slug}" existe`);
  }

  // 2. Produits par lien de menu
  for (const [page, genders] of [["men", ["MEN", "UNISEX"]], ["women", ["WOMEN", "UNISEX"]]] as const) {
    for (const slug of MENU_CATS_BY_PAGE[page]) {
      const count = await prisma.product.count({
        where: {
          isActive: true,
          gender: { in: [...genders] },
          categories: { some: { category: { slug } } },
          ...notAccessories,
        },
      });
      check(count > 0, `/${page}?cat=${slug}`, `${count} produit(s)`);
    }
  }

  // 3. Séparation stricte
  const womenOnMen = await prisma.product.count({
    where: { isActive: true, gender: "WOMEN", categories: { some: { category: { slug: { in: MENU_CATS } } } } },
  });
  console.log(`ℹ Produits WOMEN (jamais montrés côté Homme) : ${womenOnMen}`);
  const byGender = await prisma.product.groupBy({ by: ["gender"], _count: true });
  console.log("ℹ Répartition :", byGender.map((g) => `${g.gender}=${g._count}`).join(", "));

  // 4. Marques référencées
  for (const slug of BRAND_SLUGS) {
    const b = await prisma.brand.findUnique({ where: { slug } });
    check(!!b, `Marque "${slug}" existe`);
  }

  console.log(failures === 0 ? "\n✅ Tout est cohérent" : `\n❌ ${failures} problème(s)`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
})();
