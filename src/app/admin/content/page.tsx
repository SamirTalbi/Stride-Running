"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  author: string;
  category: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  tags: string;
  published: boolean;
  metaTitle: string;
  metaDesc: string;
};

const EMPTY_FORM: PostForm = {
  title: "", slug: "", excerpt: "", content: "", imageUrl: "",
  author: "Stride Team", category: "", tags: "", published: false,
  metaTitle: "", metaDesc: "",
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ContentPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"" | "true" | "false">("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"blog">("blog");

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ q: search, published: filter });
    fetch(`/api/admin/blog?${params}`)
      .then((r) => r.json())
      .then((j) => { setPosts(j.data ?? []); setTotal(j.total ?? 0); })
      .finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal("create");
  }

  async function openEdit(id: string) {
    setEditId(id);
    setModal("edit");
    const r = await fetch(`/api/admin/blog/${id}`);
    const j = await r.json();
    const p = j.data;
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt ?? "",
      content: p.content, imageUrl: p.imageUrl ?? "",
      author: p.author, category: p.category ?? "",
      tags: (p.tags ?? []).join(", "), published: p.published,
      metaTitle: p.metaTitle ?? "", metaDesc: p.metaDesc ?? "",
    });
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      slug: form.slug || slugify(form.title),
    };
    const url = editId ? `/api/admin/blog/${editId}` : "/api/admin/blog";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setModal(null);
    fetchPosts();
  }

  async function togglePublish(post: Post) {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchPosts();
  }

  const field = (key: keyof PostForm, label: string, type: "text" | "textarea" | "url" | "checkbox" = "text") => {
    if (type === "checkbox") return (
      <label key={key} className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form[key] as boolean}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
          className="w-4 h-4 accent-brand-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>
    );
    if (type === "textarea") return (
      <div key={key} className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <textarea value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={key === "content" ? 12 : 3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-y" />
      </div>
    );
    return (
      <div key={key} className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <input type={type} value={form[key] as string}
          onChange={(e) => {
            const val = e.target.value;
            if (key === "title" && !form.slug) {
              setForm((f) => ({ ...f, title: val, slug: slugify(val) }));
            } else {
              setForm((f) => ({ ...f, [key]: val }));
            }
          }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Content</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage blog posts and editorial content</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab("blog")}
          className={cn("px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
            activeTab === "blog" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
          Blog Posts <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{total}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search posts…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "" | "true" | "false")}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
          <option value="">All status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">No posts yet.</p>
            <button onClick={openCreate} className="mt-3 text-brand-500 text-sm font-semibold hover:underline">Create your first post →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 truncate max-w-[260px]">{post.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[260px]">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{post.category || "—"}</td>
                  <td className="px-4 py-4 text-gray-600">{post.author}</td>
                  <td className="px-4 py-4">
                    <span className={cn("text-[11px] font-bold px-2 py-1 rounded-full",
                      post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => togglePublish(post)}
                        className={cn("p-1.5 rounded-lg transition-colors",
                          post.published ? "text-gray-400 hover:text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-green-500 hover:bg-green-50")}>
                        {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(post.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        {deleting === post.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal === "create" ? "New Blog Post" : "Edit Post"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {field("title", "Title")}
                {field("slug", "Slug (URL)")}
              </div>
              {field("excerpt", "Excerpt", "textarea")}
              {field("content", "Content", "textarea")}
              <div className="grid grid-cols-3 gap-4">
                {field("author", "Author")}
                {field("category", "Category")}
                {field("tags", "Tags (comma-separated)")}
              </div>
              {field("imageUrl", "Cover Image URL", "url")}
              <div className="grid grid-cols-2 gap-4">
                {field("metaTitle", "Meta Title")}
                {field("metaDesc", "Meta Description")}
              </div>
              {field("published", "Publish immediately", "checkbox")}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.content}
                className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {modal === "create" ? "Create Post" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
