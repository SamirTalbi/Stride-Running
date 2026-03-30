"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = sorted[activeIndex];

  const prev = () => setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActiveIndex((i) => (i + 1) % sorted.length);

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-3">
        {/* Thumbnails */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-hide
                        lg:max-h-[600px]">
          {sorted.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-150",
                i === activeIndex
                  ? "border-brand-500 shadow-sm"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${productName} ${i + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative flex-1 aspect-square bg-gray-50 rounded-3xl overflow-hidden group cursor-zoom-in"
          onClick={() => setLightbox(true)}>
          {active && (
            <Image
              src={active.url}
              alt={active.altText ?? productName}
              fill
              priority
              className={cn(
                "object-cover transition-transform duration-500",
                zoom && "scale-150 cursor-zoom-out"
              )}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          )}

          {/* Controls */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                           flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100
                           transition-opacity hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full
                           flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100
                           transition-opacity hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <ZoomIn size={12} /> Zoom
            </div>
          </div>

          {/* Dot indicators */}
          {sorted.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === activeIndex ? "w-5 h-1.5 bg-brand-500" : "w-1.5 h-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && active && (
        <div
          className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center
                       justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>

          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full
                           flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full
                           flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={active.url}
                alt={active.altText ?? productName}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-center text-white/50 text-sm mt-3">
              {activeIndex + 1} / {sorted.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
