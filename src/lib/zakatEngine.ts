export const ZAKAT_RATE = 0.025; // 2.5% - taux standard
export const NISAB_GOLD_GRAMS = 85; // Nisab en grammes d'or (AAOIFI)
export const NISAB_SILVER_GRAMS = 595; // Nisab en grammes d'argent

export interface ZakatInputs {
  // Actifs circulants
  cash: number;                    // Trésorerie et équivalents
  accountsReceivable: number;      // Créances clients nettes (douteuses exclues)
  inventory: number;               // Stocks (valorisés au prix de vente actuel)
  shortTermInvestments: number;    // Placements financiers court terme

  // Passifs circulants
  accountsPayable: number;         // Dettes fournisseurs (court terme)
  shortTermLoans: number;          // Emprunts à court terme
  salariesPayable: number;         // Salaires dus
  taxesPayable: number;            // Taxes et impôts dus

  // Méta
  companyName: string;
  fiscalYear: string;
  goldPricePerGram: number;        // Prix de l'or au gramme (EUR) pour calcul du Nisab
  madhhab: "hanafi" | "maliki" | "shafii" | "hanbali";
}

export interface ZakatResult {
  // Assiette de calcul
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
  netWorkingCapital: number;

  // Nisab
  nisabValue: number;
  meetsNisab: boolean;

  // Zakat due
  zakatAmount: number;
  zakatRate: number;

  // Répartition pour graphique
  breakdown: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    shortTermInvestments: number;
  };
  liabilitiesBreakdown: {
    accountsPayable: number;
    shortTermLoans: number;
    salariesPayable: number;
    taxesPayable: number;
  };

  // Infos
  companyName: string;
  fiscalYear: string;
  calculationDate: string;
  madhhab: string;
}

/**
 * Calcule la Zakat d'entreprise selon la méthode du Capital Circulant Net
 * Référence: Normes AAOIFI (Accounting and Auditing Organisation for Islamic Financial Institutions)
 *
 * Formule: (Actifs Circulants - Passifs Circulants) × 2,5%
 * La Zakat n'est due que si l'assiette dépasse le Nisab (équivalent de 85g d'or)
 */
export function calculateZakat(inputs: ZakatInputs): ZakatResult {
  // --- Calcul des actifs circulants ---
  const totalCurrentAssets =
    inputs.cash +
    inputs.accountsReceivable +
    inputs.inventory +
    inputs.shortTermInvestments;

  // --- Calcul des passifs circulants ---
  const totalCurrentLiabilities =
    inputs.accountsPayable +
    inputs.shortTermLoans +
    inputs.salariesPayable +
    inputs.taxesPayable;

  // --- Capital Circulant Net (assiette Zakat) ---
  const netWorkingCapital = Math.max(0, totalCurrentAssets - totalCurrentLiabilities);

  // --- Calcul du Nisab ---
  // Le Nisab est calculé sur la base de 85 grammes d'or (standard AAOIFI / Hanafi)
  // Pour l'école Malikite, on peut utiliser 595g d'argent si plus avantageux
  const nisabGold = NISAB_GOLD_GRAMS * inputs.goldPricePerGram;
  const nisabValue = nisabGold;
  const meetsNisab = netWorkingCapital >= nisabValue;

  // --- Montant Zakat ---
  const zakatAmount = meetsNisab ? netWorkingCapital * ZAKAT_RATE : 0;

  return {
    totalCurrentAssets,
    totalCurrentLiabilities,
    netWorkingCapital,
    nisabValue,
    meetsNisab,
    zakatAmount,
    zakatRate: ZAKAT_RATE,
    breakdown: {
      cash: inputs.cash,
      accountsReceivable: inputs.accountsReceivable,
      inventory: inputs.inventory,
      shortTermInvestments: inputs.shortTermInvestments,
    },
    liabilitiesBreakdown: {
      accountsPayable: inputs.accountsPayable,
      shortTermLoans: inputs.shortTermLoans,
      salariesPayable: inputs.salariesPayable,
      taxesPayable: inputs.taxesPayable,
    },
    companyName: inputs.companyName,
    fiscalYear: inputs.fiscalYear,
    calculationDate: new Date().toLocaleDateString("fr-FR"),
    madhhab: inputs.madhhab,
  };
}

export const MADHHAB_LABELS: Record<ZakatInputs["madhhab"], string> = {
  hanafi: "Hanafi (Asie centrale, Turquie, Pakistan)",
  maliki: "Malikite (Maghreb, Afrique de l'Ouest)",
  shafii: "Chaféite (Asie du Sud-Est, Égypte)",
  hanbali: "Hanbalite (Arabie Saoudite, Golfe)",
};

export const GOLD_PRICES_DEFAULT: Record<string, number> = {
  EUR: 77.5,
  DZD: 9200,
  USD: 85.0,
};
