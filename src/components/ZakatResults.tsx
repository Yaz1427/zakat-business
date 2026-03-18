"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type ZakatResult, MADHHAB_LABELS, type ZakatInputs } from "@/lib/zakatEngine";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  Award,
  TrendingDown,
  TrendingUp,
  Info,
  Download,
  Star,
  Lock,
  Loader2,
  LogIn,
} from "lucide-react";

interface Props {
  result: ZakatResult;
  onReset: () => void;
}

const COLORS = {
  cash: "#166534",
  accountsReceivable: "#15803d",
  inventory: "#22c55e",
  shortTermInvestments: "#86efac",
  accountsPayable: "#dc2626",
  shortTermLoans: "#ef4444",
  salariesPayable: "#f87171",
  taxesPayable: "#fca5a5",
};

function simulatePDFDownload(result: ZakatResult) {
  const content = `
ATTESTATION DE CALCUL ZAKAT
============================
Entreprise       : ${result.companyName || "N/A"}
Exercice fiscal  : ${result.fiscalYear}
Date de calcul   : ${result.calculationDate}
École juridique  : ${MADHHAB_LABELS[result.madhhab as ZakatInputs["madhhab"]]}

ACTIFS CIRCULANTS
------------------
Trésorerie             : ${formatCurrency(result.breakdown.cash)}
Créances clients       : ${formatCurrency(result.breakdown.accountsReceivable)}
Stocks                 : ${formatCurrency(result.breakdown.inventory)}
Placements CT          : ${formatCurrency(result.breakdown.shortTermInvestments)}
Total actifs           : ${formatCurrency(result.totalCurrentAssets)}

PASSIFS CIRCULANTS
-------------------
Dettes fournisseurs    : ${formatCurrency(result.liabilitiesBreakdown.accountsPayable)}
Emprunts CT            : ${formatCurrency(result.liabilitiesBreakdown.shortTermLoans)}
Salaires à payer       : ${formatCurrency(result.liabilitiesBreakdown.salariesPayable)}
Taxes à payer          : ${formatCurrency(result.liabilitiesBreakdown.taxesPayable)}
Total passifs          : ${formatCurrency(result.totalCurrentLiabilities)}

RÉSULTAT
---------
Capital Circulant Net  : ${formatCurrency(result.netWorkingCapital)}
Seuil Nisab            : ${formatCurrency(result.nisabValue)}
Conforme au Nisab      : ${result.meetsNisab ? "OUI" : "NON"}
Taux Zakat             : ${(result.zakatRate * 100).toFixed(1)}%
ZAKAT DUE              : ${formatCurrency(result.zakatAmount)}

============================
Calcul effectué selon les normes AAOIFI.
Méthode : Capital Circulant Net.
Pour usage indicatif - consultez un savant pour validation finale.
  `.trim();

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attestation-zakat-${result.companyName || "entreprise"}-${result.fiscalYear}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ZakatResults({ result, onReset }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  async function handleStripeCheckout() {
    if (!isSignedIn) return;
    setStripeLoading(true);
    try {
      const reportKey = `zakat_${Date.now()}`;
      localStorage.setItem("zakat_pending_report", JSON.stringify(result));
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session de paiement.");
      }
    } catch {
      alert("Erreur réseau, veuillez réessayer.");
    } finally {
      setStripeLoading(false);
    }
  }

  const assetsChartData = [
    { name: "Trésorerie", value: result.breakdown.cash, color: COLORS.cash },
    { name: "Créances clients", value: result.breakdown.accountsReceivable, color: COLORS.accountsReceivable },
    { name: "Stocks", value: result.breakdown.inventory, color: COLORS.inventory },
    { name: "Placements CT", value: result.breakdown.shortTermInvestments, color: COLORS.shortTermInvestments },
  ].filter((d) => d.value > 0);

  const liabilitiesChartData = [
    { name: "Dettes fournisseurs", value: result.liabilitiesBreakdown.accountsPayable, color: COLORS.accountsPayable },
    { name: "Emprunts CT", value: result.liabilitiesBreakdown.shortTermLoans, color: COLORS.shortTermLoans },
    { name: "Salaires à payer", value: result.liabilitiesBreakdown.salariesPayable, color: COLORS.salariesPayable },
    { name: "Taxes à payer", value: result.liabilitiesBreakdown.taxesPayable, color: COLORS.taxesPayable },
  ].filter((d) => d.value > 0);

  const summaryBarData = [
    { name: "Actifs circulants", montant: result.totalCurrentAssets, fill: "#166534" },
    { name: "Passifs circulants", montant: result.totalCurrentLiabilities, fill: "#dc2626" },
    { name: "Assiette Zakat", montant: result.netWorkingCapital, fill: "#ca8a04" },
    ...(result.meetsNisab ? [{ name: "Zakat due (2,5%)", montant: result.zakatAmount, fill: "#0369a1" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header result */}
      <div
        className={`rounded-2xl border p-6 text-center ${
          result.meetsNisab
            ? "border-primary/30 bg-primary/5"
            : "border-muted bg-muted/30"
        }`}
      >
        <div className="flex justify-center mb-3">
          {result.meetsNisab ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-1">
          {result.companyName || "Votre entreprise"} · {result.fiscalYear}
        </h1>

        {result.meetsNisab ? (
          <>
            <p className="text-muted-foreground text-sm mb-4">
              Le Capital Circulant Net dépasse le Nisab. La Zakat est due.
            </p>
            <div className="inline-flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Zakat due
              </span>
              <span className="text-5xl font-bold text-primary">
                {formatCurrency(result.zakatAmount)}
              </span>
              <Badge variant="secondary" className="mt-2 text-xs">
                {(result.zakatRate * 100).toFixed(1)}% × {formatCurrency(result.netWorkingCapital)}
              </Badge>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-2">
              Le Capital Circulant Net est inférieur au Nisab.
            </p>
            <p className="text-sm">
              Assiette : <strong>{formatCurrency(result.netWorkingCapital)}</strong> — Nisab :{" "}
              <strong>{formatCurrency(result.nisabValue)}</strong>
            </p>
            <Badge variant="outline" className="mt-3">
              Aucune Zakat due cette année
            </Badge>
          </>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Actifs circulants",
            value: formatCurrency(result.totalCurrentAssets),
            icon: TrendingUp,
            color: "text-emerald-600",
          },
          {
            label: "Passifs circulants",
            value: formatCurrency(result.totalCurrentLiabilities),
            icon: TrendingDown,
            color: "text-red-500",
          },
          {
            label: "Capital circulant net",
            value: formatCurrency(result.netWorkingCapital),
            icon: Star,
            color: "text-amber-600",
          },
          {
            label: "Seuil Nisab",
            value: formatCurrency(result.nisabValue),
            icon: Info,
            color: "text-blue-500",
          },
        ].map((metric) => (
          <Card key={metric.label} className="text-center">
            <CardContent className="pt-4 pb-4 px-3">
              <metric.icon className={`h-4 w-4 mx-auto mb-1.5 ${metric.color}`} />
              <div className="text-sm font-bold leading-tight">{metric.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vue d'ensemble</CardTitle>
          <CardDescription className="text-xs">Répartition des montants clés</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={summaryBarData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Montant"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                {summaryBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie charts */}
      {(assetsChartData.length > 0 || liabilitiesChartData.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assetsChartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Répartition des actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={assetsChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {assetsChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: 10 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {liabilitiesChartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Répartition des passifs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={liabilitiesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {liabilitiesChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: 10 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed breakdown toggle */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Détail ligne par ligne</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs h-7"
            >
              {showDetails ? "Masquer" : "Afficher"}
            </Button>
          </div>
        </CardHeader>

        {showDetails && (
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-emerald-700 mb-2">Actifs circulants</h4>
              <div className="space-y-1.5">
                {[
                  { label: "Trésorerie & équivalents", val: result.breakdown.cash },
                  { label: "Créances clients nettes", val: result.breakdown.accountsReceivable },
                  { label: "Stocks (prix de vente)", val: result.breakdown.inventory },
                  { label: "Placements court terme", val: result.breakdown.shortTermInvestments },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{formatCurrency(row.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1">
                  <span>Total actifs</span>
                  <span>{formatCurrency(result.totalCurrentAssets)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-semibold uppercase text-red-600 mb-2">Passifs circulants</h4>
              <div className="space-y-1.5">
                {[
                  { label: "Dettes fournisseurs", val: result.liabilitiesBreakdown.accountsPayable },
                  { label: "Emprunts court terme", val: result.liabilitiesBreakdown.shortTermLoans },
                  { label: "Salaires & charges à payer", val: result.liabilitiesBreakdown.salariesPayable },
                  { label: "Taxes & impôts à payer", val: result.liabilitiesBreakdown.taxesPayable },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-red-600">- {formatCurrency(row.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-red-600 pt-1">
                  <span>Total passifs</span>
                  <span>- {formatCurrency(result.totalCurrentLiabilities)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold">
                <span>Capital Circulant Net (assiette)</span>
                <span className="text-amber-700">{formatCurrency(result.netWorkingCapital)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seuil Nisab (85g d'or)</span>
                <span>{formatCurrency(result.nisabValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taux Zakat applicable</span>
                <span>{(result.zakatRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
                <span>Zakat due</span>
                <span>{formatCurrency(result.zakatAmount)}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Attestation gratuite */}
      {result.meetsNisab && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-0.5">Attestation de conformité (gratuite)</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Téléchargez votre attestation simple pour vos archives.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => simulatePDFDownload(result)}
                >
                  <Download className="h-4 w-4" />
                  Télécharger l'attestation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rapport PDF détaillé — Stripe payant */}
      {result.meetsNisab && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">Rapport PDF détaillé</span>
                  <span className="text-xs font-bold text-accent-foreground bg-accent/30 rounded-full px-2 py-0.5">9,99 €</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Rapport complet ligne par ligne, calcul détaillé, références AAOIFI — idéal pour votre expert-comptable ou votre dossier RSE.
                </p>

                {!isLoaded ? (
                  <Button variant="gold" size="sm" disabled className="gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement…
                  </Button>
                ) : !isSignedIn ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Connexion requise pour accéder au rapport payant
                    </p>
                    <Button variant="gold" size="sm" asChild className="gap-2">
                      <Link href="/sign-in">
                        <LogIn className="h-4 w-4" />
                        Se connecter pour payer
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="gold"
                    size="sm"
                    className="gap-2"
                    onClick={handleStripeCheckout}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Redirection…</>
                    ) : (
                      <><Download className="h-4 w-4" />Payer et télécharger (9,99 €)</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info disclaimer */}
      <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>
          Ce calcul est fourni à titre indicatif selon les normes AAOIFI. Pour une validation religieuse
          officielle, veuillez consulter un savant ou un expert en finance islamique qualifié.
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Nouveau calcul
        </Button>
      </div>
    </div>
  );
}
