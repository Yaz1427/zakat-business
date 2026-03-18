import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dev/make-pro?secret=ADMIN_SECRET&plan=pro
 *
 * Dev-only endpoint — sets the current authenticated user to Pro (or Cabinet).
 * Disabled in production to avoid accidental exposure.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié — connecte-toi d'abord" }, { status: 401 });
  }

  const planParam = req.nextUrl.searchParams.get("plan") ?? "pro";
  const isFree = planParam === "free";

  const { prisma } = await import("@/lib/db");

  const subscription = await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: isFree ? "free" : planParam,
      status: isFree ? "inactive" : "active",
      archiveAccess: !isFree,
    },
    update: {
      plan: isFree ? "free" : planParam,
      status: isFree ? "inactive" : "active",
      archiveAccess: !isFree,
    },
  });

  return NextResponse.json({
    success: true,
    message: `✅ Utilisateur ${userId} passé en ${planParam.toUpperCase()}`,
    subscription,
  });
}
