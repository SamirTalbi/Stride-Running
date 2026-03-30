"use client";

import { useState } from "react";
import { ChevronDown, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Livraison",
    questions: [
      {
        q: "Combien de temps prend la livraison ?",
        a: "La livraison standard prend 5 à 7 jours ouvrés. La livraison express est en 2 à 3 jours, et la livraison en 24h est disponible pour les commandes passées avant 14h."
      },
      {
        q: "La livraison est-elle gratuite ?",
        a: "Oui ! Toutes les commandes de plus de 75 € bénéficient de la livraison standard gratuite. Nous livrons en France, Belgique, Suisse et Luxembourg."
      },
      {
        q: "Puis-je suivre ma commande ?",
        a: "Absolument. Une fois votre commande expédiée, vous recevrez un numéro de suivi par email. Vous pouvez également le suivre depuis votre compte, dans « Mes commandes »."
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Nous livrons actuellement en France métropolitaine, Belgique, Suisse et Luxembourg. La livraison internationale prend généralement 7 à 14 jours ouvrés."
      },
    ],
  },
  {
    category: "Retours & Échanges",
    questions: [
      {
        q: "Quelle est votre politique de retour ?",
        a: "Nous offrons des retours gratuits sous 30 jours pour les articles non portés dans leur emballage d'origine. Si vos chaussures ne vous conviennent pas, nous arrangeons ça."
      },
      {
        q: "Comment initier un retour ?",
        a: "Connectez-vous à votre compte, allez dans Mes commandes, et cliquez sur « Retourner l'article ». Vous pouvez aussi contacter notre support à support@stride.run."
      },
      {
        q: "Puis-je échanger pour une autre pointure ?",
        a: "Oui ! Les échanges de pointure sont gratuits et simples. Retournez votre paire d'origine et passez une nouvelle commande, ou contactez-nous pour un échange direct."
      },
      {
        q: "Que faire si mes chaussures arrivent endommagées ?",
        a: "Nous sommes désolés ! Contactez-nous immédiatement à support@stride.run avec des photos et nous vous enverrons un remplacement sans frais."
      },
    ],
  },
  {
    category: "Pointures & Ajustement",
    questions: [
      {
        q: "Comment trouver ma bonne pointure ?",
        a: "Utilisez notre outil « Trouver ma chaussure » pour des recommandations personnalisées, ou consultez notre guide des pointures. Si vous êtes entre deux tailles, prenez la plus grande."
      },
      {
        q: "Les chaussures de running taillent-elles différemment ?",
        a: "Oui — les chaussures de running ont généralement un espace d'un pouce dans la pointe pour tenir compte du gonflement du pied lors des longues sorties."
      },
      {
        q: "Que signifie « large » ou « étroit » ?",
        a: "La largeur standard est D pour les hommes et B pour les femmes. Large correspond à 2E (hommes) ou D (femmes). Si vous avez les pieds larges, vérifiez la disponibilité de la largeur sur chaque page produit."
      },
    ],
  },
  {
    category: "Produits & Disponibilité",
    questions: [
      {
        q: "Quelles marques proposez-vous ?",
        a: "Nous proposons plus de 30 marques premium dont Nike, Adidas, Brooks, HOKA, Asics, New Balance, Saucony, Salomon, On Running, Mizuno, et bien d'autres."
      },
      {
        q: "Comment être notifié quand une pointure épuisée est de retour en stock ?",
        a: "Cliquez sur le bouton « Me notifier » sur n'importe quelle taille en rupture pour recevoir une alerte email dès qu'elle est disponible."
      },
      {
        q: "Vos produits sont-ils authentiques ?",
        a: "100%. Nous nous approvisionnons uniquement auprès des marques ou des distributeurs agréés. Chaque produit vendu sur Stride est garanti authentique."
      },
    ],
  },
  {
    category: "Paiement & Codes Promo",
    questions: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, Amex), PayPal, Apple Pay et Google Pay."
      },
      {
        q: "Comment utiliser un code promo ?",
        a: "Saisissez votre code lors du checkout dans le champ « Code promo » avant de finaliser votre commande."
      },
      {
        q: "Mes informations de paiement sont-elles sécurisées ?",
        a: "Absolument. Tous les paiements sont traités via Stripe avec un chiffrement SSL 256 bits. Nous ne stockons jamais vos coordonnées bancaires."
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className={cn("text-sm font-semibold transition-colors", open ? "text-brand-500" : "text-gray-900")}>
          {question}
        </span>
        <ChevronDown
          size={16}
          className={cn("text-gray-400 flex-shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed animate-slide-up">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");

  const filtered = faqs.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        !search ||
        q.q.toLowerCase().includes(search.toLowerCase()) ||
        q.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap size={24} className="text-brand-500" />
        </div>
        <h1 className="font-display font-black text-display-md text-gray-900 mb-3">
          Questions fréquentes
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Vous ne trouvez pas ce que vous cherchez ? Contactez notre équipe support.
        </p>
      </div>

      {/* Recherche */}
      <div className="relative mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Rechercher dans les questions fréquentes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-2xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      {/* Sections FAQ */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun résultat pour &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((category) => (
            <div key={category.category}>
              <h2 className="font-display font-black text-lg text-gray-900 mb-3 pb-3 border-b-2 border-gray-100">
                {category.category}
              </h2>
              <div>
                {category.questions.map((item) => (
                  <FAQItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA contact */}
      <div className="mt-12 p-8 bg-brand-50 rounded-3xl text-center">
        <h3 className="font-bold text-gray-900 mb-2">Vous avez encore des questions ?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Nos experts running sont là pour vous aider
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@stride.run"
            className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-sm"
          >
            Contacter le support
          </a>
          <a
            href="/support"
            className="px-6 py-3 border border-brand-200 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors text-sm"
          >
            Centre d&apos;aide
          </a>
        </div>
      </div>
    </div>
  );
}
