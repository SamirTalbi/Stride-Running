"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X, ChevronRight, ChevronDown, Zap, Search,
  User, Heart, ShoppingBag, Phone, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
  sale?: boolean;
  children?: { label: string; href: string; section?: boolean }[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-white z-50 flex flex-col",
          "transition-transform duration-300 ease-smooth lg:hidden shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-lg text-dark-DEFAULT">STRIDE</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100">
          {[
            { icon: Search, label: "Search", href: "/search" },
            { icon: User, label: "Account", href: "/account" },
            { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
            { icon: ShoppingBag, label: "Cart", href: "/cart" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-gray-50
                         text-gray-600 hover:text-brand-500 transition-colors"
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => (
            <div key={item.label} className="border-b border-gray-50 last:border-0">
              {item.children ? (
                <>
                  <button
                    onClick={() =>
                      setOpenSection(openSection === item.label ? null : item.label)
                    }
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-3.5",
                      "text-sm font-medium text-gray-800 hover:text-brand-500",
                      "transition-colors duration-150",
                      item.highlight && "text-brand-500",
                      item.sale && "text-red-500"
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-gray-400 transition-transform duration-200",
                        openSection === item.label && "rotate-180"
                      )}
                    />
                  </button>

                  {openSection === item.label && (
                    <div className="bg-gray-50 px-5 py-2 space-y-0.5 animate-slide-up">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2 py-2 text-sm font-semibold text-brand-500"
                      >
                        View all {item.label} <ChevronRight size={14} />
                      </Link>
                      {item.children.map((child) =>
                        child.section ? (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={onClose}
                            className="flex items-center justify-between pt-3 pb-1 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-brand-500 transition-colors"
                          >
                            {child.label}
                            <ChevronRight size={12} className="text-gray-300" />
                          </Link>
                        ) : (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 pl-2 text-sm text-gray-600 hover:text-brand-500 transition-colors"
                          >
                            {child.label}
                            <ChevronRight size={14} className="text-gray-300" />
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5",
                    "text-sm font-medium hover:text-brand-500",
                    "transition-colors duration-150",
                    item.highlight && "text-brand-500 font-semibold",
                    item.sale && "text-red-500 font-semibold",
                    !item.highlight && !item.sale && "text-gray-800"
                  )}
                >
                  {item.label}
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 space-y-2">
          <Link
            href="/find-my-shoe"
            onClick={onClose}
            className="flex items-center justify-between w-full px-4 py-3 bg-brand-500 text-white
                       font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors"
          >
            Find My Perfect Shoe
            <ChevronRight size={16} />
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/support"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <HelpCircle size={13} /> Support
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <Phone size={13} /> Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
