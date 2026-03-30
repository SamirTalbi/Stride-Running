"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { ProductFiltersPanel } from "./ProductFilters";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import type { Product, ProductFilters, SortOption } from "@/types";
import { LayoutGrid, List, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  title?: string;
  showFilters?: boolean;
}

export function ProductGrid({ products, loading = false, title, showFilters = true }: ProductGridProps) {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("best-sellers");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Derive available filter options from actual products
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand?.name).filter(Boolean) as string[]);
    return Array.from(brands).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set(
      products.flatMap((p) => p.variants.map((v) => v.color).filter(Boolean) as string[])
    );
    return Array.from(colors).sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach((p) => {
      p.categories?.forEach((pc) => {
        // Handle both {category: {...}} and direct Category shapes
        const cat = "category" in pc ? pc.category : pc;
        if (cat?.slug) cats.set(cat.slug, cat.name);
      });
    });
    return Array.from(cats.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const handleClearFilters = () => setFilters({});

  const filtered = products.filter((p) => {
    if (filters.brand?.length && !filters.brand.includes(p.brand?.name ?? "")) return false;
    if (filters.color?.length) {
      const hasColor = p.variants.some((v) => filters.color!.includes(v.color ?? ""));
      if (!hasColor) return false;
    }
    if (filters.category?.length) {
      const hasCat = p.categories?.some((pc) => {
        const cat = "category" in pc ? pc.category : pc;
        return filters.category!.includes(cat?.slug ?? "");
      });
      if (!hasCat) return false;
    }
    if (filters.terrain?.length && !filters.terrain.includes(p.terrain)) return false;
    if (filters.cushionLevel?.length && !filters.cushionLevel.includes(p.cushionLevel)) return false;
    if (filters.inStock) {
      const hasStock = p.variants.some((v) => v.stock > 0);
      if (!hasStock) return false;
    }
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const price = p.variants[0]?.price ?? 0;
      if (filters.priceMin !== undefined && price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && price > filters.priceMax) return false;
    }
    if (filters.size?.length) {
      const hasSizes = p.variants.some((v) => filters.size!.includes(v.size) && v.stock > 0);
      if (!hasSizes) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0);
      case "price-desc": return (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0);
      case "top-rated": return b.avgRating - a.avgRating;
      case "new-arrivals": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {title && (
        <h1 className="font-display font-black text-display-md text-gray-900 mb-6">{title}</h1>
      )}

      <div className="flex gap-8">
        {showFilters && (
          <ProductFiltersPanel
            filters={filters}
            sortBy={sortBy}
            totalCount={sorted.length}
            availableBrands={availableBrands}
            availableColors={availableColors}
            availableCategories={availableCategories}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        )}

        <div className="flex-1 min-w-0">

          {/* Active filter tags */}
          {(() => {
            const tags: { label: string; onRemove: () => void }[] = [];
            filters.category?.forEach((slug) => {
              const cat = availableCategories.find((c) => c.slug === slug);
              tags.push({ label: cat?.name ?? slug, onRemove: () => setFilters((f) => ({ ...f, category: f.category?.filter((s) => s !== slug) })) });
            });
            filters.brand?.forEach((b) => tags.push({ label: b, onRemove: () => setFilters((f) => ({ ...f, brand: f.brand?.filter((v) => v !== b) })) }));
            filters.color?.forEach((c) => tags.push({ label: c, onRemove: () => setFilters((f) => ({ ...f, color: f.color?.filter((v) => v !== c) })) }));
            filters.size?.forEach((s) => tags.push({ label: `Taille ${s}`, onRemove: () => setFilters((f) => ({ ...f, size: f.size?.filter((v) => v !== s) })) }));
            if (filters.priceMin !== undefined) tags.push({ label: `${filters.priceMin}€ – ${filters.priceMax === 9999 ? "+" : filters.priceMax + "€"}`, onRemove: () => setFilters((f) => ({ ...f, priceMin: undefined, priceMax: undefined })) });
            if (filters.inStock) tags.push({ label: "En stock", onRemove: () => setFilters((f) => ({ ...f, inStock: false })) });
            if (tags.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span key={tag.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200">
                    {tag.label}
                    <button onClick={tag.onRemove} className="hover:text-brand-900 transition-colors"><X size={11} /></button>
                  </span>
                ))}
                <button onClick={handleClearFilters} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 underline">
                  Tout effacer
                </button>
              </div>
            );
          })()}

          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{sorted.length}</span> produits
            </p>
            <div className="flex items-center gap-3">
              <Select
                options={[
                  { value: "best-sellers", label: "Best Sellers" },
                  { value: "new-arrivals", label: "Nouveautés" },
                  { value: "top-rated", label: "Mieux notés" },
                  { value: "price-asc", label: "Prix croissant" },
                  { value: "price-desc", label: "Prix décroissant" },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 text-sm w-44"
              />
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn("p-1.5 rounded-md transition-colors", view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-gray-300 mb-3">Aucun produit trouvé</p>
              <p className="text-gray-400 mb-6">Essaie d&apos;ajuster les filtres</p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className={cn(
              view === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6" : "space-y-4"
            )}>
              {sorted.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 8} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
