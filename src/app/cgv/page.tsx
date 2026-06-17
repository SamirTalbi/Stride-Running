import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions Générales de Vente (CGV) de Stride Running : commande, paiement, livraison, rétractation, retours et garanties.",
  alternates: { canonical: "/cgv" },
};

function Article({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-black text-xl text-gray-900 mb-3">
        Article {n} — {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      <h1 className="font-display font-black text-display-md text-gray-900 mb-3">
        Conditions Générales de Vente
      </h1>
      <p className="text-gray-500 mb-10">Dernière mise à jour : juin 2026</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <Article n={1} title="Objet">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits conclues sur le site
            Stride Running entre l'éditeur (le « Vendeur ») et tout client (le « Client »). Toute commande implique
            l'acceptation sans réserve des présentes CGV.
          </p>
        </Article>

        <Article n={2} title="Produits">
          <p>
            Les produits proposés sont décrits et présentés avec la plus grande exactitude possible. Les photographies
            sont non contractuelles et peuvent présenter de légères variations. Les offres sont valables dans la limite
            des stocks disponibles.
          </p>
        </Article>

        <Article n={3} title="Prix">
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC), hors frais de livraison. Le Vendeur se réserve
            le droit de modifier ses prix à tout moment ; les produits sont facturés sur la base des tarifs en vigueur au
            moment de la validation de la commande. Les frais de livraison sont précisés avant la validation finale.
          </p>
        </Article>

        <Article n={4} title="Commande">
          <p>
            Le Client valide sa commande après avoir vérifié le détail de son panier. La vente est considérée comme
            définitive après confirmation de la commande et encaissement du paiement. Un e-mail de confirmation
            récapitulant la commande est adressé au Client.
          </p>
        </Article>

        <Article n={5} title="Paiement">
          <p>
            Le paiement s'effectue en ligne par carte bancaire via notre prestataire de paiement sécurisé Stripe. Les
            données de paiement sont chiffrées et ne transitent jamais en clair par nos serveurs. La commande n'est
            traitée qu'après autorisation de paiement.
          </p>
        </Article>

        <Article n={6} title="Livraison">
          <p>
            Les produits sont livrés à l'adresse indiquée par le Client. Les délais et zones de livraison sont précisés
            sur la page <a href="/shipping-returns" className="text-brand-500 hover:text-brand-600 font-medium">Livraison &amp; Retours</a>.
            Les délais sont donnés à titre indicatif ; un retard ne peut donner lieu à annulation ou indemnité, sauf
            disposition légale impérative.
          </p>
        </Article>

        <Article n={7} title="Droit de rétractation">
          <p>
            Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client dispose d'un délai de
            <strong> quatorze (14) jours</strong> à compter de la réception des produits pour exercer son droit de
            rétractation, sans avoir à justifier de motif. Les produits doivent être retournés neufs, non portés et dans
            leur emballage d'origine. Les frais de retour sont à la charge du Client sauf mention contraire.
          </p>
        </Article>

        <Article n={8} title="Retours et remboursement">
          <p>
            En cas de rétractation ou de produit non conforme, le remboursement est effectué dans un délai de quatorze
            (14) jours suivant la réception du retour, par le même moyen de paiement que celui utilisé lors de la commande.
            Les modalités détaillées figurent sur la page Livraison &amp; Retours.
          </p>
        </Article>

        <Article n={9} title="Garanties légales">
          <p>
            Indépendamment de toute garantie commerciale, le Vendeur reste tenu de la garantie légale de conformité
            (articles L.217-3 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles
            1641 et suivants du Code civil). Le Client peut décider de mettre en œuvre la garantie de conformité dans un
            délai de deux ans à compter de la délivrance du bien.
          </p>
        </Article>

        <Article n={10} title="Données personnelles">
          <p>
            Le traitement des données personnelles du Client est décrit dans notre
            <a href="/confidentialite" className="text-brand-500 hover:text-brand-600 font-medium"> Politique de confidentialité</a>.
          </p>
        </Article>

        <Article n={11} title="Litiges et médiation">
          <p>
            En cas de litige, le Client peut recourir gratuitement à un médiateur de la consommation. Conformément à
            l'article L.612-1 du Code de la consommation : médiateur [À COMPLÉTER — nom et coordonnées du médiateur].
            Le Client peut également utiliser la plateforme européenne de Règlement en Ligne des Litiges :
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-medium"> ec.europa.eu/consumers/odr</a>.
          </p>
        </Article>

        <Article n={12} title="Droit applicable">
          <p>
            Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, les tribunaux français
            seront seuls compétents.
          </p>
        </Article>
      </div>
    </div>
  );
}
