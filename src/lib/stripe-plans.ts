/** Stripe plan configuration — no Stripe SDK import, safe to use in any page/component */

export type PlanId = "pro" | "cabinet";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string | undefined;
  mode: "subscription" | "payment";
  description: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRICE_PRO,
    mode: "subscription",
    description: "Pour un chef d'entreprise — une entreprise",
    features: [
      "Calculs illimités",
      "Certificats PDF numérotés",
      "Historique complet & archives à vie",
      "Garantie de conformité AAOIFI & Rapport d'audit détaillé",
      "Optimisation fiscale & export comptable CSV",
    ],
    badge: "Populaire",
    highlight: true,
  },
  {
    id: "cabinet",
    name: "Cabinet",
    price: 199,
    priceId: process.env.STRIPE_PRICE_CABINET,
    mode: "subscription",
    description: "Pour les experts-comptables — multi-entreprises",
    features: [
      "Toutes les fonctionnalités Pro",
      "Accès multi-entreprises illimité",
      "Rapports PDF co-brandés",
      "Support dédié & onboarding",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id)!;
}
