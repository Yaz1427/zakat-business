"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import {
  Calculator,
  FileDown,
  Building2,
  CheckCircle2,
  Minus,
  Loader2,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  Clock,
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

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border/60 p-5 flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ComptePage() {
  const { user, isLoaded } = useUser();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/calculations")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur réseau");
        return r.json();
      })
      .then((data) => setCalculations(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossible de charger vos calculs. Réessayez."))
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  const totalZakat = calculations.reduce((s, c) => s + c.finalZakat, 0);
  const latestYear = calculations[0]?.year ?? null;
  const latestZakat = calculations[0]?.finalZakat ?? null;

  // ── Not signed in ──
  if (isLoaded && !user) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] dark:bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-24 max-w-md text-center space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 mx-auto">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Accédez à votre compte</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connectez-vous pour consulter vos calculs sauvegardés et télécharger vos attestations Zakat.
            </p>
          </div>
          <Button asChild className="gap-2 h-12 px-8 text-base font-semibold">
            <Link href="/sign-in">Se connecter</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] dark:bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mon espace</h1>
            {user && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            )}
          </div>
          <Button asChild className="gap-2 h-10 self-start sm:self-auto">
            <Link href="/calculate">
              <Calculator className="h-4 w-4" />
              Nouveau calcul
            </Link>
          </Button>
        </div>

        {/* ── Stats ── */}
        {calculations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <StatCard
              icon={FileDown}
              label="Calculs sauvegardés"
              value={String(calculations.length)}
              sub="attestations disponibles"
            />
            <StatCard
              icon={TrendingUp}
              label="Zakat cumulée"
              value={formatCurrency(totalZakat)}
              sub="tous exercices confondus"
            />
            <StatCard
              icon={CalendarDays}
              label="Dernier exercice"
              value={latestYear ? String(latestYear) : "—"}
              sub={latestZakat !== null ? formatCurrency(latestZakat) + " dus" : undefined}
            />
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Chargement de vos calculs…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : calculations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
              <Calculator className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Aucun calcul sauvegardé</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Effectuez votre premier calcul de Zakat et sauvegardez-le pour le retrouver ici.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/calculate">
                Calculer ma Zakat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Historique des calculs
            </p>
            {calculations.map((c) => {
              const totalAssets = c.cash + c.stocks + c.receivables;
              const zakatableBase = Math.max(0, totalAssets - c.debts);
              const meetsNisab = zakatableBase >= c.nisabValue;

              return (
                <Card key={c.id} className="bg-white dark:bg-card border-border/60 hover:border-border transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      {/* Left — company + meta */}
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
                                Nisab atteint
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
                              Zakat : <span className={`font-semibold ${meetsNisab ? "text-primary" : "text-muted-foreground"}`}>{formatCurrency(c.finalZakat)}</span>
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Sauvegardé le {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Right — PDF button */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <PDFDownloadButton
                          data={buildCertData(c)}
                          className="sm:w-52"
                        />
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
