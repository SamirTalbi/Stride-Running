import type { Metadata } from "next";
import { ShoeFinder } from "@/components/home/ShoeFinder";

export const metadata: Metadata = {
  title: "Trouver ma chaussure de running idéale",
  description: "Répondez à 4 questions et obtenez des recommandations personnalisées selon votre surface, distance, expérience et objectifs.",
};

export default function FindMyShoe() {
  return (
    <div className="bg-dark-DEFAULT min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-12 pb-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-2">
            Outil personnalisé
          </p>
          <h1 className="font-display font-black text-display-lg text-white mb-4">
            Trouvez votre chaussure idéale
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Notre outil analyse votre profil de coureur pour vous trouver la chaussure parfaite.
          </p>
        </div>
      </div>
      <ShoeFinder />
    </div>
  );
}
