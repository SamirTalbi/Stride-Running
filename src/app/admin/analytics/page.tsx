"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Period = "7d" | "30d" | "90d" | "12m";

type AnalyticsData = {
  kpis: {
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    avgOrderValue: { value: number; change: number };
    newCustomers: { value: number; change: number };
  };
  timeSeries: { label: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCategories: { name: string; revenue: number; quantity: number }[];
};

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "12m" },
];

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "#22c55e",
  SHIPPED:   "#3b82f6",
  PROCESSING:"#f59e0b",
  CONFIRMED: "#f97316",
  PENDING:   "#94a3b8",
  CANCELLED: "#ef4444",
};

const PIE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#1e293b", "#94a3b8"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KpiTooltip({ value }: { value: any }) {
  return <span className="text-xs">{formatPrice(value)}</span>;
}
KpiTooltip;

function Trend({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? "+" : ""}{change}%
    </span>
  );
}

function KpiCard({
  label, value, change, icon: Icon, color, format = "number",
}: {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  format?: "currency" | "number";
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <Trend change={change} />
      </div>
      <p className="text-2xl font-black text-gray-900">
        {format === "currency" ? formatPrice(value) : value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">vs previous period</p>
    </div>
  );
}

// Custom tooltip for area/bar charts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-DEFAULT text-white text-xs rounded-xl px-3 py-2 shadow-lg">
      <p className="font-bold mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === "revenue" ? formatPrice(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"revenue" | "orders">("revenue");

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Performance overview for your store</p>
        </div>
        {/* Period selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <Zap size={20} className="animate-pulse text-brand-500" />
            <span className="text-sm font-medium">Loading analytics…</span>
          </div>
        </div>
      ) : !data ? (
        <p className="text-gray-400 text-sm text-center py-20">No data available.</p>
      ) : (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard label="Revenue" value={data.kpis.revenue.value} change={data.kpis.revenue.change}
              icon={DollarSign} color="bg-green-50 text-green-500" format="currency" />
            <KpiCard label="Total Orders" value={data.kpis.orders.value} change={data.kpis.orders.change}
              icon={ShoppingBag} color="bg-blue-50 text-blue-500" />
            <KpiCard label="Avg Order Value" value={data.kpis.avgOrderValue.value} change={data.kpis.avgOrderValue.change}
              icon={Zap} color="bg-brand-50 text-brand-500" format="currency" />
            <KpiCard label="New Customers" value={data.kpis.newCustomers.value} change={data.kpis.newCustomers.change}
              icon={Users} color="bg-purple-50 text-purple-500" />
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Over Time</h2>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setActiveChart("revenue")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeChart === "revenue" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setActiveChart("orders")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeChart === "orders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.timeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => activeChart === "revenue" ? `$${(v / 100).toFixed(0)}` : String(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                {activeChart === "revenue" ? (
                  <Area type="monotone" dataKey="revenue" name="Revenue"
                    stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 4 }} />
                ) : (
                  <Area type="monotone" dataKey="orders" name="Orders"
                    stroke="#3b82f6" strokeWidth={2} fill="url(#colorOrders)" dot={false} activeDot={{ r: 4 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Orders by Status */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Orders by Status</h2>
              {data.ordersByStatus.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No orders</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.ordersByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={75}
                        paddingAngle={3}
                      >
                        {data.ordersByStatus.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any, name: any) => [v, name]}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {data.ordersByStatus.map((s) => (
                      <div key={s.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#94a3b8" }} />
                          <span className="text-gray-600 capitalize">{s.status.toLowerCase()}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Top Products</h2>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No sales data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.topProducts.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false} tickLine={false} width={90}
                      tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#f97316" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Top Categories</h2>
              {data.topCategories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.topCategories}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {data.topCategories.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any, name: any) => [formatPrice(v as number), name]}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {data.topCategories.map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-600">{c.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatPrice(c.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
