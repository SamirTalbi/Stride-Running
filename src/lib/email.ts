import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = "Stride Running <onboarding@resend.dev>";

// ─── PO au fournisseur ───────────────────────────────────────────────────────
export async function sendPurchaseOrderEmail({
  to,
  poNumber,
  date,
  items,
  notes,
  deliveries,
}: {
  to: string;
  poNumber: string;
  date: string;
  notes?: string;
  items: {
    imageUrl?: string;
    productName: string;
    sku?: string;
    size: string;
    color: string;
    colorHex?: string;
    quantity: number;
  }[];
  deliveries?: {
    orderNumber: string;
    address: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      zip: string;
      country: string;
      phone?: string;
    } | null;
  }[];
}) {
  const rows = items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px;">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" width="60" height="60" style="border-radius:8px;object-fit:cover;" />`
              : `<div style="width:60px;height:60px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">👟</div>`
          }
        </td>
        <td style="padding:12px 16px;">
          <strong style="color:#111827;font-size:14px;">${item.productName}</strong><br/>
          <span style="color:#6b7280;font-size:12px;">SKU : ${item.sku ?? "—"}</span>
        </td>
        <td style="padding:12px 16px;text-align:center;">
          <strong style="font-size:15px;color:#111827;">${item.size}</strong>
        </td>
        <td style="padding:12px 16px;text-align:center;">
          <span style="display:inline-flex;align-items:center;gap:6px;">
            <span style="width:14px;height:14px;border-radius:50%;background:${item.colorHex ?? "#ccc"};border:1px solid #e5e7eb;display:inline-block;"></span>
            ${item.color}
          </span>
        </td>
        <td style="padding:12px 16px;text-align:center;">
          <strong style="font-size:18px;color:#f97316;">${item.quantity}</strong>
        </td>
        <td style="padding:12px 16px;text-align:center;">
          <div style="width:20px;height:20px;border:2px solid #d1d5db;border-radius:4px;"></div>
        </td>
      </tr>
    `
    )
    .join("");

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:700px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#111827;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="color:#f97316;font-size:22px;font-weight:900;letter-spacing:1px;">⚡ STRIDE</div>
        <div style="color:#9ca3af;font-size:12px;margin-top:2px;">Bon de Commande Fournisseur</div>
      </div>
      <div style="text-align:right;">
        <div style="color:#fff;font-size:18px;font-weight:800;">${poNumber}</div>
        <div style="color:#9ca3af;font-size:12px;">${date}</div>
      </div>
    </div>

    <!-- Infos -->
    <div style="padding:24px 32px;background:#fafafa;border-bottom:1px solid #f1f5f9;">
      <table style="width:100%;">
        <tr>
          <td style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total articles</td>
          <td style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Références</td>
          <td style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">À livrer avant</td>
        </tr>
        <tr>
          <td style="color:#111827;font-size:20px;font-weight:800;padding-top:4px;">${totalUnits} unités</td>
          <td style="color:#111827;font-size:20px;font-weight:800;padding-top:4px;">${items.length} références</td>
          <td style="color:#f97316;font-size:14px;font-weight:700;padding-top:4px;">Dès que possible</td>
        </tr>
      </table>
    </div>

    <!-- Table -->
    <div style="padding:24px 32px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Photo</th>
            <th style="text-align:left;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Produit / SKU</th>
            <th style="text-align:center;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Taille</th>
            <th style="text-align:center;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Couleur</th>
            <th style="text-align:center;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Qté</th>
            <th style="text-align:center;padding:10px 16px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">✓</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    ${
      notes
        ? `<div style="margin:0 32px 24px;padding:16px;background:#fff7ed;border-radius:12px;border-left:4px solid #f97316;">
             <strong style="color:#c2410c;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Notes</strong>
             <p style="margin:4px 0 0;color:#7c3aed;font-size:14px;">${notes}</p>
           </div>`
        : ""
    }

    ${
      deliveries && deliveries.length > 0
        ? `<!-- Adresses de livraison -->
           <div style="margin:0 32px 24px;">
             <div style="font-size:13px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">
               📦 Livraison directe au client — ${deliveries.length} adresse${deliveries.length > 1 ? "s" : ""}
             </div>
             <table style="width:100%;border-collapse:collapse;">
               ${deliveries.map((d) => `
               <tr>
                 <td style="padding:10px 12px;vertical-align:top;width:30%;">
                   <span style="font-size:11px;font-weight:700;color:#f97316;background:#fff7ed;padding:3px 8px;border-radius:20px;font-family:monospace;">${d.orderNumber}</span>
                 </td>
                 <td style="padding:10px 12px;vertical-align:top;">
                   ${d.address
                     ? `<div style="font-size:13px;color:#111827;font-weight:600;">${d.address.firstName} ${d.address.lastName}</div>
                        <div style="font-size:12px;color:#6b7280;margin-top:2px;">${d.address.address1}${d.address.address2 ? ", " + d.address.address2 : ""}</div>
                        <div style="font-size:12px;color:#6b7280;">${d.address.zip} ${d.address.city} — ${d.address.country}</div>
                        ${d.address.phone ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">📞 ${d.address.phone}</div>` : ""}`
                     : `<span style="font-size:12px;color:#9ca3af;font-style:italic;">Adresse non disponible</span>`
                   }
                 </td>
               </tr>`).join("")}
             </table>
           </div>`
        : ""
    }

    <!-- Footer -->
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Merci de confirmer la réception de ce bon de commande.<br/>
        Ce document a été généré automatiquement par la plateforme Stride Running.
      </p>
    </div>
  </div>
</body>
</html>`;

  if (!resend) { console.warn("[Email] RESEND_API_KEY non configuré"); return; }
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[Stride] Bon de Commande ${poNumber} — ${totalUnits} unités`,
    html,
  });
}

// ─── Email de confirmation de commande ───────────────────────────────────────
export async function sendOrderConfirmationEmail({
  to,
  firstName,
  orderNumber,
  items,
  subtotal,
  shippingCost,
  total,
  shippingAddress,
}: {
  to: string;
  firstName: string;
  orderNumber: string;
  items: { name: string; size: string; color: string; imageUrl?: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
    country: string;
  };
}) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  const itemRows = items.map((item) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 16px;">
        ${item.imageUrl
          ? `<img src="${item.imageUrl}" width="52" height="52" style="border-radius:8px;object-fit:cover;" />`
          : `<div style="width:52px;height:52px;background:#f1f5f9;border-radius:8px;"></div>`}
      </td>
      <td style="padding:10px 16px;">
        <div style="font-weight:600;color:#111827;font-size:13px;">${item.name}</div>
        <div style="color:#6b7280;font-size:12px;margin-top:2px;">Taille ${item.size} · ${item.color} · Qté ${item.quantity}</div>
      </td>
      <td style="padding:10px 16px;text-align:right;font-weight:700;color:#111827;font-size:13px;">
        ${fmt(item.price * item.quantity)}
      </td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="color:#f97316;font-size:22px;font-weight:900;letter-spacing:1px;">⚡ STRIDE</div>
      <div style="text-align:right;">
        <div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Commande</div>
        <div style="color:#fff;font-size:15px;font-weight:800;font-family:monospace;">${orderNumber}</div>
      </div>
    </div>

    <div style="padding:32px;">
      <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 8px;">Merci pour votre commande ! 🎉</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
        Bonjour ${firstName}, nous avons bien reçu votre commande et elle est en cours de traitement.
        Vous recevrez un email avec le numéro de suivi dès l'expédition.
      </p>

      <!-- Délai livraison -->
      <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">🚚</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:#9a3412;">Livraison internationale estimée</div>
          <div style="font-size:15px;font-weight:800;color:#111827;margin-top:2px;">15 – 25 jours ouvrés</div>
          <div style="font-size:11px;color:#c2410c;margin-top:2px;">Expédié depuis notre entrepôt · Livré par Colissimo</div>
        </div>
      </div>

      <!-- Articles -->
      <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Vos articles</h2>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totaux -->
      <table style="width:100%;font-size:13px;color:#374151;margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;">Sous-total</td>
          <td style="text-align:right;padding:4px 0;">${fmt(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b7280;">Livraison</td>
          <td style="text-align:right;padding:4px 0;color:${shippingCost === 0 ? "#16a34a" : "#374151"};">
            ${shippingCost === 0 ? "GRATUIT" : fmt(shippingCost)}
          </td>
        </tr>
        <tr style="border-top:2px solid #f1f5f9;">
          <td style="padding:8px 0 0;font-weight:800;font-size:15px;color:#111827;">Total</td>
          <td style="text-align:right;padding:8px 0 0;font-weight:800;font-size:15px;color:#111827;">${fmt(total)}</td>
        </tr>
      </table>

      <!-- Adresse -->
      <h2 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Adresse de livraison</h2>
      <div style="background:#f8fafc;border-radius:12px;padding:14px 16px;font-size:13px;color:#374151;line-height:1.6;">
        <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br/>
        ${shippingAddress.address1}${shippingAddress.address2 ? "<br/>" + shippingAddress.address2 : ""}<br/>
        ${shippingAddress.zip} ${shippingAddress.city}<br/>
        ${shippingAddress.country}
      </div>
    </div>

    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Des questions ? <a href="mailto:support@stride-running.com" style="color:#f97316;">support@stride-running.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  if (!resend) { console.warn("[Email] RESEND_API_KEY non configuré"); return; }
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Confirmation de commande ${orderNumber} — Stride Running`,
    html,
  });
}

// ─── Email d'expédition au client ────────────────────────────────────────────
export async function sendShippingEmail({
  to,
  firstName,
  orderNumber,
  carrierName,
  trackingNumber,
  trackingUrl,
  items,
}: {
  to: string;
  firstName: string;
  orderNumber: string;
  carrierName: string;
  trackingNumber: string;
  trackingUrl: string;
  items: { name: string; size: string; color: string; imageUrl?: string; quantity: number }[];
}) {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${item.imageUrl ? `<img src="${item.imageUrl}" width="48" height="48" style="border-radius:8px;object-fit:cover;" />` : ""}
            <div>
              <div style="font-weight:600;color:#111827;font-size:13px;">${item.name}</div>
              <div style="color:#6b7280;font-size:12px;">Taille ${item.size} · ${item.color} · Qté ${item.quantity}</div>
            </div>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:28px 32px;">
      <div style="color:#f97316;font-size:22px;font-weight:900;">⚡ STRIDE</div>
    </div>

    <div style="padding:32px;">
      <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 8px;">Votre commande est en route ! 🚀</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Bonjour ${firstName}, votre commande <strong>${orderNumber}</strong> a été expédiée.</p>

      <!-- Tracking box -->
      <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="color:#9a3412;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Numéro de suivi · ${carrierName}</div>
        <div style="color:#111827;font-size:20px;font-weight:800;letter-spacing:1px;margin-bottom:12px;">${trackingNumber}</div>
        <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:14px;">
          Suivre mon colis →
        </a>
      </div>

      <!-- Articles -->
      <h2 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px;">Articles expédiés</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Des questions ? Contactez-nous sur <a href="mailto:support@stride-running.com" style="color:#f97316;">support@stride-running.com</a></p>
    </div>
  </div>
</body>
</html>`;

  if (!resend) { console.warn("[Email] RESEND_API_KEY non configuré"); return; }
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Votre commande ${orderNumber} a été expédiée — ${carrierName} ${trackingNumber}`,
    html,
  });
}
