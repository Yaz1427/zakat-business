"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import { useUserPlan } from "@/hooks/useUserPlan";
import { exportCalculationCSV } from "@/lib/export-csv";
import {
  Calculator,
  Building2,
  CheckCircle2,
  Minus,
  Trash2,
  Eye,
  ArrowRight,
  TrendingUp,
  CalendarDays,
  FileDown,
  Clock,
  Lock,
  Download,
  Sparkles,
} from "lucide-react";
import type { CertificateData } from "@/components/pdf/ZakatCertificate";

const PDFDownloadButton = dynamic(
  () => import("@/components/pdf/PDFDownloadButton"),
  { ssr: false }
);

interface Calculation {
  id: string;
  companyName: string;
  year: number;
  cash: number;
  stocks: number;
  receivables: number;
  debts: number;
  supplierDebts: number;
  taxDebts: number;
  salaryDebts: number;
  nisabValue: number;
  finalZakat: number;
  createdAt: string;
}

function buildCertData(c: Calculation): CertificateData {
  const totalAssets = c.cash + c.stocks + c.receivables;
  const zakatableBase = Math.max(0, totalAssets - c.debts);
  const meetsNisab = zakatableBase >= c.nisabValue;
  const goldPriceEur = c.nisabValue > 0 ? Math.round((c.nisabValue / 85) * 100) / 100 : 77.5;
  return {
    companyName: c.companyName,
    year: c.year,
    cash: c.cash,
    stocks: c.stocks,
    receivables: c.receivables,
    supplierDebts: c.supplierDebts,
    taxDebts: c.taxDebts,
    salaryDebts: c.salaryDebts,
    totalAssets,
    totalDebts: c.debts,
    zakatableBase,
    nisabValue: c.nisabValue,
    meetsNisab,
    finalZakat: c.finalZakat,
    goldPriceEur,
    certNumber: `ZKT-${c.year}-${c.id.slice(-8).toUpperCase()}`,
    issuedAt: new Date(c.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

function SkeletonRow() {
  return (
    <Card className="bg-white dark:bg-card border-border/60">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const { isPro, loading: planLoading } = useUserPlan();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }
    fetch("/api/calculations")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setCalculations(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/calculations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Calcul « ${name} » supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalZakat = calculations.reduce((s, c) => s + c.finalZakat, 0);

  if (isLoaded && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F8F6] dark:bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-24 max-w-md text-center space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 mx-auto">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Connectez-vous</h1>
            <p className="text-muted-foreground text-sm">Accédez à l&apos;historique de vos calculs Zakat.</p>
          </div>
          <Button asChild className="gap-2 h-12 px-8">
            <Link href="/sign-in">Se connecter</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] dark:bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-3xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Historique des calculs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vos bilans Zakat sauvegardés, avec attestations téléchargeables.
            </p>
          </div>
          <Button asChild className="gap-2 h-10 self-start sm:self-auto">
            <Link href="/calculate">
              <Calculator className="h-4 w-4" />
              Nouveau calcul
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {!loading && calculations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { icon: FileDown, label: "Calculs sauvegardés", value: String(calculations.length), sub: "attestations disponibles" },
              { icon: TrendingUp, label: "Zakat cumulée", value: formatCurrency(totalZakat), sub: "tous exercices" },
              { icon: CalendarDays, label: "Dernier exercice", value: String(calculations[0].year), sub: formatCurrency(calculations[0].finalZakat) + " dus" },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-card rounded-xl border border-border/60 p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-lg font-bold leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-36 mb-4" />
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && calculations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
              <Calculator className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold mb-1">Aucun calcul sauvegardé</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Effectuez votre premier calcul et sauvegardez-le pour le retrouver ici.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/calculate">Calculer ma Zakat <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        {/* Upsell banner for free users */}
        {!loading && !planLoading && !isPro && calculations.length > 0 && (
          <div className="mb-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Débloquez vos certificats PDF & l&apos;optimisation fiscale</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plan Pro — 49 €/an · Déductible des frais professionnels
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-2 flex-shrink-0 shadow-sm shadow-primary/20">
              <Link href="/pricing">
                Passer à Pro
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* History list */}
        {!loading && calculations.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {calculations.length} bilan{calculations.length > 1 ? "s" : ""}
            </p>

            {calculations.map((c) => {
              const totalAssets = c.cash + c.stocks + c.receivables;
              const zakatableBase = Math.max(0, totalAssets - c.debts);
              const meetsNisab = zakatableBase >= c.nisabValue;
              const isDeleting = deletingId === c.id;

              return (
                <Card key={c.id} className="bg-white dark:bg-card border-border/60 hover:border-border transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      {/* Left */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm truncate">{c.companyName}</p>
                            <Badge variant="outline" className="text-[10px] px-2 py-0 font-semibold flex-shrink-0">
                              {c.year}
                            </Badge>
                            {meetsNisab ? (
                              <Badge className="text-[10px] px-2 py-0 gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex-shrink-0">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Certifié
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-2 py-0 gap-1 flex-shrink-0">
                                <Minus className="h-2.5 w-2.5" />
                                Exonéré
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                            <p className="text-xs text-muted-foreground">
                              Assiette : <span className="font-medium text-foreground">{formatCurrency(zakatableBase)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Zakat : <span className={`font-semibold ${meetsNisab ? "text-primary" : "text-muted-foreground"}`}>
                                {formatCurrency(c.finalZakat)}
                              </span>
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Right — actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
                          <Link href={`/dashboard/history/${c.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Détail</span>
                          </Link>
                        </Button>
                        {!planLoading && (isPro ? (
                          <>
                            <PDFDownloadButton data={buildCertData(c)} className="h-9 text-sm px-3 w-auto" />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 gap-1.5 text-muted-foreground hidden sm:flex"
                              onClick={() => exportCalculationCSV(buildCertData(c))}
                            >
                              <Download className="h-3.5 w-3.5" />
                              CSV
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 border-dashed text-muted-foreground">
                            <Link href="/pricing">
                              <Lock className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">PDF / CSV</span>
                            </Link>
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 flex-shrink-0"
                          onClick={() => handleDelete(c.id, c.companyName)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
