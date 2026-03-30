"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, X, Save, Loader2, Tag, ToggleLeft, ToggleRight } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

const emptyForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const json = await res.json();
    setCoupons(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  async function handleSave() {
    if (!form.code || !form.value) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error"); return; }
      setShowForm(false);
      setForm(emptyForm);
      fetchCoupons();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/admin/discounts/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    fetchCoupons();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCoupons();
  }

  function formatDiscount(coupon: Coupon) {
    if (coupon.type === "PERCENTAGE") return `${coupon.value}% off`;
    if (coupon.type === "FIXED") return `$${coupon.value} off`;
    return "Free shipping";
  }

  function isExpired(coupon: Coupon) {
    return coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Discounts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} coupon codes</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setError(""); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No coupons yet</p>
            <p className="text-sm mt-1">Create your first discount code</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Usage</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Expires</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-900">{formatDiscount(coupon)}</span>
                    {coupon.minOrderAmount && (
                      <p className="text-xs text-gray-400">Min. ${coupon.minOrderAmount}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-gray-600">
                      {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""} uses
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {coupon.expiresAt ? (
                      <span className={`text-xs ${isExpired(coupon) ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                        {isExpired(coupon) ? "Expired · " : ""}
                        {new Date(coupon.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(coupon)} className="flex items-center gap-1.5">
                      {coupon.isActive && !isExpired(coupon) ? (
                        <><ToggleRight size={20} className="text-green-500" /><span className="text-xs font-semibold text-green-600">Active</span></>
                      ) : (
                        <><ToggleLeft size={20} className="text-gray-300" /><span className="text-xs font-semibold text-gray-400">Inactive</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDeleteId(coupon.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Create Coupon</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="flex-1 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="SUMMER20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ($)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>
                {form.type !== "FREE_SHIPPING" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value {form.type === "PERCENTAGE" ? "(%)" : "($)"} *
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder={form.type === "PERCENTAGE" ? "20" : "15"}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order ($)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starts At</label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-sm text-gray-700">Active immediately</span>
              </label>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code || (!form.value && form.type !== "FREE_SHIPPING")}
                className="flex items-center gap-2 px-5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Delete coupon?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
