"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  section?: boolean;
  children?: { label: string; href: string; section?: boolean }[];
}

interface MegaMenuProps {
  activeItem: string;
  items: NavItem[];
  onClose: () => void;
}

const featuredContent: Record<string, { title: string; href: string; image: string; cta: string }[]> = {
  Men: [
    {
      title: "Best Sellers",
      href: "/men?sort=best-sellers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop",
      cta: "Shop now",
    },
    {
      title: "New Arrivals",
      href: "/men?filter=new",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=400&fit=crop",
      cta: "Explore",
    },
  ],
  Women: [
    {
      title: "Best Sellers",
      href: "/women?sort=best-sellers",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop",
      cta: "Shop now",
    },
    {
      title: "New Arrivals",
      href: "/women?filter=new",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=400&fit=crop",
      cta: "Explore",
    },
  ],
  Apparel: [
    {
      title: "Summer Collection",
      href: "/apparel?season=summer",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
      cta: "Shop now",
    },
  ],
};

export function MegaMenu({ activeItem, items, onClose }: MegaMenuProps) {
  const activeNav = items.find((item) => item.label === activeItem);
  if (!activeNav?.children) return null;

  const featured = featuredContent[activeItem] ?? [];

  return (
    <div
      className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50
                 animate-fade-in"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-12">
          {/* Links */}
          <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-1.5">
            <div>
              {activeNav.children?.map((child) => (
                child.section ? (
                  <Link
                    key={child.label}
                    href={child.href}
                    onClick={onClose}
                    className="flex items-center justify-between mt-5 mb-1.5 first:mt-0 group"
                  >
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-brand-500 transition-colors">
                      {child.label}
                    </span>
                    <ArrowRight size={12} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ) : (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="flex items-center gap-2 py-1.5 pl-2 text-sm text-gray-600 hover:text-brand-500
                               group transition-colors duration-150"
                  >
                    <ArrowRight
                      size={12}
                      className="text-brand-400 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0
                                 transition-all duration-150 flex-shrink-0"
                    />
                    {child.label}
                  </Link>
                )
              ))}
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Quick Links
              </p>
              {[
                { label: "Best Sellers", href: `${activeNav.href}?sort=best-sellers` },
                { label: "New Arrivals", href: `${activeNav.href}?filter=new` },
                { label: "On Sale", href: `${activeNav.href}?filter=sale` },
                { label: "Under $100", href: `${activeNav.href}?price=under-100` },
                { label: "Toutes les marques", href: "/brands" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-brand-500
                             group transition-colors duration-150"
                >
                  <ArrowRight
                    size={14}
                    className="text-brand-400 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0
                               transition-all duration-150"
                  />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Featured images */}
          {featured.length > 0 && (
            <div className="flex gap-4">
              {featured.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="group relative w-40 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover
                             transition-shadow duration-300"
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-sm font-bold leading-tight">{item.title}</p>
                      <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                        {item.cta} <ArrowRight size={10} />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-6">
          <Link
            href="/find-my-shoe"
            onClick={onClose}
            className="text-sm font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1.5
                       transition-colors duration-150"
          >
            Find My Perfect Shoe <ArrowRight size={14} />
          </Link>
          <Link
            href="/blog"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Conseils Running
          </Link>
          <Link
            href="/sale"
            onClick={onClose}
            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1
                       transition-colors duration-150"
          >
            Sale — Up to 50% off
          </Link>
        </div>
      </div>
    </div>
  );
}
