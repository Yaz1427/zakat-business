import Stripe from "stripe";
export type { PlanId, Plan } from "@/lib/stripe-plans";
export { PLANS, getPlan } from "@/lib/stripe-plans";

let _stripe: Stripe | null = null;

/** Lazy getter — only instantiates when first called (inside API routes, never at import time) */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

/** Backward-compat alias — resolves lazily, safe to import at module level */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as never as Record<string | symbol, unknown>)[prop];
  },
});
