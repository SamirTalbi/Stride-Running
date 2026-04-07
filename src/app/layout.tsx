import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ChatWidget } from "@/components/support/ChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Stride Running | Chaussures et Équipement de Running Premium",
    template: "%s | Stride Running",
  },
  description:
    "Achetez les meilleures chaussures de running, vêtements et accessoires. Livraison gratuite dès 75 €. Conseils d'experts, retours sous 30 jours. Nike, Brooks, HOKA, Asics & plus.",
  keywords: [
    "chaussures de running",
    "trail running",
    "équipement de running",
    "brooks running",
    "hoka chaussures",
    "nike running",
    "chaussures de marathon",
    "vêtements de course",
  ],
  authors: [{ name: "Stride Running" }],
  creator: "Stride Running",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Stride Running",
    title: "Stride Running | Chaussures et Équipement de Running Premium",
    description: "Les meilleures chaussures de running pour la route, le trail et la piste.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Stride Running" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stride Running",
    description: "Chaussures et équipement de running premium pour chaque coureur.",
    creator: "@stride_running",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Schema markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportingGoodsStore",
              name: "Stride Running",
              description: "Chaussures, vêtements et accessoires de running premium",
              url: process.env.NEXT_PUBLIC_APP_URL,
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              sameAs: [
                "https://instagram.com/stride_running",
                "https://twitter.com/stride_running",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+33-1-00-00-00-00",
                contactType: "service client",
                availableLanguage: "French",
              },
            }),
          }}
        />
      </head>
      <body>
        <ClerkProvider 
          localization={{
            ...frFR,
            signIn: {
              start: {
                subtitle: "pour continuer vers Stride Running",
                actionText: "Vous n'avez pas de compte ?",
                actionLink: "S'inscrire"
              }
            },
            signUp: {
              start: {
                subtitle: "pour continuer vers Stride Running",
                actionText: "Vous avez déjà un compte ?",
                actionLink: "Se connecter"
              }
            }
          }}
          appearance={{
            layout: {
              logoPlacement: "none",
              showOptionalFields: false,
              shimmer: true
            }
          }}
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <ChatWidget />
        </ClerkProvider>
      </body>
    </html>
  );
}
