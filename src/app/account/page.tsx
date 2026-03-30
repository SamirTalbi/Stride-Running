"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, Heart, MapPin, User, Settings, LogOut,
  ChevronRight, RotateCcw, CreditCard, Bell, Ruler, Loader2
} from "lucide-react";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useUser, useClerk } from "@clerk/nextjs";
import type { OrderStatus } from "@/types";
import { useSavedSize } from "@/hooks/useSavedSize";

const navItems = [
  { key: "orders",    label: "Mes commandes",        icon: Package  },
  { key: "wishlist",  label: "Liste de souhaits",     icon: Heart    },
  { key: "profile",   label: "Profil",                icon: User     },
  { key: "sizes",     label: "Pointures sauvegardées",icon: Ruler    },
];

const statusConfig: Record<OrderStatus, { label: string; variant: "success" | "info" | "warning" | "default" | "brand" }> = {
  PENDING:    { label: "En attente",     variant: "default"  },
  CONFIRMED:  { label: "Confirmée",      variant: "brand"    },
  PROCESSING: { label: "En préparation", variant: "warning"  },
  SHIPPED:    { label: "Expédiée",       variant: "info"     },
  DELIVERED:  { label: "Livrée",         variant: "success"  },
  CANCELLED:  { label: "Annulée",        variant: "default"  },
  REFUNDED:   { label: "Remboursée",     variant: "default"  },
};

interface OrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
}

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { savedSize, saveSize } = useSavedSize();
  const [sizeInput, setSizeInput] = useState<string>("");
  const [sizeSaved, setSizeSaved] = useState(false);

  // Sync select with saved value once loaded
  useEffect(() => {
    if (savedSize) setSizeInput(savedSize);
  }, [savedSize]);

  const firstName = user?.firstName ?? "";
  const lastName  = user?.lastName  ?? "";
  const email     = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email;
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

  useEffect(() => {
    if (!isLoaded || !email) return;

    fetch(`/api/orders?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [isLoaded, email]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
      <h1 className="font-display font-black text-display-md text-gray-900 mb-8">Mon compte</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Carte profil */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 mb-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3
                            text-white font-black text-lg">
              {isLoaded && user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <p className="font-bold text-lg truncate">{isLoaded ? displayName : "—"}</p>
            <p className="text-white/80 text-sm truncate">{isLoaded ? email : "—"}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium",
                  "transition-colors duration-150",
                  activeSection === item.key
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            ))}
            <button
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  signOut({ redirectUrl: "/" });
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                         text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors mt-4"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">

          {/* ── Commandes ── */}
          {activeSection === "orders" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-5">Mes commandes</h2>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-400">Aucune commande pour l&apos;instant</p>
                  <Link href="/men" className="mt-3 inline-block text-sm text-brand-500 font-semibold hover:text-brand-600">
                    Commencer mes achats
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusConfig[order.status];
                    const firstItem = order.items[0];
                    return (
                      <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card
                                                      hover:shadow-card-hover transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Commande #{order.orderNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={status.variant} size="md">{status.label}</Badge>
                            <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={18} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex-1 min-w-0">
                            {firstItem && (
                              <>
                                <p className="text-sm font-medium text-gray-900 truncate">{firstItem.name}</p>
                                <p className="text-xs text-gray-500">
                                  Pointure {firstItem.size} · {firstItem.color}
                                  {order.items.length > 1 && ` · +${order.items.length - 1} autre(s)`}
                                </p>
                              </>
                            )}
                          </div>
                          {order.trackingUrl && order.status === "SHIPPED" && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-brand-500 hover:text-brand-600 px-3 py-1.5
                                         border border-brand-200 rounded-lg hover:border-brand-400 transition-colors flex-shrink-0"
                            >
                              Suivre
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Wishlist ── */}
          {activeSection === "wishlist" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-5">Liste de souhaits</h2>
              <Link
                href="/account/wishlist"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600"
              >
                Voir ma liste de souhaits <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* ── Profil ── */}
          {activeSection === "profile" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-5">Paramètres du profil</h2>
              <p className="text-sm text-gray-500 mb-6">
                Les informations de votre profil sont gérées via votre compte Clerk.
                Pour les modifier, cliquez sur votre avatar en haut à droite.
              </p>
              <div className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                    <input
                      readOnly
                      value={firstName}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input
                      readOnly
                      value={lastName}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    readOnly
                    value={email}
                    type="email"
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Pointures ── */}
          {activeSection === "sizes" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-5">Pointures sauvegardées</h2>
              <p className="text-sm text-gray-500 mb-6">
                Votre pointure sera mise en avant automatiquement lors de la sélection d&apos;une taille sur les fiches produit.
              </p>
              <div className="max-w-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pointure (EU)</label>
                  <select
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">— Choisir —</option>
                    {[
                      "38", "38.5", "39", "39.5",
                      "40", "40.5", "41", "41.5",
                      "42", "42.5", "43", "43.5",
                      "44", "44.5", "45",
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button
                  disabled={!sizeInput}
                  onClick={() => {
                    if (!sizeInput) return;
                    saveSize(sizeInput);
                    setSizeSaved(true);
                    setTimeout(() => setSizeSaved(false), 2000);
                  }}
                  className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl
                             hover:bg-brand-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sizeSaved ? "✓ Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
