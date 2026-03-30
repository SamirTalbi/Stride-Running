"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    id: 1,
    headline: "Run Faster.",
    subheadline: "Go Further.",
    tagline: "Break barriers, not your budget. Premium running gear for every level.",
    ctaPrimary: { label: "Shop Running Shoes", href: "/men" },
    ctaSecondary: { label: "Find My Perfect Shoe", href: "/find-my-shoe" },
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop&q=85",
    badge: "New Spring Collection",
    accentColor: "from-brand-500",
  },
  {
    id: 2,
    headline: "Trail Ready.",
    subheadline: "Born Wild.",
    tagline: "Conquer any terrain with our trail running collection.",
    ctaPrimary: { label: "Shop Trail Shoes", href: "/trail" },
    ctaSecondary: { label: "Trail Running Guide", href: "/blog/trail-running" },
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=1600&h=900&fit=crop&q=85",
    badge: "Trail Collection",
    accentColor: "from-emerald-500",
  },
  {
    id: 3,
    headline: "She Runs.",
    subheadline: "She Wins.",
    tagline: "Engineered for women. Designed to perform.",
    ctaPrimary: { label: "Shop Women's", href: "/women" },
    ctaSecondary: { label: "Women's Running Guide", href: "/blog/women-running" },
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=1600&h=900&fit=crop&q=85",
    badge: "Women's Collection",
    accentColor: "from-purple-500",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const slide = slides[current];

  return (
    <section className="relative h-[90vh] min-h-[560px] max-h-[860px] overflow-hidden bg-dark-DEFAULT">
      {/* Background image */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={s.image}
            alt={s.headline}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              key={`badge-${current}`}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                "bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium",
                "animate-slide-up"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full animate-pulse-soft", slide.accentColor.replace("from-", "bg-"))} />
              {slide.badge}
            </div>

            {/* Headline */}
            <h1
              key={`h1-${current}`}
              className="font-display font-black text-white leading-none mb-3 animate-slide-up"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)", animationDelay: "0.1s" }}
            >
              {slide.headline}<br />
              <span className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                `${slide.accentColor} to-white`
              )}>
                {slide.subheadline}
              </span>
            </h1>

            {/* Tagline */}
            <p
              key={`p-${current}`}
              className="text-white/80 text-lg lg:text-xl mb-8 max-w-lg leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {slide.tagline}
            </p>

            {/* CTAs */}
            <div
              key={`cta-${current}`}
              className="flex flex-col sm:flex-row gap-3 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link href={slide.ctaPrimary.href}>
                <Button variant="primary" size="xl" rightIcon={<ArrowRight size={18} />}>
                  {slide.ctaPrimary.label}
                </Button>
              </Link>
              <Link href={slide.ctaSecondary.href}>
                <Button variant="white" size="xl" rightIcon={<Play size={14} className="fill-current" />}>
                  {slide.ctaSecondary.label}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  i === current
                    ? "w-8 h-2 bg-brand-500"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                         flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                         flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-1">
        <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
