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
  { label: "Nouveautés", href: "/new-arrivals", highlight: true },
  {
    label: "Homme",
    href: "/men",
    mega: "men",
    children: [
      { label: "Les chaussures", href: "/shoes", section: true },
      { label: "Chaussures", href: "/men?cat=chaussures" },
      { label: "Claquettes", href: "/men?cat=claquettes" },
      // { label: "Compétition", href: "/shoes/racing" },
      // { label: "Débutant", href: "/shoes/beginner" },
      { label: "Les vêtements", href: "/apparel", section: true },
      { label: "T-shirts & Hauts", href: "/men?cat=tops" },
      { label: "Shorts", href: "/men?cat=shorts" },
      { label: "Joggings & Bas", href: "/men?cat=joggers" },
      { label: "Vestes", href: "/men?cat=jackets" },
      // { label: "Hauts à capuche", href: "/apparel/hoodies" },
      { label: "Ensembles", href: "/men?cat=ensembles" },
    ],
  },
  {
    label: "Femme",
    href: "/women",
    mega: "women",
    children: [
      { label: "Les chaussures", href: "/shoes", section: true },
      { label: "Chaussures", href: "/women?cat=chaussures" },
      { label: "Claquettes", href: "/women?cat=claquettes" },
      // { label: "Compétition", href: "/shoes/racing" },
      // { label: "Débutant", href: "/shoes/beginner" },
      { label: "Les vêtements", href: "/apparel", section: true },
      { label: "T-shirts & Hauts", href: "/women?cat=tops" },
      { label: "Shorts", href: "/women?cat=shorts" },
      { label: "Joggings & Bas", href: "/women?cat=joggers" },
      { label: "Vestes", href: "/women?cat=jackets" },
      // { label: "Hauts à capuche", href: "/apparel/hoodies" },
      { label: "Ensembles", href: "/women?cat=ensembles" },
    ],
  },
  // {
  //   label: "Vêtements",
  //   href: "/apparel",
  //   children: [
  //     { label: "T-shirts & Débardeurs", href: "/apparel/tops" },
  //     { label: "Shorts", href: "/apparel/shorts" },
  //     { label: "Compression & Sport", href: "/apparel/tights" },
  //     { label: "Vestes & Gilets", href: "/apparel/jackets" },
  //     { label: "Hauts à capuche & Sweats", href: "/apparel/hoodies" },
  //     { label: "Joggings & Bas", href: "/apparel/joggers" },
  //     { label: "Survêtements", href: "/apparel/tracksuits" },
  //     { label: "Sous-vêtements", href: "/apparel/base-layers" },
  //   ],
  // },
  { label: "Accessoires", href: "/accessories" },
  // { label: "Marques", href: "/brands" },
  { label: "Meilleures ventes", href: "/sale", sale: true },
  // { label: "Conseils Running", href: "/blog" },
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
              <div className="flex flex-col leading-[1.1] pt-0.5">
                <span className="font-display font-black text-2xl text-brand-500 tracking-tight">
                  Stride
                </span>
                <span className="font-display font-black text-xl text-dark-DEFAULT tracking-tight italic ml-0 -mt-2">
                  Running
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children ? setActiveMenu(item.label) : setActiveMenu(null)}
                >
                  {item.children ? (
                    <div
                      className={cn(
                        "flex items-center gap-0.5 px-3 py-2 text-sm font-medium rounded-lg",
                        "transition-colors duration-150",
                        "text-gray-700 hover:text-brand-500 hover:bg-gray-50",
                        (pathname === item.href || activeMenu === item.label) && "text-brand-500"
                      )}
                    >
                      {/* Clic sur le nom → toute la collection */}
                      <Link href={item.href} onClick={() => setActiveMenu(null)}>
                        {item.label}
                      </Link>
                      {/* Clic sur la flèche → menu déroulant */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenu(activeMenu === item.label ? null : item.label)
                        }
                        aria-expanded={activeMenu === item.label}
                        aria-haspopup="true"
                        aria-label={`Ouvrir le menu ${item.label}`}
                        className="p-0.5 rounded hover:bg-gray-100"
                      >
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            activeMenu === item.label && "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                  ) : (
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
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150"
                aria-label="Rechercher"
              >
                <Search size={20} />
              </button>

              <Link
                href="/account/wishlist"
                className="relative p-2.5 rounded-lg text-gray-600 hover:text-brand-500 hover:bg-gray-50
                           transition-colors duration-150"
                aria-label="Liste de souhaits"
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
                aria-label={`Panier (${itemCount} articles)`}
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
                aria-label="Ouvrir le menu"
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
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={navItems}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCart={openCart}
      />

      {/* Search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
