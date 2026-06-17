import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données personnelles (RGPD) de Stride Running.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      <h1 className="font-display font-black text-display-md text-gray-900 mb-3">
        Politique de confidentialité
      </h1>
      <p className="text-gray-500 mb-10">Dernière mise à jour : juin 2026</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur le site Stride Running est
            <strong> [À COMPLÉTER — nom de la société]</strong>, [adresse]. Contact :
            <a href="mailto:support@stride-running.com" className="text-brand-500 hover:text-brand-600 font-medium"> support@stride-running.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Identité et coordonnées : nom, prénom, e-mail, téléphone, adresse de livraison et de facturation ;</li>
            <li>Données de commande : produits, montants, historique d'achats ;</li>
            <li>Données de compte : identifiants de connexion (gérés par notre prestataire d'authentification) ;</li>
            <li>Données techniques : adresse IP, type de navigateur, cookies (voir notre <a href="/cookies" className="text-brand-500 hover:text-brand-600 font-medium">Politique cookies</a>).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">3. Finalités et bases légales</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Gestion des commandes et de la relation client — <em>exécution du contrat</em> ;</li>
            <li>Paiement sécurisé — <em>exécution du contrat</em> ;</li>
            <li>Gestion du compte client — <em>exécution du contrat</em> ;</li>
            <li>Envoi d'e-mails commerciaux / newsletter — <em>consentement</em> ;</li>
            <li>Amélioration du site et statistiques — <em>intérêt légitime / consentement</em> ;</li>
            <li>Respect des obligations légales (comptabilité, facturation) — <em>obligation légale</em>.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">4. Destinataires et sous-traitants</h2>
          <p>
            Vos données sont destinées à nos services internes et à nos sous-traitants nécessaires au fonctionnement du
            service, notamment : prestataire de paiement (Stripe), service d'authentification (Clerk), hébergement des
            images et du site, et service d'envoi d'e-mails. Ces prestataires présentent des garanties conformes au RGPD.
            Vos données ne sont jamais vendues.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">5. Durée de conservation</h2>
          <p>
            Les données de commande sont conservées le temps de la relation commerciale puis archivées conformément aux
            obligations légales (notamment 10 ans pour les pièces comptables). Les données de compte sont conservées
            jusqu'à la suppression du compte. Les données liées à la prospection sont conservées 3 ans à compter du
            dernier contact.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">6. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation,
            d'opposition, de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment.
            Pour exercer ces droits, écrivez à
            <a href="mailto:support@stride-running.com" className="text-brand-500 hover:text-brand-600 font-medium"> support@stride-running.com</a>.
            Vous pouvez également introduire une réclamation auprès de la CNIL
            (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-medium">www.cnil.fr</a>).
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">7. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
            contre tout accès, altération ou divulgation non autorisés (chiffrement des paiements, accès restreints).
          </p>
        </section>
      </div>
    </div>
  );
}
