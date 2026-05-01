import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderRaw = (formData.get("folder") as string) ?? "stride-running/products";
    const folder = folderRaw.replace("stride-running/", "") || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        folder,
        data: base64,
      },
    });

    return NextResponse.json({ url: `/api/media/${media.id}`, publicId: media.id });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
