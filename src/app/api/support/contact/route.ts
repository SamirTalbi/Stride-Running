import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, orderNumber, message } = await req.json();

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM ?? user;
    const toEmail = process.env.SMTP_TO ?? user;

    if (!host || !user || !pass) {
      // SMTP non configuré — on accepte quand même (log côté serveur)
      console.warn("[Contact Form] SMTP non configuré, email non envoyé:", { firstName, email, message });
      return NextResponse.json({ success: true });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Stride Running Support" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${firstName} ${lastName ?? ""} — ${orderNumber ? `Commande ${orderNumber}` : "Demande générale"}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${firstName} ${lastName ?? ""}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        ${orderNumber ? `<p><strong>Commande :</strong> ${orderNumber}</p>` : ""}
        <hr />
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    // Confirmation à l'expéditeur
    await transporter.sendMail({
      from: `"Stride Running" <${fromEmail}>`,
      to: email,
      subject: "Nous avons bien reçu votre message — Stride Running",
      html: `
        <p>Bonjour ${firstName},</p>
        <p>Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.</p>
        <p>Notre équipe est disponible du lundi au vendredi de 9h à 18h.</p>
        <br />
        <p>L'équipe Stride Running</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact Form]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
