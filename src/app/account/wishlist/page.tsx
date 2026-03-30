"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetch(`/api/products?ids=${items.join(",")}`)
      .then((r) => r.json())
      .then((j) => setProducts(j.data ?? []))
      .finally(() => setLoading(false));
  }, [items]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-brand-500 fill-brand-500" />
        <h1 className="text-3xl font-black text-gray-900">Ma liste de souhaits</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-400">({items.length} article{items.length !== 1 ? "s" : ""})</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Votre liste de souhaits est vide</h2>
          <p className="text-gray-500 mb-6">Sauvegardez les produits que vous aimez et retrouvez-les quand vous voulez.</p>
          <Link
            href="/men"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            <ShoppingBag size={18} /> Voir les produits
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} priority={i < 4} />
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow text-gray-400
                             hover:text-red-500 hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                  title="Retirer de la liste de souhaits"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => items.forEach(removeItem)}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Vider la liste
            </button>
          </div>
        </>
      )}
    </div>
  );
}
