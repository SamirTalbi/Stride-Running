import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Applique ou retire une promotion sur un produit (toutes ses variantes).
 * Body: { percent: number }  — 0 (ou absent) = retirer la promo.
 *
 * Mécanique (idempotente) :
 *  - base = comparePrice ?? price  (prix d'origine, jamais perdu)
 *  - promo: comparePrice = base ; price = base * (1 - percent/100)
 *  - retrait: price = base ; comparePrice = null
 * Le prix réellement facturé reste `price` (déjà utilisé par panier/checkout),
 * `comparePrice` ne sert qu'à afficher l'ancien prix barré.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const percent = Math.round(Number(body.percent) || 0);

  if (percent < 0 || percent > 95) {
    return NextResponse.json({ error: "Le pourcentage doit être entre 0 et 95." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const round2 = (n: number) => Math.round(n * 100) / 100;

  await prisma.$transaction(
    product.variants.map((v) => {
      const base = v.comparePrice ?? v.price; // prix d'origine
      const data =
        percent > 0
          ? { comparePrice: base, price: round2(base * (1 - percent / 100)) }
          : { comparePrice: null, price: base };
      return prisma.productVariant.update({ where: { id: v.id }, data });
    })
  );

  return NextResponse.json({ success: true, percent, variants: product.variants.length });
}
