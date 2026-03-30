import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const published = searchParams.get("published");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = {
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    ...(published !== null && published !== "" && { published: published === "true" }),
  };

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, slug: true, published: true, author: true, category: true, publishedAt: true, createdAt: true, excerpt: true, imageUrl: true, tags: true },
    }),
  ]);

  return NextResponse.json({ data: posts, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, imageUrl, author, category, tags, published, metaTitle, metaDesc } = body;

  if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });

  const finalSlug = slug || slugify(title);

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      author: author || "Stride Team",
      category: category || null,
      tags: tags || [],
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
    },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}
