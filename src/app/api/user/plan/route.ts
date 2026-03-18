import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const FREE_PLAN_LIMIT = 1;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ plan: "free", status: "inactive", calculationsThisYear: 0, freeLimit: FREE_PLAN_LIMIT });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const sub = await prisma.userSubscription.findUnique({ where: { userId } });

    if (sub && sub.status === "active") {
      return NextResponse.json({
        plan: sub.plan,
        status: "active",
        archiveAccess: sub.archiveAccess,
        calculationsThisYear: null,
        freeLimit: null,
      });
    }

    // Free user — count saves this year
    const currentYear = new Date().getFullYear();
    const calculationsThisYear = await prisma.zakatCalculation.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });

    return NextResponse.json({
      plan: "free",
      status: "inactive",
      archiveAccess: false,
      calculationsThisYear,
      freeLimit: FREE_PLAN_LIMIT,
    });
  } catch {
    // DB not reachable — degrade gracefully
  }

  return NextResponse.json({ plan: "free", status: "inactive", archiveAccess: false, calculationsThisYear: 0, freeLimit: FREE_PLAN_LIMIT });
}
