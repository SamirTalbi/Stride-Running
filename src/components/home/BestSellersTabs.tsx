"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

const tabs = ["Tous", "Homme", "Femme", "Trail", "Nouveautés"];

export default function BestSellersTabs({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("Tous");

  const filtered = products.filter((p) => {
    if (activeTab === "Tous") return true;
    if (activeTab === "Homme") return p.gender === "MEN";
    if (activeTab === "Femme") return p.gender === "WOMEN";
    if (activeTab === "Trail") return p.terrain === "TRAIL";
    if (activeTab === "Nouveautés") return p.isNewArrival;
    return true;
  });

  return (
    <>
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeTab === tab
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Aucun produit dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </>
  );
}
