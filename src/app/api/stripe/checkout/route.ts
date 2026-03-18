import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlan, type PlanId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { planId } = await req.json() as { planId: PlanId };
  const plan = getPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const lineItem = plan.priceId
      ? { price: plan.priceId, quantity: 1 }
      : {
          price_data: {
            currency: "eur",
            unit_amount: plan.price * 100,
            recurring: plan.mode === "subscription" ? { interval: "year" as const } : undefined,
            product_data: {
              name: `ZakatBiz ${plan.name}`,
              description: plan.description,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: plan.mode === "subscription" ? "subscription" : "payment",
      locale: "fr",
      line_items: [lineItem],
      allow_promotion_codes: true,
      metadata: { userId, planId },
      subscription_data: plan.mode === "subscription" ? { metadata: { userId, planId } } : undefined,
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${baseUrl}/pricing?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
