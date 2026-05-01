import { Star, Quote } from "lucide-react";
import { getInitials } from "@/lib/utils";

const reviews = [
  {
    id: "1",
    name: "Sarah M.",
    rating: 5,
    title: "J'ai commandé des Saucony j'aime trop !",
    body: "Franchement les chaussures sont top qualité je me sens vraiment bien dedans.",
    product: "Saucony",
    verified: true,
    avatar: "",
    date: "il y a 2 jours",
  },
  {
    id: "2",
    name: "James K.",
    rating: 5,
    title: "Arrivé en 2 jours, super qualité",
    body: "Livraison rapide, excellent emballage, et les chaussures sont exactement comme décrites. Je repasserai commande sur ce site !",
    product: "Asics",
    verified: true,
    avatar: "",
    date: "il y a 1 semaine",
  },
  {
    id: "3",
    name: "Emma R.",
    rating: 5,
    title: "J'ai été surprise",
    body: "Au début j'ai été mitigé mais au final le service client est réactif la livraison est rapide je recommande.",
    product: "Ensemble Nike",
    verified: true,
    avatar: "",
    date: "il y a 2 semaines",
  },
  {
    id: "4",
    name: "Rayan A.",
    rating: 4,
    title: "Incroyable livraison rapide",
    body: "Les paires sont vraiment lourdes merci c'est carré",
    product: "Saucony",
    verified: true,
    avatar: "",
    date: "il y a 3 semaines",
  },
  {
    id: "5",
    name: "Lisa P.",
    rating: 5,
    title: "Service client incroyable",
    body: "J'avais une question sur la taille et l'équipe d'assistance a été incroyablement serviable. J'ai reçu mes chaussures le lendemain ! Taille parfaite.",
    product: "Asics Gel-Nimbus 25",
    verified: true,
    avatar: "",
    date: "il y a 1 mois",
  },
  {
    id: "6",
    name: "David C.",
    rating: 5,
    title: "Prêt pour le marathon !",
    body: "Je viens de terminer mon premier marathon avec les Saucony Endorphin Speed. La plaque de carbone a fait une énorme différence dans les derniers kilomètres.",
    product: "Saucony Endorphin Speed",
    verified: true,
    avatar: "",
    date: "il y a 1 mois",
  },
];

export function ReviewsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
            Avis Clients
          </p>
          <h2 className="font-display font-black text-display-md text-gray-900 mb-4">
            Approuvé par les Coureurs
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-600 font-semibold">4.9 sur plus de 50 000 avis</span>
          </div>
        </div>

        {/* Review grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover
                         transition-shadow duration-300 relative"
            >
              <Quote
                size={24}
                className="absolute top-5 right-5 text-brand-100 fill-brand-100"
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <h4 className="font-bold text-gray-900 text-sm mb-2">{review.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.body}</p>

              {/* Product */}
              <p className="text-xs text-brand-500 font-semibold mt-3">
                Produit : {review.product}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center
                               text-xs font-bold text-brand-600">
                  {getInitials(review.name.split(" ")[0], review.name.split(" ")[1])}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-900">{review.name}</span>

                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
