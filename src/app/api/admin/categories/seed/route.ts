import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

const CATEGORY_TREE = [
  {
    name: "Shoes",
    slug: "shoes",
    description: "Chaussures de running pour toutes les surfaces et distances",
    sortOrder: 0,
    children: [
      { name: "Running Route", slug: "road-running", description: "Chaussures optimisées pour le bitume et les surfaces dures", sortOrder: 0 },
      { name: "Trail Running", slug: "trail-running", description: "Chaussures pour chemins et terrains accidentés", sortOrder: 1 },
      { name: "Racing", slug: "racing", description: "Chaussures de compétition légères et rapides", sortOrder: 2 },
      { name: "Débutant", slug: "beginner", description: "Chaussures confortables et stables pour bien débuter", sortOrder: 3 },
    ],
  },
  {
    name: "Apparel",
    slug: "apparel",
    description: "Running clothing and performance wear",
    sortOrder: 1,
    children: [
      { name: "T-shirts & Tops", slug: "tops", sortOrder: 0 },
      { name: "Compression & Sport", slug: "tights", sortOrder: 1 },
      { name: "Joggers & Bas", slug: "joggers", sortOrder: 2 },
      { name: "Hauts à capuche & Sweats", slug: "hoodies", sortOrder: 3 },
      { name: "Vestes & Gilets", slug: "jackets", sortOrder: 4 },
      { name: "Shorts", slug: "shorts", sortOrder: 5 },
      { name: "Survêtements", slug: "tracksuits", sortOrder: 6 },
      { name: "Sous-vêtements", slug: "base-layers", sortOrder: 7 },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Running accessories and gear",
    sortOrder: 2,
    children: [
      { name: "GPS Watches", slug: "gps-watches", sortOrder: 0 },
      { name: "Running Socks", slug: "running-socks", sortOrder: 1 },
      { name: "Hydration Vests", slug: "hydration-vests", sortOrder: 2 },
      { name: "Headphones", slug: "headphones", sortOrder: 3 },
      { name: "Running Belts", slug: "running-belts", sortOrder: 4 },
      { name: "Insoles", slug: "insoles", sortOrder: 5 },
    ],
  },
];

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  for (const tree of CATEGORY_TREE) {
    const { children, ...parentData } = tree;

    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {},
      create: { ...parentData, isActive: true },
    });

    const childResults = [];
    for (const child of children) {
      const c = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { parentId: parent.id },
        create: { ...child, parentId: parent.id, isActive: true },
      });
      childResults.push(c);
    }

    results.push({ parent, children: childResults });
  }

  return NextResponse.json({ success: true, results });
}
