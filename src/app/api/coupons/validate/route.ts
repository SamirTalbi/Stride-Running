import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return NextResponse.json({
      error: `Minimum order of $${coupon.minOrderAmount} required`,
    }, { status: 400 });
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.type === "PERCENTAGE") {
    discountAmount = (subtotal * coupon.value) / 100;
  } else if (coupon.type === "FIXED") {
    discountAmount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === "FREE_SHIPPING") {
    discountAmount = 0; // handled on frontend
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    },
  });
}
