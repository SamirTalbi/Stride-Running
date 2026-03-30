"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, Upload, Star, Grip } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

type ProductImage = { url: string; isPrimary: boolean; sortOrder: number };

type Product = {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  gender: string;
  terrain: string;
  slug: string;
  description: string | null;
  brand: { name: string } | null;
  images: { url: string; isPrimary: boolean }[];
  variants: { price: number; stock: number }[];
  categories: { category: { name: string } }[];
};

const emptyForm = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  brandId: "",
  gender: "UNISEX",
  terrain: "ROAD",
  cushionLevel: "MEDIUM",
  stability: "NEUTRAL",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isActive: true,
  variantPrice: "",
  variantStock: "",
  variantSize: "",
  variantColor: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; parent: { name: string } | null }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((j) => setBrands(j.data ?? []));
    fetch("/api/admin/categories").then((r) => r.json()).then((j) => setCategories(j.data ?? []));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(search)}&limit=20`);
      const json = await res.json();
      setProducts(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  function openCreate() {
    setForm(emptyForm);
    setImages([]);
    setSelectedCategories([]);
    setEditingId(null);
    setShowForm(true);
  }

  async function openEdit(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`);
    const json = await res.json();
    const p = json.data;
    setForm({
      name: p.name ?? "",
      sku: p.sku ?? "",
      slug: p.slug ?? "",
      description: p.description ?? "",
      brandId: p.brandId ?? "",
      gender: p.gender ?? "UNISEX",
      terrain: p.terrain ?? "ROAD",
      cushionLevel: p.cushionLevel ?? "MEDIUM",
      stability: p.stability ?? "NEUTRAL",
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isBestSeller: p.isBestSeller ?? false,
      isActive: p.isActive ?? true,
      variantPrice: p.variants?.[0]?.price?.toString() ?? "",
      variantStock: p.variants?.[0]?.stock?.toString() ?? "",
      variantSize: p.variants?.[0]?.size ?? "",
      variantColor: p.variants?.[0]?.color ?? "",
    });
    setImages(
      (p.images ?? []).map((img: { url: string; isPrimary: boolean }, i: number) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: i,
      }))
    );
    setSelectedCategories((p.categories ?? []).map((pc: { categoryId: string }) => pc.categoryId));
    setEditingId(product.id);
    setShowForm(true);
  }

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const idx = images.length + i;
      setUploadingIdx(idx);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.url) {
          setImages((prev) => [
            ...prev,
            { url: json.url, isPrimary: prev.length === 0, sortOrder: prev.length },
          ]);
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploadingIdx(null);
      }
    }
  }

  function setPrimary(idx: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i }));
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        slug: form.slug,
        description: form.description,
        brandId: form.brandId || null,
        gender: form.gender,
        terrain: form.terrain,
        cushionLevel: form.cushionLevel,
        stability: form.stability,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        isActive: form.isActive,
        images,
        categoryIds: selectedCategories,
        variants: form.variantPrice
          ? [{
              size: form.variantSize || "ONE SIZE",
              color: form.variantColor || "Default",
              price: parseFloat(form.variantPrice),
              stock: parseInt(form.variantStock) || 0,
              isActive: true,
            }]
          : [],
      };

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setShowForm(false);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  }

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-500",
    "Out of Stock": "bg-red-100 text-red-700",
    "Low Stock": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const price = product.variants.length > 0 ? Math.min(...product.variants.map((v) => v.price)) : 0;
                const stock = product.variants.reduce((s, v) => s + v.stock, 0);
                const status = !product.isActive ? "Inactive" : stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "Active";
                const image = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {image ? (
                            <Image src={image} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand?.name ?? "—"} · {product.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900">{price > 0 ? formatPrice(price) : "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${stock === 0 ? "text-red-500" : stock <= 10 ? "text-amber-600" : "text-gray-900"}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[status] ?? "bg-amber-100 text-amber-700"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(product.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6">

              {/* Images */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Images</h3>

                {/* Upload zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
                >
                  {uploadingIdx !== null ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-brand-500" />
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP — multiple files supported</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className={`relative group rounded-lg overflow-hidden border-2 ${img.isPrimary ? "border-brand-500" : "border-transparent"}`}>
                        <Image src={img.url} alt={`Image ${idx + 1}`} width={120} height={120} className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPrimary(idx)}
                            title="Set as primary"
                            className="p-1 bg-white rounded-full text-amber-500 hover:bg-amber-50"
                          >
                            <Star size={12} fill={img.isPrimary ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => removeImage(idx)}
                            title="Remove"
                            className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {img.isPrimary && (
                          <span className="absolute top-1 left-1 text-[9px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {images.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Star size={10} /> Hover une image et clique l&apos;étoile pour la définir comme principale
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Info</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Nike Air Zoom Pegasus 40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="NK-PEG40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="nike-air-zoom-pegasus-40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Product description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">— No brand —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={(e) => {
                              setSelectedCategories((prev) =>
                                e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                              );
                            }}
                            className="w-4 h-4 accent-brand-500"
                          />
                          <span className="text-sm text-gray-700">
                            {cat.parent ? <span className="text-gray-400">{cat.parent.name} / </span> : null}
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Assign to Accessories to hide from Men/Women pages</p>
                  </div>
                )}
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attributes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "gender", label: "Gender", options: [["MEN","Men"],["WOMEN","Women"],["UNISEX","Unisex"],["KIDS","Kids"]] },
                    { key: "terrain", label: "Terrain", options: [["ROAD","Road"],["TRAIL","Trail"],["TRACK","Track"],["TREADMILL","Treadmill"],["MULTI","Multi"]] },
                    { key: "cushionLevel", label: "Cushion Level", options: [["MINIMAL","Minimal"],["LOW","Low"],["MEDIUM","Medium"],["HIGH","High"],["MAX","Max"]] },
                    { key: "stability", label: "Stability", options: [["NEUTRAL","Neutral"],["STABILITY","Stability"],["MOTION_CONTROL","Motion Control"]] },
                  ].map(({ key, label, options }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <select
                        value={form[key as keyof typeof form] as string}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing & Stock</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      value={form.variantPrice}
                      onChange={(e) => setForm((f) => ({ ...f, variantPrice: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="129.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.variantStock}
                      onChange={(e) => setForm((f) => ({ ...f, variantStock: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input
                      value={form.variantSize}
                      onChange={(e) => setForm((f) => ({ ...f, variantSize: e.target.value }))}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="42"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Black", hex: "#111111" },
                        { name: "White", hex: "#ffffff" },
                        { name: "Gray", hex: "#9ca3af" },
                        { name: "Navy", hex: "#1e3a5f" },
                        { name: "Blue", hex: "#3b82f6" },
                        { name: "Red", hex: "#ef4444" },
                        { name: "Orange", hex: "#f97316" },
                        { name: "Green", hex: "#22c55e" },
                        { name: "Yellow", hex: "#eab308" },
                        { name: "Pink", hex: "#ec4899" },
                        { name: "Purple", hex: "#a855f7" },
                        { name: "Brown", hex: "#92400e" },
                        { name: "Beige", hex: "#d4b896" },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() => setForm((f) => ({ ...f, variantColor: f.variantColor === c.name ? "" : c.name }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${form.variantColor === c.name ? "border-brand-500 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"}`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {c.name === "White" && <span className="sr-only">White</span>}
                        </button>
                      ))}
                    </div>
                    {form.variantColor && (
                      <p className="text-xs text-gray-500 mt-1.5">Sélectionné : <strong>{form.variantColor}</strong></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Options / Flags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Options</h3>
                {[
                  { key: "isActive", label: "Active (visible on site)" },
                  { key: "isFeatured", label: "Featured" },
                  { key: "isNewArrival", label: "New Arrival" },
                  { key: "isBestSeller", label: "Best Seller" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.sku || !form.slug}
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
            <h3 className="font-bold text-gray-900 mb-2">Delete product?</h3>
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
