"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, DollarSign, Package, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

type Stats = {
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  todayCustomers: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    user: { firstName: string | null; lastName: string | null } | null;
  }[];
  topProducts: {
    productId: string;
    name: string;
    _sum: { quantity: number | null; total: number | null };
  }[];
};

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-brand-100 text-brand-700",
  PENDING: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => setStats(j.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  const cards = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue ?? 0), sub: "All time (paid)", icon: DollarSign, color: "bg-green-50 text-green-500" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, sub: `+${stats?.todayOrders ?? 0} today`, icon: ShoppingBag, color: "bg-blue-50 text-blue-500" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, sub: `+${stats?.todayCustomers ?? 0} today`, icon: Users, color: "bg-purple-50 text-purple-500" },
    { label: "Products", value: "—", sub: "Manage in Products", icon: Package, color: "bg-brand-50 text-brand-500" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            <p className="text-xs text-brand-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          {!stats?.recentOrders?.length ? (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => {
                const name = order.user
                  ? [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || order.email
                  : order.email;
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-xs font-semibold text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          {!stats?.topProducts?.length ? (
            <p className="text-sm text-gray-400 py-4 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((product, i) => (
                <div key={product.productId} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full text-xs font-bold text-gray-500 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product._sum.quantity ?? 0} sold</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(product._sum.total ?? 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
