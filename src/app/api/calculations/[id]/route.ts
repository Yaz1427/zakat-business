import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/calculations/[id] — fetch single calculation (userId-protected) */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { prisma } = await import("@/lib/db");
    let calculation;
    try {
      calculation = await prisma.zakatCalculation.findFirst({
        where: { id: params.id, userId },
      });
    } catch {
      // siren column not in DB yet — select explicitly
      calculation = await prisma.zakatCalculation.findFirst({
        where: { id: params.id, userId },
        select: {
          id: true, userId: true, companyName: true, year: true,
          cash: true, stocks: true, receivables: true,
          debts: true, supplierDebts: true, taxDebts: true, salaryDebts: true,
          nisabValue: true, finalZakat: true, createdAt: true, updatedAt: true,
        },
      });
    }
    if (!calculation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(calculation);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur base de données";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/calculations/[id] — delete (userId-protected, never leaks other users' data) */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { prisma } = await import("@/lib/db");
    const deleted = await prisma.zakatCalculation.deleteMany({
      where: { id: params.id, userId },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur base de données";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
