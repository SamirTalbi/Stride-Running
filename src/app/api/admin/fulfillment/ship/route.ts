// POST — Ajouter tracking en masse + envoyer emails clients
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { buildTrackingUrl } from "@/lib/carriers";
import { sendShippingEmail } from "@/lib/email";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { shipments, notifyCustomers } = body as {
    shipments: {
      orderId: string;
      carrier: string;
      trackingNumber: string;
      customTrackingUrl?: string;
    }[];
    notifyCustomers: boolean;
  };

  if (!shipments?.length) return NextResponse.json({ error: "No shipments" }, { status: 400 });

  const results: { orderId: string; success: boolean; error?: string }[] = [];

  for (const shipment of shipments) {
    try {
      const trackingUrl = buildTrackingUrl(shipment.carrier, shipment.trackingNumber, shipment.customTrackingUrl);

      await prisma.order.update({
        where: { id: shipment.orderId },
        data: {
          status: "SHIPPED",
          carrier: shipment.carrier,
          trackingNumber: shipment.trackingNumber,
          trackingUrl,
          shippedAt: new Date(),
        },
      });

      if (notifyCustomers) {
        const order = await prisma.order.findUnique({
          where: { id: shipment.orderId },
          include: {
            items: true,
            user: { select: { firstName: true } },
          },
        });

        if (order) {
          const { getCarrier } = await import("@/lib/carriers");
          const carrierInfo = getCarrier(shipment.carrier);
          await sendShippingEmail({
            to: order.email,
            firstName: order.user?.firstName ?? order.email.split("@")[0],
            orderNumber: order.orderNumber,
            carrierName: carrierInfo?.name ?? shipment.carrier,
            trackingNumber: shipment.trackingNumber,
            trackingUrl,
            items: order.items.map((i) => ({
              name: i.name,
              size: i.size,
              color: i.color,
              imageUrl: i.imageUrl ?? undefined,
              quantity: i.quantity,
            })),
          });
        }
      }

      results.push({ orderId: shipment.orderId, success: true });
    } catch (err) {
      console.error("[Ship API]", err);
      results.push({ orderId: shipment.orderId, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
