import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function PromoSection() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Promo 1 */}
        <Link
          href="/sale"
          className="relative overflow-hidden rounded-3xl group h-64 md:h-80 block"
        >
          <Image
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=80"
            alt="Sale"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/70 via-red-900/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 w-fit">
              LIMITED TIME
            </span>
            <h3 className="font-display font-black text-white text-3xl md:text-4xl leading-tight mb-2">
              Up to 50% Off
            </h3>
            <p className="text-white/80 text-sm mb-4">Premium shoes, incredible prices</p>
            <span className="flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all">
              Shop Sale <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Promo 2 */}
        <Link
          href="/find-my-shoe"
          className="relative overflow-hidden rounded-3xl group h-64 md:h-80 block"
        >
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80"
            alt="Find your shoe"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 via-brand-900/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full mb-3 w-fit">
              PERSONALIZED
            </span>
            <h3 className="font-display font-black text-white text-3xl md:text-4xl leading-tight mb-2">
              Find Your<br />Perfect Fit
            </h3>
            <p className="text-white/80 text-sm mb-4">Take our 60-second shoe finder quiz</p>
            <span className="flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all">
              Start Quiz <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
