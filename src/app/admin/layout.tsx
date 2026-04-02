"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Zap, LayoutDashboard, Package, ShoppingCart, Users, Tag,
  BarChart2, Settings, FileText, Image as ImageIcon, Award,
  FolderOpen, Truck, FlaskConical, MessageSquare, Menu, X,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard",   href: "/admin",            icon: LayoutDashboard },
  { label: "Products",    href: "/admin/products",   icon: Package },
  { label: "Brands",      href: "/admin/brands",     icon: Award },
  { label: "Categories",  href: "/admin/categories", icon: FolderOpen },
  { label: "Orders",      href: "/admin/orders",     icon: ShoppingCart },
  { label: "Customers",   href: "/admin/customers",  icon: Users },
  { label: "Discounts",   href: "/admin/discounts",  icon: Tag },
  { label: "Fulfillment", href: "/admin/fulfillment",icon: Truck },
  { label: "Analytics",   href: "/admin/analytics",  icon: BarChart2 },
  { label: "Content",     href: "/admin/content",    icon: FileText },
  { label: "Media",       href: "/admin/media",      icon: ImageIcon },
  { label: "Support",     href: "/admin/support",    icon: MessageSquare },
  { label: "Settings",    href: "/admin/settings",   icon: Settings },
  { label: "Test Orders", href: "/admin/test-order", icon: FlaskConical },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-dark-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display font-black text-white text-base">STRIDE</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {adminNav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? "text-white bg-brand-500"
                  : "text-gray-400 hover:text-white hover:bg-dark-100"
                }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-dark-200 flex-shrink-0">
        <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-dark-DEFAULT flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark-DEFAULT flex flex-col transform transition-transform duration-300 lg:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-dark-DEFAULT border-b border-dark-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-white text-sm">STRIDE Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
