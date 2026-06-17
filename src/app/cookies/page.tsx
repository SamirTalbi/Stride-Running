import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Politique de gestion des cookies du site Stride Running : types de cookies, finalités et gestion du consentement.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      <h1 className="font-display font-black text-display-md text-gray-900 mb-3">Politique de cookies</h1>
      <p className="text-gray-500 mb-10">Dernière mise à jour : juin 2026</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier déposé sur votre terminal lors de la visite d'un site. Il permet de
            reconnaître votre navigateur, de mémoriser vos préférences et d'assurer le bon fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">2. Cookies utilisés</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-l-xl">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Finalité</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-r-xl">Consentement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-800">Essentiels</td>
                  <td className="px-4 py-3">Panier, connexion au compte, sécurité, préférences de consentement.</td>
                  <td className="px-4 py-3">Non requis (strictement nécessaires)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-800">Mesure d'audience</td>
                  <td className="px-4 py-3">Statistiques de fréquentation pour améliorer le site.</td>
                  <td className="px-4 py-3">Requis</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-800">Marketing</td>
                  <td className="px-4 py-3">Personnalisation et publicité (le cas échéant).</td>
                  <td className="px-4 py-3">Requis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">3. Gérer vos cookies</h2>
          <p>
            Lors de votre première visite, un bandeau vous permet d'accepter ou de refuser les cookies non essentiels.
            Vous pouvez modifier votre choix à tout moment en effaçant les cookies de votre navigateur ou via ses
            réglages. Le refus des cookies non essentiels n'empêche pas la navigation ni la passation de commande.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">4. Durée de conservation</h2>
          <p>
            Les cookies sont conservés pour une durée maximale de treize (13) mois. Votre choix de consentement est
            mémorisé pour une durée de six (6) mois.
          </p>
        </section>
      </div>
    </div>
  );
}
