"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Download, Save, Star, X, Link as LinkIcon, AlertCircle, Plus, Check } from "lucide-react";

type Extracted = {
  url: string;
  name: string | null;
  brand: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  sku: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  source: string;
};

type Brand = { id: string; name: string; slug: string };
type Category = { id: string; name: string; parent: { name: string } | null };

const COLOR_PRESETS = [
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
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminImportPage() {
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [gender, setGender] = useState("UNISEX");
  const [terrain, setTerrain] = useState("ROAD");
  const [stock, setStock] = useState("999");
  const [sizesStr, setSizesStr] = useState("39,40,41,42,43,44,45,46");
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((j) => setBrands(j.data ?? []));
    fetch("/api/admin/categories").then((r) => r.json()).then((j) => setCategories(j.data ?? []));
  }, []);

  async function handleExtract() {
    setError(null);
    setSuccess(null);
    if (!url.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/admin/import/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Extraction failed");
        return;
      }
      const e = json.data as Extracted;
      setExtracted(e);
      setName(e.name ?? "");
      const autoSlug = e.name ? slugify(e.name) : "";
      setSlug(autoSlug);
      setSku(e.sku ?? autoSlug.toUpperCase().slice(0, 20));
      setDescription(e.description ?? "");
      setPrice(e.price ? String(e.price) : "");
      setBrandName(e.brand ?? "");
      const matchingBrand = e.brand ? brands.find((b) => b.name.toLowerCase() === e.brand?.toLowerCase()) : null;
      setBrandId(matchingBrand?.id ?? "");
      setImageUrls(e.images);
      setPrimaryIdx(0);
      setColors(
        e.colors.length
          ? e.colors.map((c) => ({ name: c, hex: COLOR_PRESETS.find((p) => p.name.toLowerCase() === c.toLowerCase())?.hex ?? "#888888" }))
          : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setExtracting(false);
    }
  }

  function handleNameChange(v: string) {
    setName(v);
    setSlug(slugify(v));
  }

  function toggleColor(preset: { name: string; hex: string }) {
    setColors((prev) => {
      const has = prev.find((c) => c.name === preset.name);
      return has ? prev.filter((c) => c.name !== preset.name) : [...prev, preset];
    });
  }

  function removeImage(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    if (primaryIdx >= idx) setPrimaryIdx((p) => Math.max(0, p - 1));
  }

  async function handleImport() {
    setError(null);
    setSuccess(null);
    if (!name || !sku || !price || imageUrls.length === 0) {
      setError("Name, SKU, price and at least one image are required");
      return;
    }
    setImporting(true);
    try {
      const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        name,
        slug,
        sku,
        description: description || undefined,
        brandId: brandId || null,
        brandName: brandId ? null : brandName || null,
        gender,
        terrain,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 999,
        sizes,
        colors: colors.length ? colors : [{ name: "Default" }],
        imageUrls,
        primaryImageIndex: primaryIdx,
        categoryIds: selectedCategories,
      };
      const res = await fetch("/api/admin/import/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Import failed");
        return;
      }
      setSuccess(`Created — ${json.data.variants} variants, ${json.data.images} images${json.data.skipped ? ` (${json.data.skipped} skipped)` : ""}`);
      setExtracted(null);
      setUrl("");
      setName("");
      setSlug("");
      setSku("");
      setDescription("");
      setPrice("");
      setBrandId("");
      setBrandName("");
      setColors([]);
      setImageUrls([]);
      setSelectedCategories([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Import depuis URL</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Colle une URL produit (Nike, On, Under Armour, Alo, etc.) — j&apos;extrais les infos et tu valides.
        </p>
      </div>

      {/* URL bar */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExtract()}
              placeholder="https://www.nike.com/fr/t/..."
              className="w-full h-11 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={extracting || !url.trim()}
            className="flex items-center gap-2 px-5 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {extracting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Extract
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {extracted && (
        <div className="space-y-6">
          {/* Source badge */}
          <div className="text-xs text-gray-500">
            Données extraites via <span className="font-semibold">{extracted.source}</span> · {imageUrls.length} image(s)
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Images ({imageUrls.length})</h2>
            {imageUrls.length === 0 ? (
              <p className="text-sm text-gray-400">No images extracted</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imageUrls.map((src, idx) => (
                  <div
                    key={src}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 group cursor-pointer ${
                      primaryIdx === idx ? "border-brand-500 ring-2 ring-brand-200" : "border-gray-100"
                    }`}
                    onClick={() => setPrimaryIdx(idx)}
                  >
                    <Image src={src} alt="" fill className="object-cover" unoptimized />
                    {primaryIdx === idx && (
                      <span className="absolute top-1 left-1 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star size={9} fill="currentColor" /> MAIN
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— Use extracted name —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {!brandId && brandName && (
                  <p className="text-xs text-gray-500 mt-1">Will create brand: <strong>{brandName}</strong></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Variants config */}
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Variants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                  <option value="UNISEX">Unisex</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terrain</label>
                <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                  <option value="ROAD">Road</option>
                  <option value="TRAIL">Trail</option>
                  <option value="TRACK">Track</option>
                  <option value="TREADMILL">Treadmill</option>
                  <option value="MULTI">Multi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock / variant</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
              <input
                value={sizesStr}
                onChange={(e) => setSizesStr(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => {
                  const active = colors.some((x) => x.name === c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                        active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      {active && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {colors.length === 0
                  ? "No colors selected → single 'Default' color × all sizes"
                  : `${colors.length} color${colors.length > 1 ? "s" : ""} × ${sizesStr.split(",").filter(Boolean).length} sizes = ${colors.length * sizesStr.split(",").filter(Boolean).length} variants`}
              </p>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
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
                    <span className="text-gray-700">
                      {cat.parent ? <span className="text-gray-400">{cat.parent.name} / </span> : null}
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-4">
            {(() => {
              const missing: string[] = [];
              if (!name) missing.push("Name");
              if (!sku) missing.push("SKU");
              if (!price) missing.push("Price");
              if (imageUrls.length === 0) missing.push("at least one image");
              return missing.length > 0 ? (
                <p className="text-xs text-amber-600 text-center mb-2">
                  Missing: <strong>{missing.join(", ")}</strong>
                </p>
              ) : null;
            })()}
            <button
              onClick={handleImport}
              disabled={importing || !name || !sku || !price || imageUrls.length === 0}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {importing ? "Downloading images & saving..." : "Create product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
