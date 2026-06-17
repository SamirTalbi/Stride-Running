"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = [
  "Nike Pegasus", "Brooks Ghost", "HOKA Clifton", "Chaussures Trail", "Running débutant"
];

const recentSearches = ["Saucony Omni 9", "Ensemble running", "Casquette"];

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  price?: number;
  image?: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setResults(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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
            placeholder="Rechercher des chaussures, marques, catégories..."
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
            Annuler
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
                    <Clock size={12} /> Récent
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
                  <TrendingUp size={12} /> Tendances
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
              <p className="font-medium">Aucun résultat pour &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">Essayez d'autres mots-clés ou parcourez les catégories</p>
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
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.name}
                        width={56}
                        height={56}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {result.brand && (
                      <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">
                        {result.brand}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-500
                                  transition-colors">
                      {result.name}
                    </p>
                    {result.price !== undefined && (
                      <p className="text-sm text-brand-500 font-semibold">{formatPrice(result.price)}</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
