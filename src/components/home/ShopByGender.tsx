import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Homme",
    subtitle: "Chaussures, ensembles & accessoires",
    href: "/men",
    image: "https://images.pexels.com/photos/5692478/pexels-photo-5692478.jpeg?auto=compress&cs=tinysrgb&w=1400",
    accentColor: "bg-brand-500",
    eyebrow: "Collection",
  },
  {
    title: "Femme",
    subtitle: "Chaussures, ensembles & accessoires",
    href: "/women",
    image: "https://images.pexels.com/photos/37167335/pexels-photo-37167335.jpeg?auto=compress&cs=tinysrgb&w=1400",
    accentColor: "bg-rose-400",
    eyebrow: "Collection",
  },
];

export function ShopByGender() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
            Pour vous
          </p>
          <h2 className="font-display font-black text-display-md text-gray-900">
            Shop par profil
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="relative overflow-hidden rounded-2xl group h-[440px] md:h-[540px] block bg-dark-DEFAULT shadow-card hover:shadow-2xl transition-shadow duration-500"
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              priority
              className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Dégradés cumulés pour profondeur cinéma */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Barre d'accent en haut qui se déploie au hover */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.accentColor} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`} />

            {/* Contenu */}
            <div className="relative h-full flex flex-col justify-end p-6 lg:p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-[2px] ${card.accentColor}`} />
                  <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">
                    {card.eyebrow}
                  </p>
                </div>

                <h3 className="font-display font-black text-white text-5xl lg:text-7xl leading-[0.9] tracking-tight">
                  {card.title}
                </h3>

                <p className="text-white/75 text-sm lg:text-base font-medium max-w-xs">
                  {card.subtitle}
                </p>

                <div className="pt-3">
                  <span className="inline-flex items-center gap-2.5 text-white text-sm font-bold tracking-wide bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-5 pr-2 py-2 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                    <span>Découvrir la collection</span>
                    <span className={`w-7 h-7 rounded-full ${card.accentColor} flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-300`}>
                      <ArrowRight
                        size={14}
                        className="text-white transform translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300"
                      />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
