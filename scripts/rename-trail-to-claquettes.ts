import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const updated = await prisma.category.update({
    where: { slug: "trail-running" },
    data: {
      slug: "claquettes",
      name: "Claquettes",
      description: "Claquettes & sandales de récupération",
    },
  });
  console.log(`✓ Catégorie renommée : ${updated.slug} (${updated.name})`);
  await prisma.$disconnect();
})();
