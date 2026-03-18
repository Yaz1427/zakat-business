export interface FiscalOptimization {
  zakatAmount: number;
  country: "FR" | "BE" | "MA" | "DZ";
  deductionRate: number;
  taxSaving: number;
  netCost: number;
  label: string;
  detail: string;
}

const FISCAL_CONFIGS: Record<
  FiscalOptimization["country"],
  { rate: number; label: string; detail: string }
> = {
  FR: {
    rate: 0.6,
    label: "France — Réduction IS/IR (60%)",
    detail:
      "En France, les dons à des organismes reconnus d'utilité publique ouvrent droit à une réduction d'impôt de 60% (IS) ou 66% (IR). Si votre Zakat est versée à un organisme agréé, elle peut être fiscalement optimisée.",
  },
  BE: {
    rate: 0.45,
    label: "Belgique — Déduction fiscale (45%)",
    detail:
      "En Belgique, les dons reconnus bénéficient d'une réduction d'impôt de 45% du montant versé, sous réserve d'attestation fiscale de l'organisme bénéficiaire.",
  },
  MA: {
    rate: 0.3,
    label: "Maroc — Déductibilité partielle (30%)",
    detail:
      "Au Maroc, certains dons à des associations reconnues d'utilité publique peuvent être déduits du résultat fiscal à hauteur de 2‰ du chiffre d'affaires.",
  },
  DZ: {
    rate: 0.25,
    label: "Algérie — Déductibilité IBS (25%)",
    detail:
      "En Algérie, les dons aux associations reconnues peuvent réduire la base taxable à l'IBS dans la limite des textes en vigueur.",
  },
};

export function computeFiscalOptimization(
  zakatAmount: number,
  country: FiscalOptimization["country"]
): FiscalOptimization {
  const config = FISCAL_CONFIGS[country];
  const taxSaving = Math.round(zakatAmount * config.rate * 100) / 100;
  const netCost = Math.round((zakatAmount - taxSaving) * 100) / 100;
  return {
    zakatAmount,
    country,
    deductionRate: config.rate,
    taxSaving,
    netCost,
    label: config.label,
    detail: config.detail,
  };
}

export const FISCAL_COUNTRIES = Object.entries(FISCAL_CONFIGS).map(([k, v]) => ({
  value: k as FiscalOptimization["country"],
  label: v.label,
}));
