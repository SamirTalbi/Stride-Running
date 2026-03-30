"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit2, Trash2, X, Save, Loader2, Sparkles, Upload } from "lucide-react";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  parent: { name: string } | null;
  _count: { products: number };
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  parentId: "",
  sortOrder: 0,
  isActive: true,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      setCategories(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function seedAccessories() {
    setSeeding(true);
    try {
      await fetch("/api/admin/categories/seed", { method: "POST" });
      fetchCategories();
    } finally {
      setSeeding(false);
    }
  }

  const parents = categories.filter((c) => !c.parentId);

  function openCreate() {
    setForm({ ...emptyForm, sortOrder: categories.length });
    setEditingId(null);
    setShowForm(true);
  }

  async function handleImageUpload(file: File) {
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) setForm((f) => ({ ...f, imageUrl: json.url }));
    } finally {
      setUploadingImg(false);
    }
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: (cat as Category & { imageUrl?: string }).imageUrl ?? "",
      parentId: cat.parentId ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error ?? "Error saving category");
        return;
      }
      setShowForm(false);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  }

  // Group: parents first, then children indented
  const sorted = [
    ...categories.filter((c) => !c.parentId),
    ...categories.filter((c) => c.parentId),
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={seedAccessories}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Creates Shoes, Apparel and Accessories categories with all sub-categories"
          >
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate all categories
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No categories yet</p>
            <p className="text-sm mt-1">Start by creating an &quot;Accessories&quot; parent category</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((cat) => (
                <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${cat.parentId ? "bg-gray-50/50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className={cat.parentId ? "pl-4 border-l-2 border-brand-200" : ""}>
                      <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{cat.slug}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-500">{cat.parent?.name ?? <span className="text-gray-300">—</span>}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-700">{cat._count.products}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        disabled={cat._count.products > 0}
                        title={cat._count.products > 0 ? "Cannot delete: has products" : "Delete"}
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
        )}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{editingId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="GPS Watches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="gps-watches"
                />
                <p className="text-xs text-gray-400 mt-1">URL: /accessories/{form.slug || "..."}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— Top level (no parent) —</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Short description..."
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image de la catégorie</label>
                {form.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
                    <Image src={form.imageUrl} alt="Category" fill className="object-cover" />
                    <button
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
                  >
                    {uploadingImg ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-brand-500" />
                        <p className="text-sm text-gray-500">Upload en cours...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-600">Cliquer pour uploader</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP — ratio 16:9 recommandé</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-sm text-gray-700">Active</span>
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
            <h3 className="font-bold text-gray-900 mb-2">Delete category?</h3>
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
