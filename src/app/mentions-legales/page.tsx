import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Stride Running : éditeur, hébergeur et informations légales.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      <h1 className="font-display font-black text-display-md text-gray-900 mb-3">Mentions légales</h1>
      <p className="text-gray-500 mb-10">Dernière mise à jour : juin 2026</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">1. Éditeur du site</h2>
          <p>
            Le site <strong>Stride Running</strong> (ci-après « le Site ») est édité par :
          </p>
          <ul className="mt-3 space-y-1">
            <li>Raison sociale : <strong>[À COMPLÉTER — nom de la société]</strong></li>
            <li>Forme juridique : [À COMPLÉTER — ex. SAS, SARL, EI]</li>
            <li>Capital social : [À COMPLÉTER] €</li>
            <li>Siège social : [À COMPLÉTER — adresse complète]</li>
            <li>SIREN / SIRET : [À COMPLÉTER]</li>
            <li>RCS : [À COMPLÉTER — ville et numéro]</li>
            <li>N° TVA intracommunautaire : [À COMPLÉTER]</li>
            <li>Adresse e-mail : support@stride-running.com</li>
            <li>Téléphone : [À COMPLÉTER]</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">2. Directeur de la publication</h2>
          <p>[À COMPLÉTER — nom du représentant légal / directeur de la publication].</p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">3. Hébergement</h2>
          <p>
            Le Site est hébergé par : <strong>[À COMPLÉTER — nom de l'hébergeur]</strong>, [adresse de l'hébergeur],
            [téléphone de l'hébergeur].
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur le Site (textes, visuels, logos, marques, photographies, mise en page)
            est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation,
            totale ou partielle, sans autorisation écrite préalable de l'éditeur est interdite et constitue une contrefaçon.
            Les marques et logos des fabricants cités demeurent la propriété de leurs titulaires respectifs.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">5. Responsabilité</h2>
          <p>
            L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur le Site mais ne saurait être tenu
            responsable des erreurs, omissions ou d'une indisponibilité temporaire. Les liens vers des sites tiers sont
            fournis à titre informatif ; l'éditeur n'exerce aucun contrôle sur leur contenu.
          </p>
        </section>

        <section>
          <h2 className="font-display font-black text-xl text-gray-900 mb-3">6. Contact</h2>
          <p>
            Pour toute question relative au Site : <a href="mailto:support@stride-running.com" className="text-brand-500 hover:text-brand-600 font-medium">support@stride-running.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
