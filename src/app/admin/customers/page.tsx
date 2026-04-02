"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
  orders: { total: number }[];
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(search)}`);
      const json = await res.json();
      setCustomers(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total customers</p>
        </div>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No customers yet</p>
            <p className="text-sm mt-1">Customers will appear here once they sign up</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Total Spent</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce((s, o) => s + o.total, 0);
                const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—";
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {customer.avatarUrl ? (
                          <Image src={customer.avatarUrl} alt={name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                            {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${customer.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"}`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-gray-900">{customer._count.orders}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(totalSpent)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
