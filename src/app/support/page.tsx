import type { Metadata } from "next";
import { SupportContent } from "@/components/support/SupportContent";

export const metadata: Metadata = {
  title: "Service Client — Stride Running",
  description: "Besoin d'aide avec votre commande Stride Running ? Contactez notre équipe par email, téléphone ou chat en direct.",
};

export default function SupportPage() {
  return <SupportContent />;
}
