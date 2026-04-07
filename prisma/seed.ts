import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // console.log("🌱 Seeding database...");

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: "nike" }, update: {}, create: { name: "Nike", slug: "nike", description: "La marque de sport n°1 au monde" } }),
    prisma.brand.upsert({ where: { slug: "brooks" }, update: {}, create: { name: "Brooks", slug: "brooks", description: "Marque spécialisée running" } }),
    prisma.brand.upsert({ where: { slug: "hoka" }, update: {}, create: { name: "HOKA", slug: "hoka", description: "Technologie d'amorti maximal" } }),
    prisma.brand.upsert({ where: { slug: "asics" }, update: {}, create: { name: "Asics", slug: "asics", description: "L'excellence de l'ingénierie japonaise" } }),
    prisma.brand.upsert({ where: { slug: "adidas" }, update: {}, create: { name: "Adidas", slug: "adidas", description: "Technologie BOOST et style" } }),
    prisma.brand.upsert({ where: { slug: "new-balance" }, update: {}, create: { name: "New Balance", slug: "new-balance", description: "Confort Fresh Foam" } }),
    prisma.brand.upsert({ where: { slug: "saucony" }, update: {}, create: { name: "Saucony", slug: "saucony", description: "Série de compétition Endorphin" } }),
    prisma.brand.upsert({ where: { slug: "salomon" }, update: {}, create: { name: "Salomon", slug: "salomon", description: "Trail running premium" } }),
  ]);

  // console.log(`✅ Created ${brands.length} brands`);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "road-running" }, update: {}, create: { name: "Course sur route", slug: "road-running", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "trail-running" }, update: {}, create: { name: "Trail", slug: "trail-running", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "racing" }, update: {}, create: { name: "Compétition", slug: "racing", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "training" }, update: {}, create: { name: "Entraînement", slug: "training", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "beginner" }, update: {}, create: { name: "Débutant", slug: "beginner", sortOrder: 5 } }),
  ]);

  // console.log(`✅ Created ${categories.length} categories`);

  // Sample product
  const pegasus = await prisma.product.upsert({
    where: { slug: "nike-air-zoom-pegasus-40" },
    update: {},
    create: {
      sku: "NK-PEG40-M",
      name: "Nike Air Zoom Pegasus 40",
      slug: "nike-air-zoom-pegasus-40",
      description: "L'entraîneur quotidien polyvalent",
      longDescription: "La Nike Air Zoom Pegasus 40 poursuit l'héritage...",
      brandId: brands[0].id,
      gender: "MEN",
      terrain: "ROAD",
      cushionLevel: "MEDIUM",
      stability: "NEUTRAL",
      drop: 10,
      weight: 285,
      features: ["Mousse React", "Unité Zoom Air double", "Mesh technique"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      avgRating: 4.8,
      reviewCount: 2847,
      metaTitle: "Nike Air Zoom Pegasus 40 | Stride Running",
      metaDesc: "Achetez la chaussure de running Nike Pegasus 40.",
      searchKeywords: ["pegasus", "nike", "entraînement", "course sur route"],
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
        color: "Noir/Blanc",
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

  // console.log("✅ Created sample product with variants");
  // console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
