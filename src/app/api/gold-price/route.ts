import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getGoldPriceEur } from "@/lib/gold-price";

/** GET — returns current gold price per gram in EUR */
export async function GET() {
  const result = await getGoldPriceEur();
  return NextResponse.json({
    pricePerGram: result.price,
    nisabValue: Math.round(85 * result.price * 100) / 100,
    source: result.source,
    currency: "EUR",
    grams: 85,
  });
}

/**
 * POST — admin manual update of gold price.
 * Protected by ADMIN_SECRET header.
 * Body: { pricePerGram: number }
 */
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;

  if (adminSecret) {
    const providedSecret = req.headers.get("x-admin-secret");
    if (providedSecret !== adminSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  } else {
    // If no ADMIN_SECRET set, require Clerk auth as fallback
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
  }

  const body = await req.json();
  const pricePerGram = parseFloat(body.pricePerGram);

  if (isNaN(pricePerGram) || pricePerGram <= 0 || pricePerGram > 100000) {
    return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const config = await prisma.goldPriceConfig.upsert({
      where: { id: "singleton" },
      update: { pricePerGram, source: "manual" },
      create: { id: "singleton", pricePerGram, source: "manual" },
    });
    return NextResponse.json({
      success: true,
      pricePerGram: config.pricePerGram,
      nisabValue: Math.round(85 * config.pricePerGram * 100) / 100,
      source: config.source,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur base de données";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
