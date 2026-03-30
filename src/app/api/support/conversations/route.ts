import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

// Client : créer une nouvelle conversation avec un premier message
export async function POST(req: NextRequest) {
  try {
    const { clientName, clientEmail, subject, content } = await req.json();

    if (!clientName || !clientEmail || !content) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const conversation = await prisma.conversation.create({
      data: {
        clientName,
        clientEmail,
        subject: subject || "Demande de support",
        messages: {
          create: {
            content,
            senderType: "CLIENT",
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("[Support POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Admin : lister toutes les conversations
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[Support GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
