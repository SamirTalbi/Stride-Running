import type { Metadata } from "next";
import Link from "next/link";
import { Zap, LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart2, Settings, FileText, Image as ImageIcon, Award, FolderOpen, Truck, FlaskConical, MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Stride Admin" } };

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Brands", href: "/admin/brands", icon: Award },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Fulfillment", href: "/admin/fulfillment", icon: Truck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Support", href: "/admin/support", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Test Orders", href: "/admin/test-order", icon: FlaskConical },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-dark-DEFAULT flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-dark-200">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display font-black text-white text-base">STRIDE</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400
                         hover:text-white hover:bg-dark-100 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-dark-200">
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
