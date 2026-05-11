import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestSellers } from "@/components/home/BestSellers";
import { ShopByGender } from "@/components/home/ShopByGender";
import { ShoeFinder } from "@/components/home/ShoeFinder";
import { PromoSection } from "@/components/home/PromoSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BrandsStrip } from "@/components/home/BrandsStrip";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Stride Running | #1 Boutique de Chaussures & Équipement de Running En Ligne",
  description:
    "Plus de 1000 modèles de Nike, Brooks, HOKA, Asics & plus. Livraison gratuite 75€+, conseils d'experts, retours sous 30 jours. Trouvez votre chaussure idéale aujourd'hui.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <FeaturedCategories />
      <BestSellers />
      <ShopByGender />
      <PromoSection />
      <ShoeFinder />
      <BrandsStrip />
      <ReviewsSection />
      <Newsletter />
    </>
  );
}
