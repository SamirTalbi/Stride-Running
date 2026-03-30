"use client";

import { useState } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductFilters, SortOption } from "@/types";

interface ProductFiltersProps {
  filters: ProductFilters;
  sortBy: SortOption;
  totalCount: number;
  availableBrands: string[];
  availableColors: string[];
  availableCategories: { slug: string; name: string }[];
  onFiltersChange: (filters: ProductFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "best-sellers", label: "Best Sellers" },
  { value: "new-arrivals", label: "Nouveautés" },
  { value: "top-rated", label: "Mieux notés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];

const priceRanges = [
  { label: "Moins de 50€", min: 0, max: 50 },
  { label: "50€ – 100€", min: 50, max: 100 },
  { label: "100€ – 150€", min: 100, max: 150 },
  { label: "150€ – 200€", min: 150, max: 200 },
  { label: "Plus de 200€", min: 200, max: 9999 },
];

// Common color swatches
const colorSwatches: Record<string, string> = {
  Black: "#111111",
  White: "#ffffff",
  Gray: "#9ca3af",
  Navy: "#1e3a5f",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Orange: "#f97316",
  Green: "#22c55e",
  Yellow: "#eab308",
  Pink: "#ec4899",
  Purple: "#a855f7",
  Brown: "#92400e",
  Beige: "#d4b896",
};

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}

export function ProductFiltersPanel({
  filters,
  sortBy,
  totalCount,
  availableBrands,
  availableColors,
  availableCategories,
  onFiltersChange,
  onSortChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFilterCount = [
    filters.size?.length ?? 0,
    filters.brand?.length ?? 0,
    filters.color?.length ?? 0,
    filters.category?.length ?? 0,
    filters.priceMin !== undefined ? 1 : 0,
    filters.inStock ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleArray = <T,>(arr: T[] | undefined, value: T): T[] => {
    const current = arr ?? [];
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  const FilterContent = () => (
    <div className="space-y-0">

      {/* Category */}
      {availableCategories.length > 0 && (
        <FilterSection title="Catégorie">
          <div className="space-y-1.5">
            {availableCategories.map((cat) => {
              const isActive = filters.category?.includes(cat.slug);
              return (
                <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isActive ?? false}
                    onChange={() => onFiltersChange({ ...filters, category: toggleArray(filters.category, cat.slug) })}
                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-brand-500 transition-colors">{cat.name}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Prix">
        <div className="space-y-1.5">
          {priceRanges.map((range) => {
            const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() =>
                  onFiltersChange(
                    isActive
                      ? { ...filters, priceMin: undefined, priceMax: undefined }
                      : { ...filters, priceMin: range.min, priceMax: range.max }
                  )
                }
                className={cn(
                  "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <FilterSection title="Marque">
          <div className="space-y-1.5">
            {availableBrands.map((brand) => {
              const isActive = filters.brand?.includes(brand);
              return (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isActive ?? false}
                    onChange={() => onFiltersChange({ ...filters, brand: toggleArray(filters.brand, brand) })}
                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-brand-500 transition-colors">{brand}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <FilterSection title="Couleur">
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const isActive = filters.color?.includes(color);
              const hex = colorSwatches[color];
              return (
                <button
                  key={color}
                  onClick={() => onFiltersChange({ ...filters, color: toggleArray(filters.color, color) })}
                  title={color}
                  className={cn(
                    "relative w-8 h-8 rounded-full border-2 transition-all",
                    isActive ? "border-brand-500 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
                  )}
                  style={hex ? { backgroundColor: hex } : {}}
                >
                  {!hex && <span className="text-[9px] font-bold text-gray-600 leading-none">{color.slice(0, 3)}</span>}
                  {color === "White" && <span className="absolute inset-0 rounded-full border border-gray-200" />}
                </button>
              );
            })}
          </div>
          {filters.color && filters.color.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">{filters.color.join(", ")}</p>
          )}
        </FilterSection>
      )}

      {/* Size */}
      <FilterSection title="Taille" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => {
            const isActive = filters.size?.includes(size);
            return (
              <button
                key={size}
                onClick={() => onFiltersChange({ ...filters, size: toggleArray(filters.size, size) })}
                className={cn(
                  "px-2.5 h-9 rounded-lg text-xs font-medium border transition-all duration-150",
                  isActive
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-200 text-gray-700 hover:border-brand-300"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Availability */}
      <div className="pb-4">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStock ?? false}
            onChange={() => onFiltersChange({ ...filters, inStock: !filters.inStock })}
            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm font-bold text-gray-800">En stock uniquement</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand-300 transition-colors shadow-sm"
        >
          <SlidersHorizontal size={16} />
          Filtres
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 flex-shrink-0 ml-auto">{totalCount} produits</span>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              Filtres
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </h3>
            {activeFilterCount > 0 && (
              <button onClick={onClearFilters} className="text-xs text-brand-500 font-semibold hover:text-brand-600 flex items-center gap-1">
                <X size={12} /> Effacer
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Filtres</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Sort in mobile */}
              <FilterSection title="Trier par">
                <div className="space-y-1.5">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSortChange(opt.value)}
                      className={cn(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                        sortBy === opt.value ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FilterSection>
              <FilterContent />
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors"
              >
                Voir {totalCount} résultats
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
