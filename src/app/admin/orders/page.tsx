"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  user: { firstName: string | null; lastName: string | null } | null;
  items: { product: { name: string } }[];
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-brand-100 text-brand-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      setOrders(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  async function deleteOrder(id: string) {
    if (!confirm("Supprimer cette commande ? Cette action est irréversible.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchOrders();
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    fetchOrders();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by order # or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-gray-700">
                      {order.user ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || order.email : order.email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${paymentColors[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="relative flex items-center gap-1">
                      {updatingId === order.id ? (
                        <Loader2 size={14} className="animate-spin text-brand-500" />
                      ) : (
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`appearance-none text-[10px] font-bold px-2 py-1 pr-5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {deletingId === order.id ? (
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                    ) : (
                      <button onClick={() => deleteOrder(order.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
