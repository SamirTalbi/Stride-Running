import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: "nike" }, update: {}, create: { name: "Nike", slug: "nike", description: "World's leading sports brand" } }),
    prisma.brand.upsert({ where: { slug: "brooks" }, update: {}, create: { name: "Brooks", slug: "brooks", description: "Running-only brand" } }),
    prisma.brand.upsert({ where: { slug: "hoka" }, update: {}, create: { name: "HOKA", slug: "hoka", description: "Maximum cushioning technology" } }),
    prisma.brand.upsert({ where: { slug: "asics" }, update: {}, create: { name: "Asics", slug: "asics", description: "Japanese engineering excellence" } }),
    prisma.brand.upsert({ where: { slug: "adidas" }, update: {}, create: { name: "Adidas", slug: "adidas", description: "BOOST technology and style" } }),
    prisma.brand.upsert({ where: { slug: "new-balance" }, update: {}, create: { name: "New Balance", slug: "new-balance", description: "Fresh Foam comfort" } }),
    prisma.brand.upsert({ where: { slug: "saucony" }, update: {}, create: { name: "Saucony", slug: "saucony", description: "Endorphin racing series" } }),
    prisma.brand.upsert({ where: { slug: "salomon" }, update: {}, create: { name: "Salomon", slug: "salomon", description: "Premium trail running" } }),
  ]);

  console.log(`✅ Created ${brands.length} brands`);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "road-running" }, update: {}, create: { name: "Road Running", slug: "road-running", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "trail-running" }, update: {}, create: { name: "Trail Running", slug: "trail-running", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "racing" }, update: {}, create: { name: "Racing", slug: "racing", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "training" }, update: {}, create: { name: "Training", slug: "training", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "beginner" }, update: {}, create: { name: "Beginner", slug: "beginner", sortOrder: 5 } }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Sample product
  const pegasus = await prisma.product.upsert({
    where: { slug: "nike-air-zoom-pegasus-40" },
    update: {},
    create: {
      sku: "NK-PEG40-M",
      name: "Nike Air Zoom Pegasus 40",
      slug: "nike-air-zoom-pegasus-40",
      description: "The workhorse daily trainer",
      longDescription: "The Nike Air Zoom Pegasus 40 continues the legacy...",
      brandId: brands[0].id,
      gender: "MEN",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      drop: 10,
      weight: 285,
      features: ["React foam", "Dual Zoom Air", "Engineered mesh"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      avgRating: 4.8,
      reviewCount: 2847,
      metaTitle: "Nike Air Zoom Pegasus 40 | Stride Running",
      metaDesc: "Shop the Nike Pegasus 40 running shoe.",
      searchKeywords: ["pegasus", "nike", "daily trainer", "road running"],
    },
  });

  // Variants
  // US sizes covering EU 38–45 (6 → 11)
  const sizes = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"];
  for (const size of sizes) {
    await prisma.productVariant.upsert({
      where: { id: `peg40-${size}-bw` },
      update: {},
      create: {
        id: `peg40-${size}-bw`,
        productId: pegasus.id,
        size,
        color: "Black/White",
        colorHex: "#000000",
        price: 130,
        stock: Math.floor(Math.random() * 15),
        isActive: true,
      },
    });
  }

  // Images
  await prisma.productImage.upsert({
    where: { id: "peg40-img-1" },
    update: {},
    create: {
      id: "peg40-img-1",
      productId: pegasus.id,
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
      altText: "Nike Air Zoom Pegasus 40",
      sortOrder: 0,
      isPrimary: true,
    },
  });

  console.log("✅ Created sample product with variants");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
