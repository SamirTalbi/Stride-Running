/**
 * Supprime les images Media (base64) qui ne sont plus référencées nulle part.
 * Sources de référence vérifiées : ProductImage.url, Brand.logoUrl,
 * Category.imageUrl, OrderItem.imageUrl, BlogPost.imageUrl, POItem.imageUrl.
 * (User.avatarUrl = Clerk externe, ignoré.)
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const referenced = new Set<string>();
const grab = (s?: string | null) => {
  if (!s) return;
  const m = s.match(/\/api\/media\/([a-z0-9]+)/i);
  if (m) referenced.add(m[1]);
};

(async () => {
  (await prisma.productImage.findMany({ select: { url: true } })).forEach((x) => grab(x.url));
  (await prisma.brand.findMany({ select: { logoUrl: true } })).forEach((x) => grab(x.logoUrl));
  (await prisma.category.findMany({ select: { imageUrl: true } })).forEach((x) => grab(x.imageUrl));
  (await prisma.orderItem.findMany({ select: { imageUrl: true } })).forEach((x) => grab(x.imageUrl));
  (await prisma.blogPost.findMany({ select: { imageUrl: true } })).forEach((x) => grab(x.imageUrl));
  (await prisma.pOItem.findMany({ select: { imageUrl: true } })).forEach((x) => grab(x.imageUrl));

  const all = await prisma.media.findMany({ select: { id: true } });
  const orphans = all.filter((m) => !referenced.has(m.id)).map((m) => m.id);

  console.log(`Media total: ${all.length}`);
  console.log(`Référencées: ${referenced.size}`);
  console.log(`Orphelines à supprimer: ${orphans.length}`);

  let deleted = 0;
  for (let i = 0; i < orphans.length; i += 200) {
    const batch = orphans.slice(i, i + 200);
    const res = await prisma.media.deleteMany({ where: { id: { in: batch } } });
    deleted += res.count;
  }
  console.log(`✓ ${deleted} Media orphelines supprimées. Reste: ${all.length - deleted}`);
  await prisma.$disconnect();
})();
