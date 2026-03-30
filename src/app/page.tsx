import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestSellers } from "@/components/home/BestSellers";
import { ShoeFinder } from "@/components/home/ShoeFinder";
import { PromoSection } from "@/components/home/PromoSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BrandsStrip } from "@/components/home/BrandsStrip";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Stride Running | #1 Running Shoes & Gear Online Store",
  description:
    "Shop 1000+ running shoes from Nike, Brooks, HOKA, Asics & more. Free shipping $75+, expert advice, 30-day returns. Find your perfect running shoe today.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <FeaturedCategories />
      <BestSellers />
      <PromoSection />
      <ShoeFinder />
      <BrandsStrip />
      <ReviewsSection />
      <Newsletter />
    </>
  );
}
