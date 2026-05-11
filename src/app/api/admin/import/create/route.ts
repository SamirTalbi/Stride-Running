import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type ImportPayload = {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  brandId?: string | null;
  brandName?: string | null;
  gender?: "MEN" | "WOMEN" | "UNISEX" | "KIDS";
  terrain?: "ROAD" | "TRAIL" | "TRACK" | "TREADMILL" | "MULTI";
  cushionLevel?: "MINIMAL" | "LOW" | "MEDIUM" | "HIGH" | "MAX";
  stability?: "NEUTRAL" | "STABILITY" | "MOTION_CONTROL";
  price: number;
  stock?: number;
  sizes?: string[];
  colors?: { name: string; hex?: string }[];
  imageUrls: string[];
  primaryImageIndex?: number;
  categoryIds?: string[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mimeFromUrl(url: string, contentType: string | null): string {
  if (contentType && contentType.startsWith("image/")) return contentType.split(";")[0].trim();
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".gif")) return "image/gif";
  return "image/jpeg";
}

async function downloadImage(url: string): Promise<{ url: string; mime: string; bytes: number; base64: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Referer: new URL(url).origin } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return null;
    const mime = mimeFromUrl(url, ct);
    return {
      url,
      mime,
      bytes: buf.length,
      base64: `data:${mime};base64,${buf.toString("base64")}`,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as ImportPayload;

    if (!body.name || !body.sku || !body.price || !body.imageUrls?.length) {
      return NextResponse.json({ error: "name, sku, price and at least one image are required" }, { status: 400 });
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { sku: body.sku }] } });
    if (existing) {
      return NextResponse.json({ error: `Product already exists (slug or sku conflict)` }, { status: 409 });
    }

    let brandId = body.brandId ?? null;
    if (!brandId && body.brandName) {
      const brandSlug = slugify(body.brandName);
      const brand = await prisma.brand.upsert({
        where: { slug: brandSlug },
        update: {},
        create: { name: body.brandName, slug: brandSlug },
      });
      brandId = brand.id;
    }

    const sizes = body.sizes?.length ? body.sizes : ["39", "40", "41", "42", "43", "44", "45", "46"];
    const colors = body.colors?.length ? body.colors : [{ name: "Default" }];
    const stock = body.stock ?? 999;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku: body.sku,
        description: body.description ?? null,
        brandId,
        gender: body.gender ?? "UNISEX",
        terrain: body.terrain ?? "ROAD",
        cushionLevel: body.cushionLevel ?? "MEDIUM",
        stability: body.stability ?? "NEUTRAL",
        isActive: true,
      },
    });

    const variantData = colors.flatMap((c) =>
      sizes.map((size) => ({
        productId: product.id,
        size,
        color: c.name,
        colorHex: c.hex ?? null,
        price: body.price,
        stock,
        isActive: true,
      }))
    );
    await prisma.productVariant.createMany({ data: variantData });

    const downloaded = await Promise.all(body.imageUrls.map(downloadImage));
    const okImages = downloaded.filter((d): d is NonNullable<typeof d> => d !== null);

    if (okImages.length === 0) {
      return NextResponse.json({ error: "Failed to download any images" }, { status: 502 });
    }

    const media = await Promise.all(
      okImages.map((d, i) =>
        prisma.media.create({
          data: {
            filename: `${slug}-${i}.${d.mime.split("/")[1]}`,
            mimeType: d.mime,
            size: d.bytes,
            folder: "products",
            data: d.base64,
          },
        })
      )
    );

    const primaryIdx = Math.min(body.primaryImageIndex ?? 0, media.length - 1);
    await prisma.productImage.createMany({
      data: media.map((m, i) => ({
        productId: product.id,
        url: `/api/media/${m.id}`,
        sortOrder: i,
        isPrimary: i === primaryIdx,
        altText: body.name,
      })),
    });

    if (body.categoryIds?.length) {
      await prisma.productCategory.createMany({
        data: body.categoryIds.map((cid) => ({ productId: product.id, categoryId: cid })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      data: {
        id: product.id,
        slug: product.slug,
        variants: variantData.length,
        images: media.length,
        skipped: body.imageUrls.length - okImages.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
