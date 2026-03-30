import { NextResponse } from "next/server";
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    totalCustomers,
    todayCustomers,
    revenueResult,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });

  const topProductsWithNames = topProducts.map((p) => ({
    ...p,
    name: topProductDetails.find((d) => d.id === p.productId)?.name ?? "Unknown",
  }));

  return NextResponse.json({
    data: {
      totalOrders,
      todayOrders,
      totalCustomers,
      todayCustomers,
      totalRevenue: revenueResult._sum.total ?? 0,
      recentOrders,
      topProducts: topProductsWithNames,
    },
  });
}
