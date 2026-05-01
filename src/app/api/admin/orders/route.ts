import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");
  const search = searchParams.get("q") ?? "";

  const where: Record<string, unknown> = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({ data: orders, total, page, totalPages: Math.ceil(total / limit) });
}
