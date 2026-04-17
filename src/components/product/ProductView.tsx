"use client";

import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { ProductDetails } from "./ProductDetails";
import type { Product, ProductImage } from "@/types";

interface ProductViewProps {
  product: Product & { images: ProductImage[] };
}

export function ProductView({ product }: ProductViewProps) {
  const initialColor = product.variants[0]?.color ?? "";
  const [activeColor, setActiveColor] = useState<string>(initialColor);

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
      <ProductGallery
        images={product.images}
        productName={product.name}
        activeColor={activeColor}
      />
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductDetails
          product={product}
          onColorChange={setActiveColor}
        />
      </div>
    </div>
  );
}
