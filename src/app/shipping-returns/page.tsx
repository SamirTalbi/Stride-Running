import type { Metadata } from "next";
import { Truck, RotateCcw, Clock, Globe, Shield, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Livraison & Retours — Stride Running",
  description: "Livraison gratuite dès 75 €, retours gratuits sous 30 jours. Tout ce que vous devez savoir sur vos commandes Stride Running.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-display font-black text-display-md text-gray-900 mb-3">
          Livraison &amp; Retours
        </h1>
        <p className="text-gray-500 text-lg">
          Nous voulons que chaque commande soit parfaite. Sinon, nous arrangeons ça.
        </p>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Truck, title: "Livraison offerte", desc: "Dès 75 €", color: "text-brand-500 bg-brand-50" },
          { icon: Clock, title: "2–7 jours", desc: "Délai de livraison", color: "text-blue-500 bg-blue-50" },
          { icon: RotateCcw, title: "30 jours", desc: "Retours gratuits", color: "text-green-500 bg-green-50" },
          { icon: Globe, title: "4 pays", desc: "Zones de livraison", color: "text-purple-500 bg-purple-50" },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} />
            </div>
            <p className="font-bold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Livraison */}
      <section className="mb-12" id="shipping">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-5 pb-3 border-b border-gray-100">
          Politique de livraison
        </h2>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-l-xl">Mode</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Délai</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Coût</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-r-xl">Gratuit dès</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Standard", "5–7 jours ouvrés", "6,99 €", "Gratuit dès 75 €"],
                  ["Express", "2–3 jours ouvrés", "12,99 €", "—"],
                  ["Livraison en 24h", "1 jour ouvré", "24,99 €", "—"],
                  ["International (BE, CH, LU)", "7–14 jours ouvrés", "19,99 €", "Gratuit dès 150 €"],
                ].map(([method, time, cost, threshold]) => (
                  <tr key={method}>
                    <td className="px-4 py-3 font-medium text-gray-900">{method}</td>
                    <td className="px-4 py-3 text-gray-600">{time}</td>
                    <td className="px-4 py-3 text-gray-600">{cost}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p>Les commandes passées du lundi au vendredi avant 14h sont traitées le jour même. Les commandes du week-end sont traitées le lundi.</p>
            <p>Vous recevrez un email avec les informations de suivi une fois votre commande expédiée.</p>
            <p>Toutes les commandes sont expédiées depuis notre entrepôt en France.</p>
          </div>
        </div>
      </section>

      {/* Retours */}
      <section className="mb-12" id="returns">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-5 pb-3 border-b border-gray-100">
          Retours &amp; Échanges
        </h2>
        <div className="space-y-5 text-sm text-gray-600">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
            <p className="font-semibold text-green-800 mb-1">Retours gratuits sous 30 jours</p>
            <p className="text-green-700">Retournez n&apos;importe quel article dans les 30 jours pour un remboursement intégral. Sans questions. Sans frais de retour.</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Conditions de retour</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Les articles doivent être non portés et en état d&apos;origine</li>
              <li>L&apos;emballage d&apos;origine et les étiquettes doivent être intacts</li>
              <li>Preuve d&apos;achat requise</li>
              <li>Le retour doit être initié dans les 30 jours suivant la livraison</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Comment retourner un article</h3>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Connectez-vous à votre compte et allez dans Mes commandes</li>
              <li>Sélectionnez l&apos;article à retourner et cliquez sur « Initier un retour »</li>
              <li>Imprimez l&apos;étiquette de retour prépayée</li>
              <li>Déposez le colis dans n&apos;importe quel point relais Colissimo</li>
              <li>Remboursement traité sous 3 à 5 jours ouvrés après réception</li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Échanges</h3>
            <p>Pour un échange de pointure, retournez votre paire d&apos;origine pour un remboursement complet et passez une nouvelle commande. C&apos;est la façon la plus rapide d&apos;obtenir la bonne taille.</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <div className="bg-gray-50 rounded-3xl p-8">
        <h3 className="font-bold text-gray-900 mb-2">Besoin d&apos;aide ?</h3>
        <p className="text-sm text-gray-600 mb-4">Notre équipe est disponible du lundi au vendredi, de 9h à 18h.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/support" className="flex items-center gap-2 px-5 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors text-sm">
            <Phone size={14} /> Contacter le support
          </Link>
          <Link href="/faq" className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm">
            <Shield size={14} /> Voir la FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
