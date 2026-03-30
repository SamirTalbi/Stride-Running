"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

const navItems = [
  { label: "New Arrivals", href: "/new-arrivals", highlight: true },
  {
    label: "Men",
    href: "/men",
    mega: "men",
    children: [
      { label: "Toutes les chaussures", href: "/shoes", section: true },
      { label: "Running Route", href: "/shoes/road-running" },
      { label: "Trail", href: "/shoes/trail-running" },
      { label: "Racing", href: "/shoes/racing" },
      { label: "Débutant", href: "/shoes/beginner" },
      { label: "Tous les vêtements", href: "/apparel", section: true },
      { label: "T-shirts & Tops", href: "/apparel/tops" },
      { label: "Shorts", href: "/apparel/shorts" },
      { label: "Joggers & Bas", href: "/apparel/joggers" },
      { label: "Vestes & Gilets", href: "/apparel/jackets" },
      { label: "Hauts à capuche", href: "/apparel/hoodies" },
      { label: "Survêtements", href: "/apparel/tracksuits" },
    ],
  },
  {
    label: "Women",
    href: "/women",
    mega: "women",
    children: [
      { label: "Toutes les chaussures", href: "/shoes", section: true },
      { label: "Running Route", href: "/shoes/road-running" },
      { label: "Trail", href: "/shoes/trail-running" },
      { label: "Racing", href: "/shoes/racing" },
      { label: "Débutant", href: "/shoes/beginner" },
      { label: "Tous les vêtements", href: "/apparel", section: true },
      { label: "T-shirts & Tops", href: "/apparel/tops" },
      { label: "Shorts", href: "/apparel/shorts" },
      { label: "Joggers & Bas", href: "/apparel/joggers" },
      { label: "Vestes & Gilets", href: "/apparel/jackets" },
      { label: "Hauts à capuche", href: "/apparel/hoodies" },
      { label: "Survêtements", href: "/apparel/tracksuits" },
    ],
  },
  {
    label: "Apparel",
    href: "/apparel",
    children: [
      { label: "T-shirts & Tops", href: "/apparel/tops" },
      { label: "Shorts", href: "/apparel/shorts" },
      { label: "Compression & Sport", href: "/apparel/tights" },
      { label: "Vestes & Gilets", href: "/apparel/jackets" },
      { label: "Hauts à capuche & Sweats", href: "/apparel/hoodies" },
      { label: "Joggers & Bas", href: "/apparel/joggers" },
      { label: "Survêtements", href: "/apparel/tracksuits" },
      { label: "Sous-vêtements", href: "/apparel/base-layers" },
    ],
  },
  { label: "Accessories", href: "/accessories" },
  { label: "Marques", href: "/brands" },
  { label: "Sale", href: "/sale", sale: true },
  { label: "Conseils Running", href: "/blog" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isSignedIn } = useUser();
  const cartItems = useCartStore((s) => s.items);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistItems = useWishlistStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Promo banner */}
      <div className="bg-dark-DEFAULT text-white text-center text-xs py-2.5 px-4 font-medium tracking-wide">
        <span className="flex items-center justify-center gap-2">
          <Zap size={12} className="text-brand-400 fill-brand-400" />
          FREE shipping on orders over $75 — Use code{" "}
          <span className="font-bold text-brand-400 tracking-widest">STRIDE10</span>{" "}
          for 10% off your first order
          <Zap size={12} className="text-brand-400 fill-brand-400" />
        </span>
      </div>

      {/* Main header */}
      <header
        ref={menuRef}
        className={cn(
          "sticky top-0 z-50 bg-white transition-all duration-300",
          scrolled ? "shadow-md" : "shadow-sm"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center
                            group-hover:bg-brand-600 transition-colors duration-200 shadow-sm">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="font-display font-black text-xl text-dark-DEFAULT tracking-tight">
                STRIDE
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children ? setActiveMenu(item.label) : setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg",
                      "transition-colors duration-150",
                      item.highlight && "text-brand-500 font-semibold",
                      item.sale && "text-red-500 font-semibold",
                      !item.highlight && !item.sale && "text-gray-700 hover:text-brand-500 hover:bg-gray-50",
                      pathname === item.href && "text-brand-500"
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeMenu === item.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                href="/account/wishlist"
                className="relative p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white
                                   text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                {isSignedIn ? (
                  <>
                    <Link
                      href="/account"
                      className="p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50 transition-colors duration-150"
                      aria-label="Mon compte"
                    >
                      <User size={20} />
                    </Link>
                    <div className="p-1">
                      <UserButton />
                    </div>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50 transition-colors duration-150"
                      aria-label="Se connecter"
                    >
                      <User size={20} />
                    </button>
                  </SignInButton>
                )}
              </div>

              <button
                onClick={openCart}
                className="relative p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150 ml-1"
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white
                                   text-[10px] font-bold rounded-full flex items-center justify-center
                                   animate-bounce-soft">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150 ml-1"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        {activeMenu && (
          <MegaMenu
            activeItem={activeMenu}
            items={navItems}
            onClose={() => setActiveMenu(null)}
          />
        )}
      </header>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} items={navItems} />

      {/* Search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
