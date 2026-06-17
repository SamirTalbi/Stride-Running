"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "stride-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
      else {
        const { date } = JSON.parse(saved);
        // ré-affiche après 6 mois
        if (Date.now() - date > 1000 * 60 * 60 * 24 * 182) setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (choice: "accepted" | "refused") => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, date: Date.now() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-5
                      flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
            <Cookie size={18} />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre accord, des cookies de mesure
            d'audience. Voir notre{" "}
            <Link href="/cookies" className="text-brand-500 hover:text-brand-600 font-medium underline">
              politique de cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => choose("refused")}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => choose("accepted")}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
