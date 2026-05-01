import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import nodemailer from "nodemailer";


export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { host, port, user, password, fromName, fromEmail, secure } = await req.json();

  if (!host || !user || !password) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: secure ?? false,
      auth: { user, pass: password },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: user,
      subject: "Test SMTP — Stride Running",
      text: "La configuration SMTP fonctionne correctement.",
      html: "<p>La configuration SMTP fonctionne correctement.</p>",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Connexion SMTP échouée" }, { status: 500 });
  }
}
