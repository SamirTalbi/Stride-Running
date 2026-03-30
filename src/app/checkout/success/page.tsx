"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Vider le panier après paiement confirmé
    clearCart();
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={36} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Paiement confirmé !</h1>
        <p className="text-gray-500 mb-2">
          Merci pour votre commande. Votre paiement a bien été accepté.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400 font-mono mb-6">Réf : {sessionId.slice(-12).toUpperCase()}</p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Un email de confirmation vous a été envoyé. Votre commande sera expédiée sous 1–2 jours ouvrés.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors">
            <Package size={16} /> Suivre ma commande
          </Link>
          <Link href="/men"
            className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
