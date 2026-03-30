import { Star, Quote } from "lucide-react";
import { getInitials } from "@/lib/utils";

const reviews = [
  {
    id: "1",
    name: "Sarah M.",
    rating: 5,
    title: "Best running shoes I've ever owned",
    body: "I've been running for 10 years and these are without a doubt the most comfortable shoes I've ever worn. The cushioning is perfect for long runs.",
    product: "Brooks Ghost 15",
    verified: true,
    avatar: "",
    date: "2 days ago",
  },
  {
    id: "2",
    name: "James K.",
    rating: 5,
    title: "Arrived in 2 days, great quality",
    body: "Fast shipping, excellent packaging, and the shoes are exactly as described. Will definitely be ordering from Stride again!",
    product: "Nike Air Zoom Pegasus 40",
    verified: true,
    avatar: "",
    date: "1 week ago",
  },
  {
    id: "3",
    name: "Emma R.",
    rating: 5,
    title: "Perfect for trail running",
    body: "The grip on these is incredible. I ran through muddy trails last weekend and they handled everything perfectly. Highly recommend!",
    product: "Salomon Speedcross 6",
    verified: true,
    avatar: "",
    date: "2 weeks ago",
  },
  {
    id: "4",
    name: "Marcus T.",
    rating: 4,
    title: "Great shoes, fast delivery",
    body: "Love the HOKA Clifton 9s. So much cushioning without feeling heavy. The only reason it's 4 stars is because my usual size runs slightly small.",
    product: "HOKA Clifton 9",
    verified: true,
    avatar: "",
    date: "3 weeks ago",
  },
  {
    id: "5",
    name: "Lisa P.",
    rating: 5,
    title: "Customer service was amazing",
    body: "Had a question about sizing and the support team was incredibly helpful. Got my shoes the next day! Perfect fit.",
    product: "Asics Gel-Nimbus 25",
    verified: true,
    avatar: "",
    date: "1 month ago",
  },
  {
    id: "6",
    name: "David C.",
    rating: 5,
    title: "Marathon ready!",
    body: "Just finished my first marathon wearing the Saucony Endorphin Speed. The carbon plate made a huge difference in the final miles.",
    product: "Saucony Endorphin Speed",
    verified: true,
    avatar: "",
    date: "1 month ago",
  },
];

export function ReviewsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
            Customer Reviews
          </p>
          <h2 className="font-display font-black text-display-md text-gray-900 mb-4">
            Loved by Runners
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-600 font-semibold">4.9 from 50,000+ reviews</span>
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
                Reviewed: {review.product}
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
                    {review.verified && (
                      <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-md font-medium">
                        Verified
                      </span>
                    )}
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
