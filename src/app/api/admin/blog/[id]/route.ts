import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { published: true, publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const justPublished = body.published && !existing.published;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...body,
      tags: body.tags ?? [],
      publishedAt: justPublished ? new Date() : (body.published ? existing.publishedAt : null),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ data: post });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
