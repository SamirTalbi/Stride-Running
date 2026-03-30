"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical, Play, CheckCircle, Loader2, Package,
  ChevronRight, AlertTriangle, Info,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  price: number;
  stock: number;
  product: {
    id: string;
    name: string;
    sku: string;
    images: { url: string }[];
  };
};

type CreatedOrder = {
  id: string;
  orderNumber: string;
  email: string;
  total: number;
  itemCount: number;
};

export default function TestOrderPage() {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [itemsPerOrder, setItemsPerOrder] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CreatedOrder[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders/test")
      .then((r) => r.json())
      .then((j) => setVariants(j.data ?? []))
      .finally(() => setLoadingVariants(false));
  }, []);

  function toggleVariant(id: string) {
    setSelectedVariantIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  async function generate() {
    setGenerating(true);
    setError("");
    setResult(null);

    const r = await fetch("/api/admin/orders/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count,
        itemsPerOrder,
        variantIds: selectedVariantIds.length > 0 ? selectedVariantIds : undefined,
      }),
    });

    const j = await r.json();
    setGenerating(false);

    if (!r.ok) { setError(j.error ?? "Erreur inconnue"); return; }
    setResult(j.orders);
  }

  // Grouper les variants par produit
  const byProduct = variants.reduce<Record<string, { product: Variant["product"]; variants: Variant[] }>>((acc, v) => {
    const pid = v.product.id;
    if (!acc[pid]) acc[pid] = { product: v.product, variants: [] };
    acc[pid].variants.push(v);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
          <FlaskConical size={18} className="text-purple-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Simulateur de commandes</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-12">
        Génère des commandes de test réalistes pour valider le workflow de fulfillment.
      </p>

      {/* Avertissement Stripe */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Compatibilité Stripe :</strong> Ces commandes sont structurellement identiques aux vraies commandes.
          La seule différence est que <code className="bg-blue-100 px-1 rounded font-mono text-xs">stripePaymentId</code> commence par <code className="bg-blue-100 px-1 rounded font-mono text-xs">test_pi_</code>.
          Quand Stripe sera branché, les vraies commandes auront un <code className="bg-blue-100 px-1 rounded font-mono text-xs">pi_xxx</code> réel — rien d&apos;autre ne change.
        </div>
      </div>

      {/* Config */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 space-y-5">
        <h2 className="font-bold text-gray-900">Configuration</h2>

        <div className="grid grid-cols-2 gap-5">
          {/* Nombre de commandes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nombre de commandes à générer
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={30} value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="flex-1 accent-brand-500"
              />
              <span className="w-10 text-center font-black text-brand-500 text-xl">{count}</span>
            </div>
            <p className="text-xs text-gray-400">Maximum 30 commandes par génération</p>
          </div>

          {/* Articles par commande */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Articles par commande
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setItemsPerOrder(n)}
                  className={cn("w-10 h-10 rounded-xl text-sm font-bold transition-all border",
                    itemsPerOrder === n
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300")}>
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Produits distincts sélectionnés aléatoirement</p>
          </div>
        </div>
      </div>

      {/* Sélection produits */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Produits à inclure</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {selectedVariantIds.length === 0 ? "Tous les produits (aléatoire)" : `${selectedVariantIds.length} variant(s) sélectionné(s)`}
            </span>
            {selectedVariantIds.length > 0 && (
              <button onClick={() => setSelectedVariantIds([])}
                className="text-xs text-brand-500 hover:underline font-semibold">
                Tout désélectionner
              </button>
            )}
          </div>
        </div>

        {loadingVariants ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
        ) : Object.keys(byProduct).length === 0 ? (
          <div className="text-center py-10">
            <AlertTriangle size={28} className="mx-auto text-amber-400 mb-3" />
            <p className="text-sm text-gray-500 font-semibold">Aucun produit disponible</p>
            <p className="text-xs text-gray-400 mt-1">Crée des produits avec du stock avant de simuler des commandes.</p>
            <button onClick={() => router.push("/admin/products")}
              className="mt-3 text-brand-500 text-sm font-semibold hover:underline">
              Gérer les produits →
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {Object.values(byProduct).map(({ product, variants: pvs }) => (
              <div key={product.id}>
                <div className="flex items-center gap-3 mb-2">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400 font-mono">SKU : {product.sku}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-13 pl-13">
                  {pvs.map((v) => {
                    const selected = selectedVariantIds.includes(v.id);
                    return (
                      <button key={v.id} onClick={() => toggleVariant(v.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                          selected
                            ? "bg-brand-500 text-white border-brand-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                        )}>
                        <span className="w-3 h-3 rounded-full border border-white/40 flex-shrink-0"
                          style={{ backgroundColor: v.colorHex ?? "#ccc" }} />
                        {v.size} · {v.color}
                        <span className={cn("font-mono text-[10px]", selected ? "text-white/70" : "text-gray-400")}>
                          {formatPrice(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-green-500" />
            <p className="font-bold text-green-800">{result.length} commande(s) générée(s) avec succès !</p>
          </div>
          <div className="space-y-2">
            {result.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 text-sm">
                <div>
                  <span className="font-mono font-bold text-gray-900 text-xs">{o.orderNumber}</span>
                  <span className="text-gray-400 text-xs ml-2">· {o.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{o.itemCount} article(s)</span>
                  <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => router.push("/admin/fulfillment")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors">
              Voir dans Fulfillment <ChevronRight size={14} />
            </button>
            <button onClick={() => setResult(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white rounded-xl border border-green-200 transition-colors">
              Générer d&apos;autres
            </button>
          </div>
        </div>
      )}

      {/* Bouton principal */}
      {!result && (
        <button onClick={generate} disabled={generating || loadingVariants || Object.keys(byProduct).length === 0}
          className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold text-base transition-colors shadow-lg">
          {generating ? (
            <><Loader2 size={20} className="animate-spin" /> Génération en cours…</>
          ) : (
            <><Play size={20} /> Générer {count} commande{count > 1 ? "s" : ""} de test</>
          )}
        </button>
      )}
    </div>
  );
}
