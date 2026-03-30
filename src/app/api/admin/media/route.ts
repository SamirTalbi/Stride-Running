import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderRaw = searchParams.get("folder") ?? "";
  const search = searchParams.get("q") ?? "";
  const cursor = searchParams.get("cursor") ?? undefined;

  // "stride-running" = all, "stride-running/products" = products, etc.
  const folderFilter =
    folderRaw && folderRaw !== "stride-running"
      ? folderRaw.replace("stride-running/", "")
      : undefined;

  try {
    const resources = await prisma.media.findMany({
      where: {
        ...(folderFilter ? { folder: folderFilter } : {}),
        ...(search ? { filename: { contains: search, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        folder: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return NextResponse.json({
      resources: resources.map((r) => ({
        public_id: r.id,
        secure_url: `/api/media/${r.id}`,
        format: r.mimeType.split("/")[1] ?? "jpg",
        bytes: r.size,
        created_at: r.createdAt.toISOString(),
        folder: r.folder,
        filename: r.filename,
      })),
      nextCursor: resources.length === 30 ? resources[resources.length - 1].id : null,
      totalCount: null,
    });
  } catch (error) {
    console.error("[Media API]", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await req.json();
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });

  try {
    await prisma.media.delete({ where: { id: publicId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Media Delete]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
