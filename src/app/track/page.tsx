"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Truck, CheckCircle, Clock, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCarrier } from "@/lib/carriers";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  email: string;
  items: {
    name: string;
    size: string;
    color: string;
    imageUrl: string | null;
    quantity: number;
  }[];
};

const STATUS_INFO: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; desc: string }> = {
  PENDING:    { label: "En attente", icon: Clock, color: "text-gray-500", bg: "bg-gray-100", desc: "Votre commande est en attente de confirmation." },
  CONFIRMED:  { label: "Confirmée", icon: CheckCircle, color: "text-brand-500", bg: "bg-brand-50", desc: "Votre commande a été confirmée et sera préparée prochainement." },
  PROCESSING: { label: "En préparation", icon: Package, color: "text-amber-500", bg: "bg-amber-50", desc: "Votre commande est en cours de préparation chez notre fournisseur." },
  SHIPPED:    { label: "Expédiée", icon: Truck, color: "text-blue-500", bg: "bg-blue-50", desc: "Votre commande a été expédiée. Suivez-la avec votre transporteur." },
  DELIVERED:  { label: "Livrée", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", desc: "Votre commande a été livrée. Merci pour votre achat !" },
  CANCELLED:  { label: "Annulée", icon: X, color: "text-red-500", bg: "bg-red-50", desc: "Cette commande a été annulée." },
};

const STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const o = searchParams.get("order");
    if (o) { setOrderNumber(o); search(o); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(num?: string) {
    const q = num ?? orderNumber;
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    const r = await fetch(`/api/orders?orderNumber=${encodeURIComponent(q.trim())}`);
    const j = await r.json();
    if (j.data) setOrder(j.data);
    else setError("Commande introuvable. Vérifiez votre numéro de commande.");
    setLoading(false);
  }

  const carrier = order?.carrier ? getCarrier(order.carrier) : null;
  const currentStep = order ? STEPS.indexOf(order.status) : -1;
  const statusInfo = order ? (STATUS_INFO[order.status] ?? STATUS_INFO.PENDING) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-DEFAULT py-12">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Link href="/" className="text-brand-500 font-black text-2xl tracking-wide">⚡ STRIDE</Link>
          <h1 className="text-3xl font-black text-white mt-4 mb-2">Suivre ma commande</h1>
          <p className="text-gray-400 text-sm">Entrez votre numéro de commande pour voir son statut</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6">
        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="ex: STR-20260316-1234"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <button onClick={() => search()} disabled={loading || !orderNumber.trim()}
              className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
              {loading ? "…" : "Rechercher"}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Résultat */}
        {order && statusInfo && (
          <div className="space-y-4">
            {/* Statut principal */}
            <div className={cn("rounded-2xl p-6 border-2", statusInfo.bg, "border-current/10")}>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusInfo.bg)}>
                  <statusInfo.icon size={20} className={statusInfo.color} />
                </div>
                <div>
                  <p className={cn("font-black text-lg", statusInfo.color)}>{statusInfo.label}</p>
                  <p className="text-gray-500 text-xs font-mono">{order.orderNumber}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2">{statusInfo.desc}</p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-5 text-sm">Progression</h2>
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const info = STATUS_INFO[step];
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                          done ? "bg-brand-500 border-brand-500" : "bg-white border-gray-200")}>
                          {done ? <info.icon size={14} className="text-white" /> :
                            <span className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={cn("w-0.5 flex-1 my-1", done && i < currentStep ? "bg-brand-500" : "bg-gray-100")} style={{ minHeight: 28 }} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={cn("text-sm font-semibold", done ? "text-gray-900" : "text-gray-400")}>
                          {info.label}
                          {active && <span className="ml-2 text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">Actuel</span>}
                        </p>
                        {step === "SHIPPED" && order.shippedAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.shippedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking transporteur */}
            {order.status === "SHIPPED" && order.trackingNumber && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-4 text-sm">Suivi transporteur</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                      {carrier?.name ?? order.carrier}
                    </p>
                    <p className="font-mono font-bold text-gray-900 text-lg">{order.trackingNumber}</p>
                  </div>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                      Suivre <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Vous serez redirigé vers le site officiel de {carrier?.name ?? "votre transporteur"} pour le suivi en temps réel.
                </p>
              </div>
            )}

            {/* Articles */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-4 text-sm">Articles commandés</h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Package size={18} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Taille {item.size} · {item.color} · Qté {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 pb-8">
              Un problème ?{" "}
              <a href="mailto:support@stride-running.com" className="text-brand-500 hover:underline">
                Contactez notre support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
