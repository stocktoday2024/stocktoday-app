import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, language = "EN", frequency = "daily" } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit newsletter subscription requests
    const rateCheck = checkRateLimit(`newsletter:${normalizedEmail}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many subscription requests. Please try again later." }, { status: 429 });
    }

    // Upsert into Subscriber table
    const subscriber = await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: { language, frequency },
      create: {
        email: normalizedEmail,
        language,
        frequency,
      },
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
