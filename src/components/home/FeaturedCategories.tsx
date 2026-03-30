import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Running Route",
    desc: "Optimisées pour le bitume",
    href: "/men",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop&q=80",
    span: "col-span-2 row-span-2",
    tall: true,
  },
  {
    title: "Trail Running",
    desc: "Pour les aventures hors-route",
    href: "/shoes",
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=600&h=400&fit=crop&q=80",
    span: "col-span-1",
    tall: false,
  },
  {
    title: "Performance & Racing",
    desc: "Chaque seconde compte",
    href: "/best-sellers",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop&q=80",
    span: "col-span-1",
    tall: false,
  },
  {
    title: "Débuter le Running",
    desc: "Commencez votre aventure",
    href: "/find-my-shoe",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
    span: "col-span-1",
    tall: false,
  },
  {
    title: "Accessoires",
    desc: "Complétez votre équipement",
    href: "/accessories",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=400&fit=crop&q=80",
    span: "col-span-1",
    tall: false,
  },
];

export function FeaturedCategories() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
            Collections
          </p>
          <h2 className="font-display font-black text-display-md text-gray-900">
            Par catégorie
          </h2>
        </div>
        <Link
          href="/shoes"
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-500
                     hover:text-brand-500 transition-colors"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 auto-rows-[220px] md:auto-rows-[240px]">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className={`relative overflow-hidden rounded-2xl group ${cat.span} ${cat.tall ? "row-span-2" : ""}`}
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                            group-hover:from-black/80 transition-all duration-300" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className={`font-display font-black text-white leading-tight
                ${cat.tall ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"}`}>
                {cat.title}
              </h3>
              <p className="text-white/70 text-sm mt-1">{cat.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-white/80 text-sm font-medium
                              translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100
                              transition-all duration-300">
                Voir <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
