export const NISAB_GOLD_GRAMS = 85;
export const GOLD_PRICE_EUR_PER_GRAM = 77.5;

/**
 * Taux AAOIFI Standard 35 :
 *  - Calendrier lunaire (354 j) → 2,5%
 *  - Calendrier solaire/grégorien (365 j) → 2,5775%
 */
export const ZAKAT_RATE_LUNAR = 0.025;
export const ZAKAT_RATE_SOLAR = 0.025775;

/** @deprecated Use ZAKAT_RATE_SOLAR / ZAKAT_RATE_LUNAR explicitly */
export const ZAKAT_RATE = ZAKAT_RATE_SOLAR;

/** Rounds to exactly 2 decimal places — prevents floating point drift */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function getNisabValue(goldPriceEur = GOLD_PRICE_EUR_PER_GRAM): number {
  return round2(NISAB_GOLD_GRAMS * goldPriceEur);
}

export interface ZakatLogicInput {
  cash: number | string;
  stocks: number | string;
  receivables: number | string;
  debts: number | string;
  goldPriceEur?: number;
  /** true = calendrier lunaire (2,5%) | false/omitted = calendrier solaire grégorien (2,5775%) */
  isLunarCalendar?: boolean;
}

export interface ZakatLogicResult {
  totalAssets: number;
  zakatableBase: number;
  nisabValue: number;
  meetsNisab: boolean;
  finalZakat: number;
  zakatRate: number;
  isLunarCalendar: boolean;
  message: string;
}

/**
 * Calcule la Zakat selon la méthode du Capital Circulant Net (AAOIFI Standard 35)
 *
 * Assiette = (Liquidités + Stocks [valeur revente] + Créances sûres) − Dettes CT exigibles
 * Si Assiette ≥ Nisab (85g or) → Zakat = Assiette × taux
 * Sinon → Zakat = 0, message "Nisab non atteint"
 *
 * IMPORTANT: force Number() on all inputs to guard against HTML input string values.
 */
export function calculateZakatLogic(input: ZakatLogicInput): ZakatLogicResult {
  const cash        = Number(input.cash)        || 0;
  const stocks      = Number(input.stocks)      || 0;
  const receivables = Number(input.receivables) || 0;
  const debts       = Number(input.debts)       || 0;
  const { goldPriceEur, isLunarCalendar = false } = input;

  const zakatRate = isLunarCalendar ? ZAKAT_RATE_LUNAR : ZAKAT_RATE_SOLAR;

  const totalAssets    = round2(cash + stocks + receivables);
  const zakatableBase  = round2(Math.max(0, totalAssets - debts));
  const nisabValue     = getNisabValue(goldPriceEur);
  const meetsNisab     = zakatableBase >= nisabValue;
  const finalZakat     = meetsNisab ? round2(zakatableBase * zakatRate) : 0;

  return {
    totalAssets,
    zakatableBase,
    nisabValue,
    meetsNisab,
    finalZakat,
    zakatRate,
    isLunarCalendar,
    message: meetsNisab ? "Zakat due" : "Nisab non atteint",
  };
}
