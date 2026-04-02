"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Send, Truck, CheckCircle, Clock, ChevronRight,
  Loader2, Plus, AlertCircle, RefreshCw, FileText, X,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { CARRIERS } from "@/lib/carriers";

type FulfillmentItem = {
  variantId: string;
  productId: string;
  productName: string;
  sku: string | null;
  size: string;
  color: string;
  colorHex: string | null;
  imageUrl: string | null;
  quantity: number;
  orderIds: string[];
  orderNumbers: string[];
};

type OrderSummary = {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
  } | null;
};

type PO = {
  id: string;
  poNumber: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  items: { quantity: number }[];
};

const PO_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const PO_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  RECEIVED: "Reçu",
  CANCELLED: "Annulé",
};

export default function FulfillmentPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "pos" | "ship">("today");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<FulfillmentItem[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState<PO[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [deletingPoId, setDeletingPoId] = useState<string | null>(null);

  // PO creation modal
  const [showPoModal, setShowPoModal] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [creatingPo, setCreatingPo] = useState(false);
  const [poCreated, setPoCreated] = useState<{ poNumber: string; id: string } | null>(null);

  // Ship modal
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipOrders, setShipOrders] = useState<OrderSummary[]>([]);
  const [shipLoading, setShipLoading] = useState(false);
  const [shipData, setShipData] = useState<Record<string, { carrier: string; trackingNumber: string }>>({});
  const [notifyCustomers, setNotifyCustomers] = useState(true);
  const [shipping, setShipping] = useState(false);

  const fetchToday = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/fulfillment?date=${date}`)
      .then((r) => r.json())
      .then((j) => {
        setItems(j.items ?? []);
        setOrders(j.orders ?? []);
        setOrderCount(j.orderCount ?? 0);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const fetchPos = useCallback(() => {
    setPosLoading(true);
    fetch("/api/admin/fulfillment/po")
      .then((r) => r.json())
      .then((j) => setPos(j.data ?? []))
      .finally(() => setPosLoading(false));
  }, []);

  const fetchShipOrders = useCallback(() => {
    fetch("/api/admin/orders?status=PROCESSING&limit=50")
      .then((r) => r.json())
      .then((j) => {
        setShipOrders(j.data ?? []);
        const init: Record<string, { carrier: string; trackingNumber: string }> = {};
        (j.data ?? []).forEach((o: OrderSummary) => { init[o.id] = { carrier: "colissimo", trackingNumber: "" }; });
        setShipData(init);
      });
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => { if (tab === "pos") fetchPos(); }, [tab, fetchPos]);
  useEffect(() => { if (tab === "ship") fetchShipOrders(); }, [tab, fetchShipOrders]);

  async function deletePo(id: string) {
    if (!confirm("Supprimer ce bon de commande ?")) return;
    setDeletingPoId(id);
    await fetch(`/api/admin/fulfillment/po/${id}`, { method: "DELETE" });
    setDeletingPoId(null);
    fetchPos();
  }

  async function createPo() {
    setCreatingPo(true);
    const r = await fetch("/api/admin/fulfillment/po", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, notes: poNotes, sendEmail: sendNow, supplierEmail }),
    });
    const j = await r.json();
    setCreatingPo(false);
    if (j.data) {
      setPoCreated({ poNumber: j.data.poNumber, id: j.data.id });
      fetchToday();
      fetchPos();
    }
  }

  async function handleShip() {
    setShipping(true);
    const shipments = Object.entries(shipData)
      .filter(([, v]) => v.trackingNumber.trim())
      .map(([orderId, v]) => ({ orderId, carrier: v.carrier, trackingNumber: v.trackingNumber }));

    await fetch("/api/admin/fulfillment/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipments, notifyCustomers }),
    });
    setShipping(false);
    setShowShipModal(false);
    fetchShipOrders();
  }

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="p-4 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Fulfillment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des commandes fournisseur et expéditions</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        {([
          { id: "today", label: "Commandes du jour", icon: Clock },
          { id: "pos", label: "Bons de commande", icon: FileText },
          { id: "ship", label: "Expéditions", icon: Truck },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
              tab === id ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: AUJOURD'HUI ─────────────────────────────────────── */}
      {tab === "today" && (
        loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-brand-500" /></div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-3xl font-black text-gray-900">{orderCount}</p>
                <p className="text-sm text-gray-500 mt-1">Commandes à traiter</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-3xl font-black text-brand-500">{totalUnits}</p>
                <p className="text-sm text-gray-500 mt-1">Unités à commander</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-3xl font-black text-gray-900">{items.length}</p>
                <p className="text-sm text-gray-500 mt-1">Références distinctes</p>
              </div>
            </div>

            {orderCount === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                <CheckCircle size={36} className="mx-auto text-green-400 mb-3" />
                <p className="text-gray-500 text-sm">Aucune commande en attente pour ce jour.</p>
              </div>
            ) : (
              <>
                {/* Articles à commander */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Articles à commander au fournisseur</h2>
                    <button onClick={() => fetchToday()} className="text-gray-400 hover:text-gray-600">
                      <RefreshCw size={15} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produit</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Taille</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Couleur</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qté</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commandes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((item) => (
                        <tr key={item.variantId} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageUrl} alt={item.productName}
                                  className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">{item.productName}</p>
                                {item.sku && <p className="text-xs text-gray-400">SKU : {item.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-base font-black text-gray-900">{item.size}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: item.colorHex ?? "#ccc" }} />
                              <span className="text-gray-700">{item.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-2xl font-black text-brand-500">{item.quantity}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {item.orderNumbers.map((n) => (
                                <span key={n} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{n}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-700">TOTAL</td>
                        <td className="px-4 py-3 text-center text-xl font-black text-brand-500">{totalUnits}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                  </div>
                </div>

                {/* Commandes individuelles */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Détail des commandes ({orderCount})</h2>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commande</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Articles</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3">
                            <p className="font-mono font-semibold text-gray-900 text-xs">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700 text-xs">{order.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {order.shippingAddress ? (
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                {order.shippingAddress.address1}<br />
                                {order.shippingAddress.zip} {order.shippingAddress.city}
                              </p>
                            ) : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-gray-900">{order.itemCount}</span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex justify-end">
                  <button onClick={() => setShowPoModal(true)}
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg">
                    <Plus size={18} /> Générer le bon de commande
                  </button>
                </div>
              </>
            )}
          </div>
        )
      )}

      {/* ── TAB: BONS DE COMMANDE ─────────────────────────────────── */}
      {tab === "pos" && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {posLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-brand-500" /></div>
          ) : pos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun bon de commande pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° PO</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unités</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Envoyé le</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{po.poNumber}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {new Date(po.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-brand-500">
                      {po.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", PO_STATUS_COLORS[po.status] ?? "bg-gray-100 text-gray-500")}>
                        {PO_STATUS_LABELS[po.status] ?? po.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {po.sentAt ? new Date(po.sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/admin/fulfillment/po/${po.id}`)}
                          className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-xs font-semibold">
                          Voir <ChevronRight size={14} />
                        </button>
                        {deletingPoId === po.id ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : (
                          <button onClick={() => deletePo(po.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: EXPÉDITIONS ──────────────────────────────────────── */}
      {tab === "ship" && (
        <div className="space-y-5">
          {shipOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
              <CheckCircle size={36} className="mx-auto text-green-400 mb-3" />
              <p className="text-gray-500 text-sm">Aucune commande en attente d&apos;expédition.</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>{shipOrders.length} commandes</strong> en attente d&apos;expédition. Entre les numéros de tracking puis clique &quot;Valider les expéditions&quot;.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commande</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Transporteur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° de tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {shipOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-3">
                          <p className="font-mono font-semibold text-gray-900 text-xs">{order.orderNumber}</p>
                          {order.shippingAddress && (
                            <p className="text-xs text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{order.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={shipData[order.id]?.carrier ?? "colissimo"}
                            onChange={(e) => setShipData((d) => ({ ...d, [order.id]: { ...d[order.id], carrier: e.target.value } }))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30 w-full max-w-[160px]">
                            {CARRIERS.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            placeholder="ex: 1A2B3C4D5E6F"
                            value={shipData[order.id]?.trackingNumber ?? ""}
                            onChange={(e) => setShipData((d) => ({ ...d, [order.id]: { ...d[order.id], trackingNumber: e.target.value } }))}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 w-full max-w-[220px]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifyCustomers} onChange={(e) => setNotifyCustomers(e.target.checked)}
                    className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm text-gray-700">Envoyer les emails de suivi aux clients</span>
                </label>
                <button onClick={handleShip} disabled={shipping}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                  {shipping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Valider les expéditions
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL: CRÉER PO ───────────────────────────────────────── */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {poCreated ? (
              <div className="p-8 text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-black text-gray-900 mb-2">Bon de commande créé !</h2>
                <p className="text-gray-500 text-sm mb-6"><strong>{poCreated.poNumber}</strong> a été généré.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setShowPoModal(false); setPoCreated(null); }}
                    className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">
                    Fermer
                  </button>
                  <button onClick={() => router.push(`/admin/fulfillment/po/${poCreated.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl">
                    Voir le PO <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Générer le bon de commande</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{totalUnits} unités · {items.length} références · {orderCount} commandes</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes pour le fournisseur</label>
                    <textarea value={poNotes} onChange={(e) => setPoNotes(e.target.value)} rows={3}
                      placeholder="Urgence, instructions particulières…"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none" />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
                    <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)}
                      className="w-4 h-4 accent-brand-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Envoyer par email maintenant</p>
                      <p className="text-xs text-gray-500">Sinon le PO est sauvegardé en brouillon</p>
                    </div>
                  </label>

                  {sendNow && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email du fournisseur</label>
                      <input type="email" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)}
                        placeholder="fournisseur@exemple.com"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setShowPoModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                    Annuler
                  </button>
                  <button onClick={createPo} disabled={creatingPo || (sendNow && !supplierEmail)}
                    className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
                    {creatingPo ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {sendNow ? "Créer & Envoyer" : "Créer le brouillon"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
