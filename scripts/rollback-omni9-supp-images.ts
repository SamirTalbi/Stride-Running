import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find all Media entries from the enrichment step (filename contains "-supp-")
  const suppMedia = await prisma.media.findMany({
    where: { filename: { contains: "-supp-" } },
    select: { id: true, filename: true },
  });
  console.log(`Found ${suppMedia.length} supplementary media entries.`);

  let imagesDeleted = 0;
  let mediaDeleted = 0;

  for (const m of suppMedia) {
    const url = `/api/media/${m.id}`;
    const pi = await prisma.productImage.findMany({ where: { url } });
    for (const img of pi) {
      await prisma.productImage.delete({ where: { id: img.id } });
      imagesDeleted++;
    }
    await prisma.media.delete({ where: { id: m.id } });
    mediaDeleted++;
    console.log(`  Removed ${m.filename}`);
  }

  console.log(`\nDone. ${imagesDeleted} ProductImage rows + ${mediaDeleted} Media rows deleted.`);

  // Verify
  const omni = await prisma.product.findUnique({
    where: { slug: "progrid-omni-9" },
    include: { images: true },
  });
  const byColor: Record<string, number> = {};
  for (const i of omni!.images) byColor[i.color || "_"] = (byColor[i.color || "_"] || 0) + 1;
  console.log("\nImages per colorway after rollback:");
  Object.entries(byColor)
    .sort((a, b) => a[1] - b[1])
    .forEach(([c, n]) => console.log(`  ${n} img: ${c}`));
}

main()
  .catch((e) => {
    console.error("Rollback failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
