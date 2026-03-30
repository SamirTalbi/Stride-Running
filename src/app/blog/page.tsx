import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BlogGrid } from "./BlogGrid";

export const metadata: Metadata = {
  title: "Conseils Running — Entraînement, Équipement & Nutrition",
  description: "Conseils d'experts, tests de chaussures, plans d'entraînement et inspiration pour tous les niveaux de coureurs.",
};

const posts = [
  {
    id: "1",
    title: "Comment choisir ses premières chaussures de running : le guide complet",
    slug: "choisir-premieres-chaussures-running",
    excerpt: "Acheter sa première paire de chaussures de running peut être intimidant. Voici tout ce qu'il faut savoir pour faire le bon choix.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop",
    author: "Sarah Mitchell",
    category: "Guide Débutant",
    readTime: "8 min",
    featured: true,
    publishedAt: "8 mars 2024",
  },
  {
    id: "2",
    title: "Running route vs trail : quelle chaussure choisir ?",
    slug: "running-route-vs-trail",
    excerpt: "Toutes les chaussures de running ne se valent pas. Comprendre les différences clés vous aidera à performer et éviter les blessures.",
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&h=500&fit=crop",
    author: "Mike Torres",
    category: "Tests & Comparatifs",
    readTime: "6 min",
    featured: false,
    publishedAt: "5 mars 2024",
  },
  {
    id: "3",
    title: "Préparer son premier marathon : plan semaine par semaine",
    slug: "preparer-premier-marathon",
    excerpt: "Un plan d'entraînement complet sur 16 semaines pour vous amener sereinement jusqu'à la ligne d'arrivée de votre premier marathon.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop",
    author: "Emma Richards",
    category: "Entraînement",
    readTime: "12 min",
    featured: false,
    publishedAt: "28 février 2024",
  },
  {
    id: "4",
    title: "Les meilleures chaussures HOKA en 2024 — Notre classement",
    slug: "meilleures-chaussures-hoka-2024",
    excerpt: "On a testé tous les modèles HOKA pour vous. Voici nos coups de cœur pour la route, le trail et la récupération.",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=500&fit=crop",
    author: "James Park",
    category: "Tests & Comparatifs",
    readTime: "10 min",
    featured: false,
    publishedAt: "20 février 2024",
  },
  {
    id: "5",
    title: "Nutrition running : quoi manger avant, pendant et après",
    slug: "nutrition-running-guide",
    excerpt: "Optimisez votre alimentation avec notre guide complet sur la nutrition, l'hydratation et les aliments de récupération pour les coureurs.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop",
    author: "Dr. Lisa Chen",
    category: "Nutrition",
    readTime: "9 min",
    featured: false,
    publishedAt: "15 février 2024",
  },
  {
    id: "6",
    title: "Comment passer sous les 4h au marathon",
    slug: "passer-sous-4h-marathon",
    excerpt: "Conseils d'experts, stratégies d'entraînement et chaussures recommandées pour atteindre l'objectif des 4 heures au marathon.",
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&h=500&fit=crop",
    author: "Coach David Kim",
    category: "Entraînement",
    readTime: "7 min",
    featured: false,
    publishedAt: "10 février 2024",
  },
  {
    id: "7",
    title: "5 erreurs à éviter quand on débute le running",
    slug: "erreurs-debutant-running",
    excerpt: "Trop en faire trop vite, négliger l'échauffement, ignorer les douleurs… Découvrez les pièges classiques du débutant et comment les éviter.",
    image: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=800&h=500&fit=crop",
    author: "Sarah Mitchell",
    category: "Guide Débutant",
    readTime: "5 min",
    featured: false,
    publishedAt: "5 février 2024",
  },
  {
    id: "8",
    title: "Running en hiver : nos conseils pour courir par temps froid",
    slug: "running-hiver-conseils",
    excerpt: "Le froid ne doit pas être une excuse pour rester chez soi. Voici comment s'habiller, s'échauffer et rester motivé tout l'hiver.",
    image: "https://images.unsplash.com/photo-1508215885820-4585e56135c8?w=800&h=500&fit=crop",
    author: "Emma Richards",
    category: "Conseils Pratiques",
    readTime: "6 min",
    featured: false,
    publishedAt: "28 janvier 2024",
  },
  // Articles supplémentaires (chargés avec "load more")
  {
    id: "9",
    title: "Récupération après le sport : les meilleures pratiques",
    slug: "erreurs-debutant-running", // pointe vers article existant le plus proche
    excerpt: "Le repos fait partie de l'entraînement. Sommeil, étirements, bains froids… découvrez les techniques de récupération qui font vraiment la différence.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop",
    author: "Dr. Lisa Chen",
    category: "Conseils Pratiques",
    readTime: "6 min",
    featured: false,
    publishedAt: "20 janvier 2024",
  },
  {
    id: "10",
    title: "Running et perte de poids : ce que la science dit vraiment",
    slug: "nutrition-running-guide",
    excerpt: "Le running est-il efficace pour maigrir ? Quelle fréquence, quelle intensité, quelle alimentation ? On démêle le vrai du faux.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=500&fit=crop",
    author: "Coach David Kim",
    category: "Nutrition",
    readTime: "7 min",
    featured: false,
    publishedAt: "12 janvier 2024",
  },
  {
    id: "11",
    title: "Comment courir un 10km en moins d'une heure",
    slug: "passer-sous-4h-marathon",
    excerpt: "Le 10km en moins d'1h est l'objectif idéal pour les coureurs intermédiaires. Voici le plan d'entraînement et les conseils pour y arriver.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop",
    author: "Mike Torres",
    category: "Entraînement",
    readTime: "8 min",
    featured: false,
    publishedAt: "5 janvier 2024",
  },
];

const categories = ["Tous", "Guide Débutant", "Entraînement", "Tests & Comparatifs", "Nutrition", "Conseils Pratiques"];

export default function BlogPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
          Conseils & Inspiration
        </p>
        <h1 className="font-display font-black text-display-md text-gray-900 mb-4">
          Conseils Running
        </h1>
        <p className="text-gray-500 max-w-xl">
          Conseils d&apos;experts, tests d&apos;équipements, plans d&apos;entraînement et histoires de la communauté des coureurs.
        </p>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${cat === "Tous"
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="relative h-64 md:h-auto">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="brand">À la une</Badge>
              </div>
            </div>
            <div className="bg-white p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default">{featured.category}</Badge>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} /> {featured.readTime} de lecture
                </span>
              </div>
              <h2 className="font-display font-black text-2xl text-gray-900 mb-3 group-hover:text-brand-500 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <User size={13} /> {featured.author}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-500 group-hover:gap-2 transition-all">
                  Lire l&apos;article <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grid with load more */}
      <BlogGrid posts={rest} />
    </div>
  );
}
