import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId) break;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : undefined;

        await prisma.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: planId,
            status: "active",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: subscriptionId,
            archiveAccess: true,
          },
          update: {
            plan: planId,
            status: "active",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: subscriptionId,
            archiveAccess: true,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.userSubscription.updateMany({
          where: { userId },
          data: {
            status: sub.status === "active" ? "active" : "inactive",
            currentPeriodEnd: new Date(((sub as unknown) as { current_period_end: number }).current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.userSubscription.updateMany({
          where: { userId },
          data: {
            status: "canceled",
            plan: "free",
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
