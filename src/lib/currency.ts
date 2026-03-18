export type Currency = "EUR" | "DZD";

export interface CurrencyConfig {
  code: Currency;
  locale: string;
  symbol: string;
  nisabGrams: number;
  /** Fixed Nisab override in DZD (Ministry of Religious Affairs Algeria) */
  nisabFixed?: number;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    locale: "fr-FR",
    symbol: "€",
    nisabGrams: 85,
  },
  DZD: {
    code: "DZD",
    locale: "fr-DZ",
    symbol: "DA",
    nisabGrams: 85,
    /** Approximate Nisab in DZD based on Algerian gold market ~14 000 DA/g × 85g.
     *  Admin can update this manually via the gold price API (stored in DB). */
    nisabFixed: 1_190_000,
  },
};

export function formatAmount(value: number, currency: Currency): string {
  const cfg = CURRENCY_CONFIGS[currency];
  if (currency === "DZD") {
    return (
      new Intl.NumberFormat("fr-DZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " DA"
    );
  }
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
