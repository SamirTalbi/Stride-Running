import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });

    if (!media) return new NextResponse("Not found", { status: 404 });

    // data is stored as "data:image/jpeg;base64,<payload>"
    const base64Data = media.data.includes(",") ? media.data.split(",")[1] : media.data;
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": media.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Media Serve]", error);
    return new NextResponse("Error", { status: 500 });
  }
}
