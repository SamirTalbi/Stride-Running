import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

type Period = "7d" | "30d" | "90d" | "12m";

function getPeriodStart(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "7d":  return new Date(now.getTime() - 7 * 86400000);
    case "30d": return new Date(now.getTime() - 30 * 86400000);
    case "90d": return new Date(now.getTime() - 90 * 86400000);
    case "12m": return new Date(new Date().setFullYear(now.getFullYear() - 1));
  }
}

function getPreviousPeriodStart(period: Period, current: Date): Date {
  const now = new Date();
  switch (period) {
    case "7d":  return new Date(current.getTime() - 7 * 86400000);
    case "30d": return new Date(current.getTime() - 30 * 86400000);
    case "90d": return new Date(current.getTime() - 90 * 86400000);
    case "12m": return new Date(new Date(current).setFullYear(now.getFullYear() - 2));
  }
}

function formatKey(date: Date, period: Period): string {
  if (period === "12m") {
    return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
  }
  if (period === "90d") {
    // Group by week — return start of week label
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildTimeSeries(
  orders: { createdAt: Date; total: number; paymentStatus: string }[],
  start: Date,
  end: Date,
  period: Period
) {
  const buckets = new Map<string, { revenue: number; orders: number }>();

  // Generate all buckets
  const cursor = new Date(start);
  if (period === "12m") {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = formatKey(cursor, period);
      buckets.set(key, { revenue: 0, orders: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else if (period === "90d") {
    // Weekly
    cursor.setDate(cursor.getDate() - cursor.getDay());
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = formatKey(cursor, period);
      buckets.set(key, { revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = formatKey(cursor, period);
      buckets.set(key, { revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Fill with data
  for (const order of orders) {
    const key = formatKey(order.createdAt, period);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.orders += 1;
      if (order.paymentStatus === "PAID") bucket.revenue += order.total;
    }
  }

  return Array.from(buckets.entries()).map(([label, val]) => ({ label, ...val }));
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = (req.nextUrl.searchParams.get("period") ?? "30d") as Period;
  const now = new Date();
  const periodStart = getPeriodStart(period);
  const prevStart = getPreviousPeriodStart(period, periodStart);

  const [currentOrders, prevOrders, newCustomers, prevCustomers, topProducts, ordersByStatus, topCategories] =
    await Promise.all([
      // Current period orders
      prisma.order.findMany({
        where: { createdAt: { gte: periodStart } },
        select: { total: true, paymentStatus: true, status: true, createdAt: true, userId: true },
      }),
      // Previous period orders (for comparison)
      prisma.order.findMany({
        where: { createdAt: { gte: prevStart, lt: periodStart } },
        select: { total: true, paymentStatus: true },
      }),
      // New customers in period
      prisma.user.count({ where: { createdAt: { gte: periodStart } } }),
      prisma.user.count({ where: { createdAt: { gte: prevStart, lt: periodStart } } }),
      // Top products by revenue
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        where: { order: { createdAt: { gte: periodStart }, paymentStatus: "PAID" } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 8,
      }),
      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: periodStart } },
        _count: { id: true },
      }),
      // Top categories
      prisma.productCategory.findMany({
        where: {
          product: {
            orderItems: { some: { order: { createdAt: { gte: periodStart }, paymentStatus: "PAID" } } },
          },
        },
        include: {
          category: { select: { name: true } },
          product: {
            include: {
              orderItems: {
                where: { order: { createdAt: { gte: periodStart }, paymentStatus: "PAID" } },
                select: { total: true, quantity: true },
              },
            },
          },
        },
      }),
    ]);

  // Compute KPIs
  const currentRevenue = currentOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + o.total, 0);
  const prevRevenue = prevOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + o.total, 0);

  const currentOrderCount = currentOrders.length;
  const prevOrderCount = prevOrders.length;

  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrders.filter(o => o.paymentStatus === "PAID").length || 0 : 0;
  const prevAvg = prevOrders.filter(o => o.paymentStatus === "PAID").length > 0
    ? prevRevenue / prevOrders.filter(o => o.paymentStatus === "PAID").length : 0;

  function pct(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Time series
  const timeSeries = buildTimeSeries(currentOrders, periodStart, now, period);

  // Aggregate categories
  const catMap = new Map<string, { revenue: number; quantity: number }>();
  for (const pc of topCategories) {
    const name = pc.category.name;
    const existing = catMap.get(name) ?? { revenue: 0, quantity: 0 };
    for (const item of pc.product.orderItems) {
      existing.revenue += item.total;
      existing.quantity += item.quantity ?? 0;
    }
    catMap.set(name, existing);
  }
  const topCategoriesResult = Array.from(catMap.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return NextResponse.json({
    data: {
      kpis: {
        revenue: { value: currentRevenue, change: pct(currentRevenue, prevRevenue) },
        orders: { value: currentOrderCount, change: pct(currentOrderCount, prevOrderCount) },
        avgOrderValue: { value: avgOrderValue, change: pct(avgOrderValue, prevAvg) },
        newCustomers: { value: newCustomers, change: pct(newCustomers, prevCustomers) },
      },
      timeSeries,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantity: p._sum.quantity ?? 0,
        revenue: p._sum.total ?? 0,
      })),
      topCategories: topCategoriesResult,
    },
  });
}
