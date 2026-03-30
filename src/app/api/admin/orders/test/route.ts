/**
 * POST /api/admin/orders/test
 *
 * Génère des commandes de test structurellement identiques aux vraies commandes Stripe.
 * Quand Stripe sera branché, seul le champ stripePaymentId changera (test_pi_xxx → pi_xxx réel).
 *
 * La seule différence avec une vraie commande :
 *   - stripePaymentId commence par "test_pi_"
 *   - notes contient "[COMMANDE TEST]"
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

// Faux clients français réalistes
const FAKE_CUSTOMERS = [
  { firstName: "Lucas",   lastName: "Martin",   email: "lucas.martin@gmail.com",   phone: "+33 6 12 34 56 78" },
  { firstName: "Emma",    lastName: "Bernard",  email: "emma.bernard@hotmail.fr",  phone: "+33 6 23 45 67 89" },
  { firstName: "Hugo",    lastName: "Dubois",   email: "hugo.dubois@outlook.com",  phone: "+33 6 34 56 78 90" },
  { firstName: "Chloé",   lastName: "Thomas",   email: "chloe.thomas@gmail.com",   phone: "+33 6 45 67 89 01" },
  { firstName: "Nathan",  lastName: "Petit",    email: "nathan.petit@yahoo.fr",    phone: "+33 6 56 78 90 12" },
  { firstName: "Léa",     lastName: "Robert",   email: "lea.robert@gmail.com",     phone: "+33 6 67 89 01 23" },
  { firstName: "Tom",     lastName: "Richard",  email: "tom.richard@sfr.fr",       phone: "+33 6 78 90 12 34" },
  { firstName: "Inès",    lastName: "Moreau",   email: "ines.moreau@gmail.com",    phone: "+33 6 89 01 23 45" },
  { firstName: "Mathieu", lastName: "Laurent",  email: "mathieu.laurent@live.fr",  phone: "+33 6 90 12 34 56" },
  { firstName: "Camille", lastName: "Simon",    email: "camille.simon@gmail.com",  phone: "+33 6 01 23 45 67" },
];

// Adresses françaises réalistes
const FAKE_ADDRESSES = [
  { address1: "12 Rue de la Paix",       city: "Paris",      state: "Île-de-France",  zip: "75001", country: "FR" },
  { address1: "45 Avenue Jean Jaurès",   city: "Lyon",       state: "Auvergne-Rhône-Alpes", zip: "69007", country: "FR" },
  { address1: "8 Boulevard du Port",     city: "Bordeaux",   state: "Nouvelle-Aquitaine", zip: "33000", country: "FR" },
  { address1: "23 Rue Victor Hugo",      city: "Marseille",  state: "Provence-Alpes-Côte d'Azur", zip: "13001", country: "FR" },
  { address1: "67 Chemin des Roses",     city: "Toulouse",   state: "Occitanie",      zip: "31000", country: "FR" },
  { address1: "3 Place du Général de Gaulle", city: "Lille", state: "Hauts-de-France", zip: "59000", country: "FR" },
  { address1: "19 Rue du Commerce",      city: "Nantes",     state: "Pays de la Loire", zip: "44000", country: "FR" },
  { address1: "56 Avenue de la Gare",    city: "Strasbourg", state: "Grand Est",      zip: "67000", country: "FR" },
  { address1: "11 Rue des Fleurs",       city: "Nice",       state: "Provence-Alpes-Côte d'Azur", zip: "06000", country: "FR" },
  { address1: "34 Boulevard Gambetta",   city: "Montpellier", state: "Occitanie",     zip: "34000", country: "FR" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fakeStripeId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "test_pi_";
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const count: number = Math.min(body.count ?? 1, 30); // max 30 à la fois
  const specificVariantIds: string[] | undefined = body.variantIds;
  const itemsPerOrder: number = body.itemsPerOrder ?? 2; // nb de lignes par commande

  // Récupérer les variants actifs avec stock
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(specificVariantIds?.length ? { id: { in: specificVariantIds } } : {}),
    },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    take: 100,
  });

  if (!variants.length) {
    return NextResponse.json(
      { error: "Aucun produit disponible. Crée d'abord des produits avec du stock." },
      { status: 400 }
    );
  }

  const createdOrders = [];

  for (let i = 0; i < count; i++) {
    const customer = pick(FAKE_CUSTOMERS);
    const address  = pick(FAKE_ADDRESSES);

    // Choisir itemsPerOrder variants distincts aléatoirement
    const shuffled = [...variants].sort(() => Math.random() - 0.5);
    const selectedVariants = shuffled.slice(0, Math.min(itemsPerOrder, shuffled.length));

    // Calculer les montants — structure identique à une vraie commande Stripe
    const subtotal = selectedVariants.reduce((s, v) => s + v.price * 1, 0);
    const shipping  = subtotal >= 75 ? 0 : 9.99;
    const tax       = (subtotal) * 0.20; // TVA 20% France
    const total     = subtotal + shipping + tax;

    // Créer l'adresse (même pattern que les vraies commandes anonymes)
    const shippingAddress = await prisma.address.create({
      data: {
        address1:  address.address1,
        city:      address.city,
        state:     address.state,
        zip:       address.zip,
        country:   address.country,
        firstName: customer.firstName,
        lastName:  customer.lastName,
        phone:     customer.phone,
        isDefault: false,
        userId:    undefined,
      } as Parameters<typeof prisma.address.create>[0]["data"],
    });

    // Créer la commande — structure IDENTIQUE à une vraie commande Stripe
    const order = await prisma.order.create({
      data: {
        orderNumber:      generateOrderNumber(),
        email:            customer.email,
        status:           "CONFIRMED",
        paymentStatus:    "PAID",
        paymentMethod:    "card",
        // ⚠️ Ce préfixe "test_pi_" est la seule différence avec Stripe réel
        // Quand Stripe sera branché : ce champ contiendra un vrai "pi_xxx..."
        stripePaymentId:  fakeStripeId(),
        subtotal,
        discount:         0,
        shipping,
        tax,
        total,
        shippingAddressId: shippingAddress.id,
        notes:            "[COMMANDE TEST]",
        items: {
          create: selectedVariants.map((v) => ({
            productId: v.productId,
            variantId: v.id,
            name:      v.product.name,
            size:      v.size,
            color:     v.color,
            imageUrl:  v.product.images[0]?.url ?? null,
            price:     v.price,
            quantity:  1,
            total:     v.price,
          })),
        },
      },
      include: {
        items:           true,
        shippingAddress: true,
      },
    });

    createdOrders.push(order);
  }

  return NextResponse.json({
    success: true,
    created: createdOrders.length,
    orders: createdOrders.map((o) => ({
      id:          o.id,
      orderNumber: o.orderNumber,
      email:       o.email,
      total:       o.total,
      itemCount:   o.items.length,
    })),
  });
}

// Lister les variants disponibles pour le sélecteur de l'UI
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const variants = await prisma.productVariant.findMany({
    where:   { isActive: true, stock: { gt: 0 } },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { product: { name: "asc" } },
    take:    200,
  });

  return NextResponse.json({ data: variants });
}
