import { GOLD_PRICE_EUR_PER_GRAM } from "@/lib/zakat-logic";

const TROY_OUNCE_GRAMS = 31.1035;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches live XAU/EUR price from Coinbase public API (no key required).
 * Returns EUR per gram, or null if the request fails.
 */
async function fetchLiveGoldPriceEur(): Promise<number | null> {
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/XAU-EUR/spot", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pricePerOunce = parseFloat(json?.data?.amount);
    if (isNaN(pricePerOunce)) return null;
    return Math.round((pricePerOunce / TROY_OUNCE_GRAMS) * 100) / 100;
  } catch {
    return null;
  }
}

/**
 * Returns the current gold price per gram in EUR.
 * Priority: DB-cached value (if < 24h old) → live Coinbase API → env var → hardcoded default
 */
export async function getGoldPriceEur(): Promise<{ price: number; source: string }> {
  try {
    const { prisma } = await import("@/lib/db");

    const config = await prisma.goldPriceConfig.findUnique({
      where: { id: "singleton" },
    });

    // If manually set, respect it permanently until changed
    if (config?.source === "manual") {
      return { price: config.pricePerGram, source: "manual" };
    }

    // If cached API value is fresh (< 24h), use it
    if (config?.source === "coinbase" && config.updatedAt) {
      const age = Date.now() - new Date(config.updatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        return { price: config.pricePerGram, source: "coinbase_cached" };
      }
    }

    // Try to fetch live price
    const live = await fetchLiveGoldPriceEur();
    if (live) {
      await prisma.goldPriceConfig.upsert({
        where: { id: "singleton" },
        update: { pricePerGram: live, source: "coinbase" },
        create: { id: "singleton", pricePerGram: live, source: "coinbase" },
      });
      return { price: live, source: "coinbase_live" };
    }
  } catch {
    // DB not configured — fall through to defaults
  }

  // Final fallback: env var or hardcoded default
  const envPrice = parseFloat(process.env.GOLD_PRICE_EUR_PER_GRAM ?? "");
  if (!isNaN(envPrice) && envPrice > 0) {
    return { price: envPrice, source: "env" };
  }

  return { price: GOLD_PRICE_EUR_PER_GRAM, source: "default" };
}
