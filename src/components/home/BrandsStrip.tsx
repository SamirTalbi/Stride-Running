import Link from "next/link";

const brands = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Brooks", slug: "brooks" },
  { name: "HOKA", slug: "hoka" },
  { name: "Asics", slug: "asics" },
  { name: "New Balance", slug: "new-balance" },
  { name: "Saucony", slug: "saucony" },
  { name: "Salomon", slug: "salomon" },
  { name: "On Running", slug: "on-running" },
  { name: "Mizuno", slug: "mizuno" },
];

export function BrandsStrip() {
  return (
    <section className="py-12 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Top Brands
        </p>
        <div className="flex items-center justify-center flex-wrap gap-4 md:gap-8">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500
                         hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50
                         transition-all duration-200"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
