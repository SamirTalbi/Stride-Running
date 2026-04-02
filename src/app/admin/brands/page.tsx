"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Save, Loader2, ChevronUp, ChevronDown } from "lucide-react";

type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  isActive: true,
  sortOrder: 0,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands");
      const json = await res.json();
      setBrands(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  function openCreate() {
    setForm({ ...emptyForm, sortOrder: brands.length });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? "",
      logoUrl: brand.logoUrl ?? "",
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
    });
    setEditingId(brand.id);
    setShowForm(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/brands/${editingId}` : "/api/admin/brands";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error ?? "Error saving brand");
        return;
      }
      setShowForm(false);
      fetchBrands();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchBrands();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} brands</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No brands yet</p>
            <p className="text-sm mt-1">Add your first brand to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Order</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain rounded-lg bg-gray-100 p-1" />
                      ) : (
                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                          <span className="font-black text-brand-500 text-lg">{brand.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{brand.name}</p>
                        {brand.description && (
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{brand.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{brand.slug}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-700">{brand._count.products}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${brand.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{brand.sortOrder}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(brand)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(brand.id)}
                        disabled={brand._count.products > 0}
                        title={brand._count.products > 0 ? "Cannot delete brand with products" : "Delete"}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{editingId ? "Edit Brand" : "Add Brand"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nike"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="nike"
                />
                <p className="text-xs text-gray-400 mt-1">URL: /brands/{form.slug || "..."}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Short description of the brand..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://..."
                />
                {form.logoUrl && (
                  <div className="mt-2 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                    <img src={form.logoUrl} alt="logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Lower number = appears first on the brands page</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-sm text-gray-700">Active (visible on site)</span>
              </label>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.slug}
                className="flex items-center gap-2 px-5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editingId ? "Update" : "Create"}
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
            <h3 className="font-bold text-gray-900 mb-2">Delete brand?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
