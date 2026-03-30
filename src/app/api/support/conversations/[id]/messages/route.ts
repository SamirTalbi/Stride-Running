import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata?.role;
  return role === "admin";
}

// Récupérer tous les messages d'une conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[Messages GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Envoyer un message (admin ou client)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, senderType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    // Seul l'admin peut envoyer en tant qu'ADMIN
    if (senderType === "ADMIN" && !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        content,
        senderType: senderType ?? "CLIENT",
      },
    });

    // Mettre à jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[Messages POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
