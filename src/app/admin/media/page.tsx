"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Upload, Search, Trash2, Copy, Check, Loader2, Image as ImageIcon, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaAsset = {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  created_at: string;
  folder: string;
  filename: string;
};

const FOLDERS = [
  { label: "All", value: "stride-running" },
  { label: "Products", value: "stride-running/products" },
  { label: "Blog", value: "stride-running/blog" },
  { label: "Banners", value: "stride-running/banners" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("stride-running");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetchAssets = useCallback((reset = true) => {
    if (reset) {
      setLoading(true);
      setAssets([]);
      setNextCursor(null);
    }
    const params = new URLSearchParams({ folder, q: search });
    if (!reset && nextCursor) params.set("cursor", nextCursor);

    fetch(`/api/admin/media?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setAssets((prev) => reset ? (j.resources ?? []) : [...prev, ...(j.resources ?? [])]);
        setNextCursor(j.nextCursor ?? null);
      })
      .finally(() => { setLoading(false); setLoadingMore(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, search]);

  useEffect(() => { fetchAssets(true); }, [fetchAssets]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress([]);

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      setUploadProgress((p) => [...p, `Uploading ${file.name}…`]);
      const formData = new FormData();
      formData.append("file", file);
      // Determine folder based on selected
      const targetFolder = folder === "stride-running" ? "stride-running/products" : folder;
      formData.append("folder", targetFolder);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          setUploadProgress((p) => p.map((s) => s.includes(file.name) ? `✓ ${file.name}` : s));
        } else {
          setUploadProgress((p) => p.map((s) => s.includes(file.name) ? `✗ ${file.name} failed` : s));
        }
      } catch {
        setUploadProgress((p) => p.map((s) => s.includes(file.name) ? `✗ ${file.name} error` : s));
      }
    }

    setUploading(false);
    setTimeout(() => { setUploadProgress([]); fetchAssets(true); }, 1200);
  }

  async function handleDelete(publicId: string) {
    if (!confirm("Delete this image permanently?")) return;
    setDeleting(publicId);
    if (selected?.public_id === publicId) setSelected(null);
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
    setDeleting(null);
    fetchAssets(true);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  // Drag & drop
  function onDragOver(e: React.DragEvent) { e.preventDefault(); dropRef.current?.classList.add("ring-2", "ring-brand-500"); }
  function onDragLeave() { dropRef.current?.classList.remove("ring-2", "ring-brand-500"); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dropRef.current?.classList.remove("ring-2", "ring-brand-500");
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="p-4 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Media Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">{assets.length} assets loaded</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchAssets(true)}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div ref={dropRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-6 text-center transition-all cursor-pointer hover:border-brand-400 hover:bg-brand-50/30"
        onClick={() => fileInputRef.current?.click()}>
        <Upload size={20} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Drag & drop images here or <span className="text-brand-500 font-semibold">click to browse</span></p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, GIF supported</p>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 mb-5 space-y-1">
          {uploadProgress.map((msg, i) => (
            <p key={i} className={cn("text-xs font-mono", msg.startsWith("✓") ? "text-green-400" : msg.startsWith("✗") ? "text-red-400" : "text-gray-300")}>
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search assets…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FOLDERS.map((f) => (
            <button key={f.value} onClick={() => setFolder(f.value)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                folder === f.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ImageIcon size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No media found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {assets.map((asset) => (
                  <div key={asset.public_id}
                    onClick={() => setSelected(asset)}
                    className={cn("group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                      selected?.public_id === asset.public_id ? "border-brand-500" : "border-transparent hover:border-gray-300")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.secure_url} alt={asset.public_id}
                      className="w-full h-full object-cover" loading="lazy" />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <button onClick={(e) => { e.stopPropagation(); copyUrl(asset.secure_url); }}
                        className="p-1.5 bg-white rounded-lg text-gray-700 hover:text-brand-500 transition-colors">
                        {copied === asset.secure_url ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.public_id); }}
                        disabled={deleting === asset.public_id}
                        className="p-1.5 bg-white rounded-lg text-gray-700 hover:text-red-500 transition-colors">
                        {deleting === asset.public_id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {nextCursor && (
                <div className="flex justify-center mt-6">
                  <button onClick={() => { setLoadingMore(true); fetchAssets(false); }} disabled={loadingMore}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                    {loadingMore && <Loader2 size={14} className="animate-spin" />}
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-4 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Details</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.secure_url} alt={selected.public_id}
                className="w-full aspect-square object-cover rounded-xl mb-4 bg-gray-100" />
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Filename</p>
                  <p className="text-gray-800 font-semibold truncate">{selected.filename}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-400 font-medium">Size</p>
                    <p className="text-gray-800 font-semibold">{formatBytes(selected.bytes)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium">Format</p>
                    <p className="text-gray-800 font-semibold uppercase">{selected.format}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Uploaded</p>
                  <p className="text-gray-800">{new Date(selected.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">URL</p>
                  <p className="text-gray-600 text-[10px] break-all leading-relaxed">{selected.secure_url}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => copyUrl(selected.secure_url)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors">
                  {copied === selected.secure_url ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  Copy URL
                </button>
                <button onClick={() => handleDelete(selected.public_id)} disabled={deleting === selected.public_id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold text-red-600 transition-colors disabled:opacity-50">
                  {deleting === selected.public_id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
