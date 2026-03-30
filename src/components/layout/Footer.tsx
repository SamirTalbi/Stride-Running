import Link from "next/link";
import { Zap, Instagram, Twitter, Youtube, Facebook, Mail, Phone } from "lucide-react";

const footerLinks = {
  Boutique: [
    { label: "Chaussures Homme", href: "/men" },
    { label: "Chaussures Femme", href: "/women" },
    { label: "Trail Running", href: "/shoes" },
    { label: "Vêtements", href: "/apparel" },
    { label: "Accessoires", href: "/accessories" },
    { label: "Nouveautés", href: "/new-arrivals" },
    { label: "Meilleures ventes", href: "/best-sellers" },
    { label: "Soldes", href: "/sale" },
  ],
  Marques: [
    { label: "Toutes les marques", href: "/brands" },
    { label: "Nike", href: "/brands/nike" },
    { label: "Adidas", href: "/brands/adidas" },
    { label: "Brooks", href: "/brands/brooks" },
    { label: "HOKA", href: "/brands/hoka" },
    { label: "Asics", href: "/brands/asics" },
    { label: "New Balance", href: "/brands/new-balance" },
    { label: "Saucony", href: "/brands/saucony" },
  ],
  Aide: [
    { label: "Trouver ma chaussure", href: "/find-my-shoe" },
    { label: "Livraison & Retours", href: "/shipping-returns" },
    { label: "Suivi de commande", href: "/account" },
    { label: "FAQ", href: "/faq" },
    { label: "Nous contacter", href: "/support" },
  ],
  "À propos": [
    { label: "Notre histoire", href: "/about" },
    { label: "Blog Running", href: "/blog" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark-DEFAULT text-white">
      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="font-display font-black text-xl tracking-tight">STRIDE</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Équipement running premium pour chaque coureur. Du premier 5K jusqu&apos;à la ligne d&apos;arrivée du marathon.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-6">
              {[
                { icon: Mail,  text: "support@stride-running.com" },
                { icon: Phone, text: "+33 1 00 00 00 00" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-400">
                  <Icon size={14} className="text-brand-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Twitter,   href: "https://twitter.com",   label: "Twitter"   },
                { icon: Youtube,   href: "https://youtube.com",   label: "YouTube"   },
                { icon: Facebook,  href: "https://facebook.com",  label: "Facebook"  },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-dark-100 flex items-center justify-center
                             text-gray-400 hover:text-white hover:bg-brand-500 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-100">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Stride Running. Tous droits réservés.
            </p>

            {/* Payment icons */}
            <div className="flex items-center gap-2">
              {["Visa", "MC", "Amex", "PayPal", "Apple Pay", "Google Pay"].map((p) => (
                <div
                  key={p}
                  className="px-2.5 py-1.5 bg-dark-100 rounded-md text-[10px] font-semibold
                             text-gray-400 border border-dark-200"
                >
                  {p}
                </div>
              ))}
            </div>

            <Link href="/faq" className="text-sm text-gray-500 hover:text-white transition-colors">
              FAQ & Aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
