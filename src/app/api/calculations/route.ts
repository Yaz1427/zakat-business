import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const FREE_PLAN_LIMIT = 1; // calculs par an

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { prisma } = await import("@/lib/db");

    // ── Plan check: enforce free tier limit ──────────────────────
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    const isPro =
      subscription?.status === "active" &&
      (subscription.plan === "pro" || subscription.plan === "cabinet");

    // Extract SIREN once — used for anti-bypass check + storage
    const siren = typeof body.siren === "string" && /^\d{9}$/.test(body.siren)
      ? body.siren
      : null;

    if (!isPro) {
      const currentYear = new Date().getFullYear();

      // ── Check 1: per-account yearly limit ────────────────────
      const countThisYear = await prisma.zakatCalculation.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      });
      if (countThisYear >= FREE_PLAN_LIMIT) {
        return NextResponse.json(
          {
            error: "LIMIT_REACHED",
            message: `Le plan gratuit est limité à ${FREE_PLAN_LIMIT} calcul par an. Passez à Pro pour des calculs illimités.`,
          },
          { status: 403 }
        );
      }

      // ── Check 2: SIREN cross-account anti-bypass ─────────────
      // Wrapped in try/catch: column may not exist yet if db push hasn't run
      if (siren) {
        try {
          const sirenUsedByOther = await prisma.zakatCalculation.findFirst({
            where: {
              siren,
              NOT: { userId },
              createdAt: {
                gte: new Date(`${currentYear}-01-01`),
                lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
            select: { id: true },
          });
          if (sirenUsedByOther) {
            return NextResponse.json(
              {
                error: "SIREN_LIMIT_REACHED",
                message: `Ce SIREN a déjà été utilisé pour un calcul gratuit cette année. Passez à Pro pour des calculs illimités.`,
              },
              { status: 403 }
            );
          }
        } catch {
          // siren column not yet in DB — skip check until db push is run
        }
      }
    }
    // ──────────────────────────────────────────────────────────────

    const baseData = {
      userId,
      companyName: String(body.companyName ?? ""),
      year: Number(body.year) || new Date().getFullYear(),
      cash: Number(body.cash) || 0,
      stocks: Number(body.stocks) || 0,
      receivables: Number(body.receivables) || 0,
      debts: Number(body.debts) || 0,
      supplierDebts: Number(body.supplierDebts) || 0,
      taxDebts: Number(body.taxDebts) || 0,
      salaryDebts: Number(body.salaryDebts) || 0,
      nisabValue: Number(body.nisabValue) || 0,
      finalZakat: Number(body.finalZakat) || 0,
    };

    let calculation;
    try {
      calculation = await prisma.zakatCalculation.create({
        data: { ...baseData, ...(siren ? { siren } : {}) },
        select: { id: true },
      });
    } catch {
      // siren column not in DB yet (RETURNING also fails) — retry without siren
      calculation = await prisma.zakatCalculation.create({
        data: baseData,
        select: { id: true },
      });
    }

    return NextResponse.json({ success: true, id: calculation.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur base de données";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    let calculations;
    try {
      calculations = await prisma.zakatCalculation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } catch {
      // siren column not in DB yet — select all other fields explicitly
      calculations = await prisma.zakatCalculation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, userId: true, companyName: true, year: true,
          cash: true, stocks: true, receivables: true,
          debts: true, supplierDebts: true, taxDebts: true, salaryDebts: true,
          nisabValue: true, finalZakat: true, createdAt: true, updatedAt: true,
        },
      });
    }

    return NextResponse.json(calculations);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur base de données";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
