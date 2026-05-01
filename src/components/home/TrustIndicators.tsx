import { Truck, RotateCcw, Shield, PackageSearch, Zap } from "lucide-react";

const indicators = [
  {
    icon: Truck,
    title: "Livraison Gratuite",
    desc: "Dès 75€ d'achat",
    color: "text-brand-500 bg-brand-50",
  },
  {
    icon: RotateCcw,
    title: "Satisfait ou remboursé ✅",
    desc: "Gratuit sous 15 jours",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: Shield,
    title: "Paiement Sécurisé",
    desc: "Cryptage SSL 256 bits",
    color: "text-green-500 bg-green-50",
  },
  {
    icon: PackageSearch,
    title: "Suivre son colis",
    desc: "En temps réel",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: Zap,
    title: "Livraison Rapide",
    desc: "2 à 5 jours ouvrés",
    color: "text-purple-500 bg-purple-50",
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {indicators.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50
                         transition-colors duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}
                              group-hover:scale-110 transition-transform duration-200`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{item.title}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
