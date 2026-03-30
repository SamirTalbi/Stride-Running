import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ChatWidget } from "@/components/support/ChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Stride Running | Premium Running Shoes & Gear",
    template: "%s | Stride Running",
  },
  description:
    "Shop the best running shoes, apparel & accessories. Free shipping over $75. Expert advice, 30-day returns. Nike, Brooks, HOKA, Asics & more.",
  keywords: [
    "running shoes",
    "trail running",
    "running gear",
    "brooks running",
    "hoka shoes",
    "nike running",
    "marathon shoes",
    "running apparel",
  ],
  authors: [{ name: "Stride Running" }],
  creator: "Stride Running",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Stride Running",
    title: "Stride Running | Premium Running Shoes & Gear",
    description: "Shop the best running shoes for road, trail, and track.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Stride Running" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stride Running",
    description: "Premium running shoes & gear for every runner.",
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
    <html lang="en" suppressHydrationWarning>
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
              description: "Premium running shoes, apparel and accessories",
              url: process.env.NEXT_PUBLIC_APP_URL,
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              sameAs: [
                "https://instagram.com/stride_running",
                "https://twitter.com/stride_running",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-800-786-7433",
                contactType: "customer service",
                availableLanguage: "English",
              },
            }),
          }}
        />
      </head>
      <body>
        <ClerkProvider>
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
