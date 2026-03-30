import type { Metadata } from "next";
import { BestSellers } from "@/components/home/BestSellers";

export const metadata: Metadata = {
  title: "Meilleures Ventes — Chaussures Running",
  description: "Les chaussures de running les plus populaires, plébiscitées par des milliers de coureurs.",
};

export default function BestSellersPage() {
  return (
    <>
      <div className="bg-amber-900 text-white py-12 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-sm text-amber-300 font-semibold uppercase tracking-widest mb-2">Coups de cœur</p>
          <h1 className="font-display font-black text-5xl text-white">Meilleures Ventes</h1>
          <p className="text-white/60 mt-2">Les chaussures de running que notre communauté adore.</p>
        </div>
      </div>
      <div className="py-4">
        <BestSellers />
      </div>
    </>
  );
}
