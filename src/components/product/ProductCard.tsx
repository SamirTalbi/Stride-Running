"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Zap, Ruler } from "lucide-react";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { type Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  // Images
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  // Quick Add only makes sense when there's nothing to choose (1 variant or all "One Size")
  const uniqueSizes = new Set(product.variants.map((v) => v.size));
  const canQuickAdd = uniqueSizes.size === 1;
  const hoverImage = product.images.find((i) => !i.isPrimary) ?? primaryImage;

  // Pricing
  const defaultVariant = product.variants[0];
  const price = defaultVariant?.price ?? 0;
  const comparePrice = defaultVariant?.comparePrice;
  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) return;
    addItem(product, defaultVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div
      className={cn("group relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 shadow-card
                        group-hover:shadow-card-hover transition-shadow duration-300">
          {/* Main image */}
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              unoptimized
              priority={priority}
              className={cn(
                "object-cover transition-all duration-500",
                hovered && hoverImage !== primaryImage ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Hover image */}
          {hoverImage && hoverImage !== primaryImage && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.altText ?? product.name}
              fill
              unoptimized
              className={cn(
                "object-cover transition-all duration-500",
                hovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNewArrival && (
              <Badge variant="brand" size="sm">New</Badge>
            )}
            {discount > 0 && (
              <Badge variant="error" size="sm">-{discount}%</Badge>
            )}
            {product.isBestSeller && !product.isNewArrival && (
              <Badge variant="default" size="sm" className="bg-amber-100 text-amber-700">
                Best Seller
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleItem(product.id); }}
            className={cn(
              "absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center",
              "transition-all duration-200 shadow-sm",
              isWishlisted
                ? "bg-red-50 text-red-500"
                : "bg-white/90 text-gray-400 hover:text-red-400",
              "opacity-0 group-hover:opacity-100"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={15}
              className={cn(isWishlisted && "fill-red-500")}
            />
          </button>

          {/* Quick actions overlay */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-3 flex gap-2 z-10",
            "transition-all duration-300 ease-smooth",
            hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            {canQuickAdd ? (
              <button
                onClick={handleQuickAdd}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5",
                  "transition-all duration-200 shadow-md",
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-900 hover:bg-brand-500 hover:text-white"
                )}
              >
                {addedToCart ? (
                  <><Zap size={12} className="fill-white" /> Ajouté !</>
                ) : (
                  <><ShoppingBag size={12} /> Ajouter</>
                )}
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); router.push(`/products/${product.slug}`); }}
                className="flex-1 h-9 rounded-xl bg-white text-xs font-semibold flex items-center justify-center gap-1.5
                           text-gray-900 hover:bg-brand-500 hover:text-white transition-all duration-200 shadow-md"
              >
                <Ruler size={12} /> Choisir ma taille
              </button>
            )}

            <button
              onClick={(e) => { e.preventDefault(); router.push(`/products/${product.slug}`); }}
              className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-600
                         hover:bg-brand-500 hover:text-white transition-all duration-200 shadow-md"
              aria-label="Voir le produit"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      </Link>

      {/* Product info */}
      <div className="space-y-1">
        {product.brand && (
          <p className="text-[11px] font-semibold text-brand-500 uppercase tracking-wider">
            {product.brand.name}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-semibold text-gray-900 hover:text-brand-500
                     transition-colors duration-150 line-clamp-2 leading-tight"
        >
          {product.name}
        </Link>

        {product.reviewCount > 0 && (
          <StarRating rating={product.avgRating} reviewCount={product.reviewCount} size="sm" />
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
          {comparePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
          )}
        </div>

        {/* Size availability dots */}
        <div className="flex items-center gap-1 pt-0.5">
          {product.variants.slice(0, 8).map((v) => (
            <div
              key={v.id}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                v.stock > 0 ? "bg-gray-300" : "bg-gray-100"
              )}
              title={v.stock > 0 ? v.size : `${v.size} - sold out`}
            />
          ))}
          {product.variants.length > 8 && (
            <span className="text-[10px] text-gray-400">+{product.variants.length - 8}</span>
          )}
        </div>
      </div>
    </div>
  );
}
