"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = [
  "Nike Pegasus", "Brooks Ghost", "HOKA Clifton", "Trail shoes", "Beginner running"
];

const recentSearches = ["Asics Gel-Nimbus", "Women's trail", "Waterproof running jacket"];

// Mock search results for demo
const mockResults = [
  { id: "1", name: "Nike Air Zoom Pegasus 40", price: 130, slug: "nike-air-zoom-pegasus-40", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" },
  { id: "2", name: "Brooks Ghost 15", price: 140, slug: "brooks-ghost-15", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop" },
  { id: "3", name: "HOKA Clifton 9", price: 145, slug: "hoka-clifton-9", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=80&h=80&fit=crop" },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockResults);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(mockResults);
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults(
        mockResults.filter((r) =>
          r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      );
      setLoading(false);
    }, 200);
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={20} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shoes, brands, categories..."
            className="flex-1 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {!query ? (
            <div className="space-y-6">
              {/* Recent */}
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Clock size={12} /> Recent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-brand-50
                                   hover:text-brand-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-brand-50
                                 hover:text-brand-600 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">Try different keywords or browse categories</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/products/${result.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={result.image}
                      alt={result.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-500
                                  transition-colors">
                      {result.name}
                    </p>
                    <p className="text-sm text-brand-500 font-semibold">{formatPrice(result.price)}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                </Link>
              ))}

              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3 mt-2",
                  "text-sm font-semibold text-brand-500 hover:text-brand-600",
                  "border border-brand-200 rounded-xl hover:border-brand-400 transition-colors"
                )}
              >
                See all results for &ldquo;{query}&rdquo; <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
