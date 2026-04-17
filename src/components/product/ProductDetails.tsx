"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Heart, Zap, Truck, RotateCcw, Shield, ChevronDown,
  Star, Check, Share2, Ruler
} from "lucide-react";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { displaySize, sizeMatchesSaved } from "@/lib/sizes";
import { useSavedSize } from "@/hooks/useSavedSize";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

interface ProductDetailsProps {
  product: Product;
  onColorChange?: (color: string) => void;
}

export function ProductDetails({ product, onColorChange }: ProductDetailsProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<string>(
    product.variants[0]?.id ?? ""
  );
  const [sizeError, setSizeError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const closeCart = useCartStore((s) => s.closeCart);
  const { toggleItem, hasItem } = useWishlistStore();
  const { savedSize } = useSavedSize();
  const isWishlisted = hasItem(product.id);

  // Get unique colors
  const colors = product.variants.filter(
    (v, i, arr) => arr.findIndex((x) => x.color === v.color) === i
  );

  // Get sizes for selected color
  const selectedColor = colors.find((c) => c.id === selectedColorId)?.color ?? colors[0]?.color;
  const sizesForColor = product.variants.filter((v) => v.color === selectedColor);

  const selectedVariant = sizesForColor.find((v) => v.size === selectedSize);
  const price = selectedVariant?.price ?? product.variants[0]?.price ?? 0;
  const comparePrice = selectedVariant?.comparePrice ?? product.variants[0]?.comparePrice;
  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const lowStock = selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!selectedVariant) return;

    setAddingToCart(true);
    addItem(product, selectedVariant);
    await new Promise((r) => setTimeout(r, 600));
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Brand & badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {product.brand && (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="text-sm font-bold text-brand-500 hover:text-brand-600 uppercase tracking-wider"
            >
              {product.brand.name}
            </Link>
          )}
          {product.isNewArrival && <Badge variant="brand">New Arrival</Badge>}
          {product.isBestSeller && <Badge variant="default" className="bg-amber-100 text-amber-700">Best Seller</Badge>}
        </div>
        <button
          onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Name */}
      <h1 className="font-display font-black text-display-md text-gray-900 leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <StarRating rating={product.avgRating} reviewCount={product.reviewCount} size="md" />
          <Link
            href="#reviews"
            className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            Read reviews
          </Link>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-black text-gray-900">{formatPrice(price)}</span>
        {comparePrice && (
          <>
            <span className="text-xl text-gray-400 line-through">{formatPrice(comparePrice)}</span>
            <Badge variant="error">Save {discount}%</Badge>
          </>
        )}
      </div>

      {/* Specs strip */}
      <div className="flex flex-wrap gap-2">
        {[
          product.terrain && `${product.terrain.charAt(0) + product.terrain.slice(1).toLowerCase()} Running`,
          product.drop !== undefined && `${product.drop}mm drop`,
          product.weight && `${product.weight}g`,
          product.cushionLevel && `${product.cushionLevel.charAt(0) + product.cushionLevel.slice(1).toLowerCase()} cushion`,
        ].filter(Boolean).map((spec) => (
          <span
            key={String(spec)}
            className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-lg"
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Color selector */}
      {colors.length > 1 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2.5">
            Color: <span className="font-normal text-gray-500">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedColorId(variant.id);
                  setSelectedSize("");
                  if (onColorChange && variant.color) onColorChange(variant.color);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all duration-150",
                  selectedColorId === variant.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {variant.colorHex && (
                  <span
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ background: variant.colorHex }}
                  />
                )}
                {variant.color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div id="size-selector">
        <div className="flex items-center justify-between mb-2.5">
          <p className={cn(
            "text-sm font-semibold",
            sizeError ? "text-red-500" : "text-gray-700"
          )}>
            {sizeError ? "Veuillez choisir une taille" : "Taille (EU)"}
            {selectedSize && (
              <span className="font-normal text-gray-500 ml-1">— {displaySize(selectedSize)}</span>
            )}
          </p>
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            <Ruler size={13} />
            Guide des tailles
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((variant) => {
            const isSelected = selectedSize === variant.size;
            const isOutOfStock = variant.stock === 0;
            const isSavedSize = sizeMatchesSaved(variant.size, savedSize ?? "");

            return (
              <div key={variant.id} className="relative">
                {isSavedSize && !isOutOfStock && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                                   text-[9px] font-bold text-brand-500 bg-brand-50 border border-brand-200
                                   px-1.5 py-0.5 rounded-full z-10 leading-none">
                    Votre pointure
                  </span>
                )}
                <button
                  onClick={() => {
                    if (isOutOfStock) return;
                    setSelectedSize(variant.size);
                    setSizeError(false);
                  }}
                  disabled={isOutOfStock}
                  className={cn(
                    "w-14 h-11 rounded-xl border-2 text-sm font-semibold transition-all duration-150",
                    isSelected && !isOutOfStock
                      ? "border-brand-500 bg-brand-500 text-white shadow-glow-brand"
                      : isOutOfStock
                      ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through"
                      : isSavedSize
                      ? "border-brand-300 text-brand-600 bg-brand-50 hover:border-brand-500"
                      : "border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-500"
                  )}
                >
                  {displaySize(variant.size)}
                </button>
              </div>
            );
          })}
        </div>

        {sizeError && (
          <p className="mt-2 text-xs text-red-500 animate-fade-in">
            Veuillez sélectionner une taille pour continuer
          </p>
        )}

        {/* Size guide dropdown */}
        {showSizeGuide && (
          <div className="mt-3 p-4 bg-gray-50 rounded-2xl text-sm animate-slide-up">
            <p className="font-bold text-gray-900 mb-3">Guide des tailles</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-1 pr-4 text-left">EU</th>
                    <th className="py-1 pr-4">US Homme</th>
                    <th className="py-1 pr-4">UK</th>
                    <th className="py-1">CM</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {[
                    ["38",   "6",    "5",    "24.0"],
                    ["38.5", "6",    "5.5",  "24.5"],
                    ["39",   "6.5",  "6",    "24.5"],
                    ["39.5", "7",    "6",    "25.0"],
                    ["40",   "7",    "6.5",  "25.0"],
                    ["40.5", "7.5",  "7",    "25.5"],
                    ["41",   "8",    "7",    "26.0"],
                    ["41.5", "8",    "7.5",  "26.0"],
                    ["42",   "8.5",  "8",    "26.5"],
                    ["42.5", "9",    "8.5",  "27.0"],
                    ["43",   "9.5",  "9",    "27.5"],
                    ["43.5", "10",   "9",    "27.5"],
                    ["44",   "10",   "9.5",  "28.0"],
                    ["44.5", "10.5", "10",   "28.5"],
                    ["45",   "11",   "10.5", "29.0"],
                  ].map(([eu, us, uk, cm]) => (
                    <tr key={eu} className="border-t border-gray-200">
                      <td className="py-1.5 pr-4 text-left font-bold text-brand-600">{eu}</td>
                      <td className="py-1.5 pr-4">{us}</td>
                      <td className="py-1.5 pr-4">{uk}</td>
                      <td className="py-1.5">{cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stock indicator */}
      {lowStock && selectedVariant && (
        <div className="flex items-center gap-2 text-sm text-amber-600 font-medium animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-soft" />
          Only {selectedVariant.stock} left in stock — order soon!
        </div>
      )}

      {/* Add to cart */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          loading={addingToCart}
          onClick={handleAddToCart}
          leftIcon={<ShoppingBag size={18} />}
          className="flex-1"
        >
          {addingToCart ? "Adding..." : "Add to Cart"}
        </Button>

        <button
          onClick={() => toggleItem(product.id)}
          className={cn(
            "w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200",
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart size={20} className={cn(isWishlisted && "fill-red-500")} />
        </button>
      </div>

      {/* Buy now */}
      <Button
        variant="secondary"
        size="xl"
        fullWidth
        onClick={handleBuyNow}
        rightIcon={<Zap size={16} className="fill-current" />}
      >
        Buy Now
      </Button>

      {/* Trust section */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { icon: Truck, title: "Free Shipping", desc: "Orders $75+", color: "text-brand-500" },
          { icon: RotateCcw, title: "30-Day Returns", desc: "Easy & free", color: "text-blue-500" },
          { icon: Shield, title: "Secure Pay", desc: "Encrypted", color: "text-green-500" },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
            <Icon size={18} className={color} />
            <p className="text-xs font-bold text-gray-800 mt-1.5">{title}</p>
            <p className="text-[10px] text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Accept:</span>
        {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map((p) => (
          <span
            key={p}
            className="px-2 py-1 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-md"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Features */}
      {product.features.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">Key Features</p>
          <ul className="space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={14} className="text-brand-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
