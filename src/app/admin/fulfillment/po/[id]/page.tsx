"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Send, CheckCircle, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type POItem = {
  id: string;
  productName: string;
  sku: string | null;
  size: string;
  color: string;
  colorHex: string | null;
  imageUrl: string | null;
  quantity: number;
  orderIds: string[];
};

type PO = {
  id: string;
  poNumber: string;
  status: string;
  notes: string | null;
  sentAt: string | null;
  createdAt: string;
  items: POItem[];
};

const STATUS_STEPS = ["DRAFT", "SENT", "RECEIVED"];
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé au fournisseur",
  RECEIVED: "Stock reçu",
  CANCELLED: "Annulé",
};

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [po, setPo] = useState<PO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/fulfillment/po/${id}`)
      .then((r) => r.json())
      .then((j) => setPo(j.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function markAs(status: string) {
    setUpdating(true);
    const r = await fetch(`/api/admin/fulfillment/po/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const j = await r.json();
    setPo(j.data);
    setUpdating(false);
  }

  async function sendEmail() {
    setSending(true);
    await fetch(`/api/admin/fulfillment/po/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendEmail: true, supplierEmail }),
    });
    setSending(false);
    setShowSendModal(false);
    // Refresh
    fetch(`/api/admin/fulfillment/po/${id}`).then((r) => r.json()).then((j) => setPo(j.data));
  }

  const totalUnits = po?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const currentStep = STATUS_STEPS.indexOf(po?.status ?? "DRAFT");

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-brand-500" />
    </div>
  );

  if (!po) return <div className="p-8 text-gray-500">PO introuvable.</div>;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900">{po.poNumber}</h1>
          <p className="text-gray-500 text-sm">
            Créé le {new Date(po.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
            <Printer size={16} /> Imprimer / PDF
          </button>
          {po.status === "DRAFT" && (
            <button onClick={() => setShowSendModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors">
              <Send size={16} /> Envoyer au fournisseur
            </button>
          )}
          {po.status === "SENT" && (
            <button onClick={() => markAs("RECEIVED")} disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Marquer comme reçu
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 print:hidden">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              i <= currentStep ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-400")}>
              <span className={cn("w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold",
                i <= currentStep ? "bg-white text-brand-500" : "bg-gray-300 text-white")}>
                {i < currentStep ? "✓" : i + 1}
              </span>
              {STATUS_LABELS[step]}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-1", i < currentStep ? "bg-brand-500" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      {/* ─── DOCUMENT IMPRIMABLE ─── */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
        {/* En-tête document */}
        <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
          <div>
            <div className="text-brand-500 text-xl font-black tracking-wide">⚡ STRIDE RUNNING</div>
            <div className="text-gray-400 text-xs mt-1">Bon de Commande Fournisseur</div>
          </div>
          <div className="text-right">
            <div className="text-white text-2xl font-black">{po.poNumber}</div>
            <div className="text-gray-400 text-xs mt-1">
              {new Date(po.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total unités</p>
            <p className="text-2xl font-black text-brand-500 mt-0.5">{totalUnits}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Références</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{po.items.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</p>
            <p className="text-sm font-bold text-gray-700 mt-1">{STATUS_LABELS[po.status] ?? po.status}</p>
          </div>
        </div>

        {/* Table articles */}
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Photo</th>
              <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Produit / SKU</th>
              <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Taille</th>
              <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Couleur</th>
              <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Quantité</th>
              <th className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide print:table-cell">✓</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, idx) => (
              <tr key={item.id} className={cn("border-b border-gray-100", idx % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                <td className="px-8 py-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-100" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-gray-900 text-base">{item.productName}</p>
                  {item.sku && <p className="text-xs text-gray-500 mt-0.5 font-mono">SKU : {item.sku}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Commandes : {item.orderIds.length}
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-3xl font-black text-gray-900">{item.size}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-7 h-7 rounded-full border-2 border-gray-200 block"
                      style={{ backgroundColor: item.colorHex ?? "#ccc" }} />
                    <span className="text-xs text-gray-600">{item.color}</span>
                    {item.colorHex && <span className="text-[10px] text-gray-400 font-mono">{item.colorHex}</span>}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-3xl font-black text-brand-500">{item.quantity}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-md mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900">
              <td colSpan={4} className="px-8 py-4 text-white font-bold">TOTAL GÉNÉRAL</td>
              <td className="px-4 py-4 text-center text-3xl font-black text-brand-400">{totalUnits}</td>
              <td />
            </tr>
          </tfoot>
        </table>
        </div>

        {/* Notes */}
        {po.notes && (
          <div className="px-8 py-5 bg-amber-50 border-t border-amber-100">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-amber-900">{po.notes}</p>
          </div>
        )}

        {/* Footer imprimable */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Merci de confirmer la réception de ce bon de commande par email · Généré automatiquement par Stride Running
          </p>
          {po.sentAt && (
            <p className="text-xs text-gray-400 mt-1">
              Envoyé le {new Date(po.sentAt).toLocaleString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      {/* Modal envoi email */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Envoyer au fournisseur</h2>
            <p className="text-sm text-gray-500">Un email avec le bon de commande détaillé sera envoyé.</p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email du fournisseur</label>
              <input type="email" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder="fournisseur@exemple.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
                Annuler
              </button>
              <button onClick={sendEmail} disabled={sending || !supplierEmail}
                className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
