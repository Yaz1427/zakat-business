"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Minus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
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

function Row({ label, value, variant = "neutral", large = false }: {
  label: string; value: number; variant?: "positive" | "negative" | "neutral"; large?: boolean;
}) {
  const color =
    variant === "positive" ? "text-emerald-700 dark:text-emerald-400"
    : variant === "negative" ? "text-rose-600 dark:text-rose-400"
    : "text-foreground";
  return (
    <div className={`flex items-center justify-between py-2.5 px-4 ${large ? "bg-muted/30" : ""}`}>
      <span className={`text-sm ${large ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm tabular-nums font-semibold ${color} ${large ? "text-base" : ""}`}>
        {variant === "negative" && value > 0 ? "− " : ""}{formatCurrency(value)}
      </span>
    </div>
  );
}

export default function CalculationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, isLoaded } = useUser();
  const [calc, setCalc] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || !id) { setLoading(false); return; }
    fetch(`/api/calculations/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => { if (data) setCalc(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [isLoaded, user, id]);

  const zakatableBase = calc ? Math.max(0, calc.cash + calc.stocks + calc.receivables - calc.debts) : 0;
  const totalAssets = calc ? calc.cash + calc.stocks + calc.receivables : 0;
  const meetsNisab = calc ? zakatableBase >= calc.nisabValue : false;
  const goldPriceEur = calc && calc.nisabValue > 0 ? Math.round((calc.nisabValue / 85) * 100) / 100 : 77.5;

  const certData: CertificateData | null = calc ? {
    companyName: calc.companyName,
    year: calc.year,
    cash: calc.cash,
    stocks: calc.stocks,
    receivables: calc.receivables,
    supplierDebts: calc.supplierDebts,
    taxDebts: calc.taxDebts,
    salaryDebts: calc.salaryDebts,
    totalAssets,
    totalDebts: calc.debts,
    zakatableBase,
    nisabValue: calc.nisabValue,
    meetsNisab,
    finalZakat: calc.finalZakat,
    goldPriceEur,
    certNumber: `ZKT-${calc.year}-${calc.id.slice(-8).toUpperCase()}`,
    issuedAt: new Date(calc.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    }),
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] dark:bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-2xl">

        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground mb-6 -ml-2">
          <Link href="/dashboard/history">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;historique
          </Link>
        </Button>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-72 w-full rounded-xl mt-6" />
          </div>
        )}

        {notFound && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="font-semibold">Calcul introuvable</p>
            <p className="text-sm text-muted-foreground">Ce calcul n&apos;existe pas ou ne vous appartient pas.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/history">Retour à l&apos;historique</Link>
            </Button>
          </div>
        )}

        {!loading && calc && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">{calc.companyName}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[11px] font-semibold">Exercice {calc.year}</Badge>
                    {meetsNisab ? (
                      <Badge className="text-[10px] px-2 py-0 gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        <CheckCircle2 className="h-2.5 w-2.5" />Certifié
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 gap-1">
                        <Minus className="h-2.5 w-2.5" />Exonéré
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sauvegardé le {new Date(calc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              {certData && <PDFDownloadButton data={certData} className="sm:w-52" />}
            </div>

            {/* Detail card */}
            <Card className="bg-white dark:bg-card border-border/60">
              <CardContent className="p-0">
                <div className="bg-emerald-50/80 px-4 py-2.5 border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" />Actifs zakatable
                  </p>
                </div>
                <Row label="Trésorerie & liquidités" value={calc.cash} variant="positive" />
                <Row label="Stocks (valeur de revente)" value={calc.stocks} variant="positive" />
                <Row label="Créances clients" value={calc.receivables} variant="positive" />
                <Row label="Total actifs" value={totalAssets} variant="positive" large />

                <div className="bg-rose-50/80 px-4 py-2.5 border-t border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-1.5">
                    <TrendingDown className="h-3 w-3" />Passifs déductibles
                  </p>
                </div>
                <Row label="Dettes fournisseurs" value={calc.supplierDebts} variant="negative" />
                <Row label="Taxes & impôts dus" value={calc.taxDebts} variant="negative" />
                <Row label="Salaires & charges" value={calc.salaryDebts} variant="negative" />
                <Row label="Total passifs" value={calc.debts} variant="negative" large />

                <Separator />
                <Row label="Assiette Zakat (Capital Circulant Net)" value={zakatableBase} large />

                {/* Nisab + Zakat */}
                <div className={`mx-4 my-4 rounded-xl border px-5 py-4 ${meetsNisab ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-border"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {meetsNisab
                          ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          : <Minus className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        <p className="font-semibold text-sm">
                          {meetsNisab ? "Nisab atteint — Zakat obligatoire" : "Nisab non atteint — Aucune Zakat due"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        Seuil Nisab : {formatCurrency(calc.nisabValue)}
                        <span className="ml-1 opacity-70">(85g × {goldPriceEur.toFixed(2)} €/g)</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-3xl font-bold tabular-nums ${meetsNisab ? "text-primary" : "text-muted-foreground"}`}>
                        {formatCurrency(calc.finalZakat)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {meetsNisab ? "Zakat due (2,5%)" : "Aucune Zakat due"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
