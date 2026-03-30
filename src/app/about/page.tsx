import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Zap, Heart, Globe, Award, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos de Stride Running",
  description: "Notre histoire, notre mission et notre passion pour aider chaque coureur à trouver la chaussure parfaite.",
};

const values = [
  {
    icon: Heart,
    title: "Le coureur avant tout",
    desc: "Chaque décision que nous prenons est guidée par ce qui est le mieux pour le coureur. Pas la marque. Pas la marge. Vous.",
    color: "bg-red-50 text-red-500",
  },
  {
    icon: Award,
    title: "Sélection experte",
    desc: "Notre équipe d'experts running teste personnellement chaque produit que nous vendons. Pas de flou — seulement le meilleur équipement.",
    color: "bg-amber-50 text-amber-500",
  },
  {
    icon: Globe,
    title: "Communauté",
    desc: "La course à pied est pour tout le monde. Nous construisons une communauté qui célèbre chaque arrivée, du 5K aux 100 miles.",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: Zap,
    title: "Performance",
    desc: "Nous croyons que le bon équipement peut transformer votre running. Nous vous donnons accès au meilleur.",
    color: "bg-brand-50 text-brand-500",
  },
];

const team = [
  { name: "Alex Chen", role: "Fondateur & CEO", runner: "Marathonien, qualifié Boston", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&facepad=2" },
  { name: "Sarah Rivera", role: "Responsable Sélection", runner: "Ultra-trailleuse, 80+ km", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&facepad=2" },
  { name: "James Park", role: "Expert Running", runner: "Athlétisme, ex-universitaire", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&facepad=2" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative bg-dark-DEFAULT py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=600&fit=crop"
            alt="Coureurs"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-2xl text-white">STRIDE</span>
          </div>
          <h1 className="font-display font-black text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Nés pour courir.<br />
            <span className="text-brand-400">Fait pour les coureurs.</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            Nous avons créé Stride parce que trouver la bonne chaussure de running ne devrait pas être compliqué.
            Cela devrait être aussi excitant que de franchir la ligne d&apos;arrivée.
          </p>
        </div>
      </div>

      {/* Histoire */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3">Notre histoire</p>
            <h2 className="font-display font-black text-3xl text-gray-900 mb-5">
              De la frustration d&apos;un coureur à votre partenaire de confiance
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                En 2019, Alex Chen préparait son troisième marathon quand il a passé des heures à chercher la bonne chaussure en ligne.
                Les avis étaient confus, les conseils de pointure catastrophiques, et chaque site semblait optimisé pour la pub, pas pour les réponses.
              </p>
              <p>
                Il savait qu&apos;il devait y avoir une meilleure façon. Alors il l&apos;a construite. Stride a commencé comme un blog avec des tests de chaussures honnêtes, réalisés par des coureurs.
                En un an, c&apos;est devenu la ressource la plus fiable de la communauté.
              </p>
              <p>
                Aujourd&apos;hui, Stride est une plateforme e-commerce complète qui sert plus de 500 000 coureurs dans le monde.
                Mais nous n&apos;avons jamais oublié pourquoi nous avons commencé : rendre facile pour chaque coureur de trouver sa chaussure parfaite.
              </p>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=800&fit=crop"
              alt="Coureur"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 text-center">
          {[
            { value: "500K+", label: "Coureurs satisfaits" },
            { value: "30+", label: "Meilleures marques" },
            { value: "4.9★", label: "Note moyenne" },
            { value: "2019", label: "Fondé en" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-gray-50 rounded-2xl">
              <p className="font-display font-black text-3xl text-brand-500 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Valeurs */}
        <div className="mb-20">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 text-center">
            Ce en quoi nous croyons
          </p>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-8 text-center">Nos valeurs</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {values.map((value) => (
              <div key={value.title} className="flex gap-4 p-5 bg-white rounded-2xl shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${value.color}`}>
                  <value.icon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <div className="mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 text-center">
            L&apos;équipe
          </p>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-8 text-center">
            Des coureurs, pour les coureurs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-md">
                  <Image src={member.image} alt={member.name} width={80} height={80} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-brand-500 font-medium">{member.role}</p>
                <p className="text-xs text-gray-500 mt-1">{member.runner}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-dark-DEFAULT rounded-3xl p-10 text-center text-white">
          <h2 className="font-display font-black text-3xl mb-3">Prêt à trouver votre chaussure ?</h2>
          <p className="text-white/70 mb-6">Répondez à notre quiz de 60 secondes et recevez des recommandations personnalisées.</p>
          <Link href="/find-my-shoe" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
            Trouver ma chaussure idéale <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
