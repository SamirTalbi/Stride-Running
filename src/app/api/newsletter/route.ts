import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source } = schema.parse(body);

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, source, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
