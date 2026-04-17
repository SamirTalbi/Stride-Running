"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CartItem, Product, ProductVariant } from "@/types";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  brand?: { name: string } | null;
  images: { url: string; altText?: string | null }[];
  variants: { id: string; size: string; color: string; colorHex?: string; price: number; comparePrice?: number | null; stock: number; isActive: boolean }[];
}

export function CartUpsell({ cartItems }: { cartItems: CartItem[] }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (cartItems.length === 0) return;

    const excludeIds = cartItems.map((i) => i.product.id).join(",");

    // Guess gender from cart items (pick first recognizable one)
    const genderHint = cartItems
      .map((i) => (i.product as { gender?: string }).gender)
      .find((g) => g === "MEN" || g === "WOMEN");

    const params = new URLSearchParams({ exclude: excludeIds });
    if (genderHint) params.set("gender", genderHint);

    fetch(`/api/products/suggestions?${params}`)
      .then((r) => r.json())
      .then((data) => setSuggestions(Array.isArray(data) ? data.slice(0, 2) : []))
      .catch(() => {});
  }, [cartItems.length]); // re-fetch only when cart size changes

  if (suggestions.length === 0) return null;

  const handleAdd = (suggestion: Suggestion) => {
    const variant = suggestion.variants[0];
    if (!variant) return;

    // Build a minimal product shape compatible with addItem
    const product = {
      id: suggestion.id,
      name: suggestion.name,
      slug: suggestion.slug,
      images: suggestion.images.map((img, i) => ({
        id: `${suggestion.id}-img-${i}`,
        url: img.url,
        altText: img.altText ?? undefined,
        sortOrder: i,
        isPrimary: i === 0,
      })),
      brand: suggestion.brand ? { id: "", slug: "", ...suggestion.brand } : undefined,
      // fields required by Product type but not used in cart display
      sku: "",
      description: undefined,
      longDescription: undefined,
      gender: "UNISEX" as const,
      terrain: "ROAD" as const,
      cushionLevel: "MEDIUM" as const,
      stability: "NEUTRAL" as const,
      features: [],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isActive: true,
      avgRating: 0,
      reviewCount: 0,
      categories: [],
      variants: suggestion.variants,
      createdAt: "",
    };

    addItem(product as unknown as Product, variant as unknown as ProductVariant);
    setAddedId(suggestion.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="p-3 border border-dashed border-brand-200 rounded-2xl bg-brand-50/50">
      <p className="text-xs font-semibold text-brand-600 mb-2.5 flex items-center gap-1.5">
        <Sparkles size={12} /> Vous pourriez aussi aimer
      </p>
      <div className="space-y-2">
        {suggestions.map((s) => {
          const variant = s.variants[0];
          if (!variant) return null;
          const image = s.images[0];
          const isAdded = addedId === s.id;

          return (
            <div key={s.id} className="flex items-center gap-3">
              <Link href={`/products/${s.slug}`} className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText ?? s.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                {s.brand && (
                  <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">
                    {s.brand.name}
                  </p>
                )}
                <p className="text-xs font-medium text-gray-700 truncate">{s.name}</p>
                <p className="text-xs text-brand-500 font-semibold">{formatPrice(variant.price)}</p>
              </div>
              <button
                onClick={() => handleAdd(s)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs
                            transition-all duration-200 ${
                              isAdded
                                ? "bg-green-500 text-white"
                                : "bg-brand-500 text-white hover:bg-brand-600"
                            }`}
                aria-label={`Ajouter ${s.name} au panier`}
              >
                <Plus size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
