import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: coupons });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        type: body.type,
        value: parseFloat(body.value),
        minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Code already exists or invalid data" }, { status: 400 });
  }
}
