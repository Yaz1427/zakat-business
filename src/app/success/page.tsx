"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ZakatResult, MADHHAB_LABELS, type ZakatInputs } from "@/lib/zakatEngine";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Download, ArrowLeft, Star, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

function generateDetailedReport(result: ZakatResult): string {
  const madhhab = MADHHAB_LABELS[result.madhhab as ZakatInputs["madhhab"]] ?? result.madhhab;
  const separator = "═".repeat(60);
  const line = "─".repeat(60);

  return `
${separator}
         RAPPORT DÉTAILLÉ DE ZAKAT — ZAKAT BUSINESS
${separator}

  Entreprise       : ${result.companyName || "N/A"}
  Exercice fiscal  : ${result.fiscalYear}
  Date de calcul   : ${result.calculationDate}
  École juridique  : ${madhhab}
  Référence norme  : AAOIFI — Méthode Capital Circulant Net

${line}
  ACTIFS CIRCULANTS (Zakatable Assets)
${line}

  Trésorerie & équivalents de caisse    ${formatCurrency(result.breakdown.cash).padStart(16)}
  Créances clients nettes               ${formatCurrency(result.breakdown.accountsReceivable).padStart(16)}
  Stocks (prix de vente du marché)      ${formatCurrency(result.breakdown.inventory).padStart(16)}
  Placements financiers court terme     ${formatCurrency(result.breakdown.shortTermInvestments).padStart(16)}
                                        ${line.slice(0, 16)}
  TOTAL ACTIFS CIRCULANTS               ${formatCurrency(result.totalCurrentAssets).padStart(16)}

${line}
  PASSIFS CIRCULANTS (Déductibles)
${line}

  Dettes fournisseurs (court terme)     ${("-" + formatCurrency(result.liabilitiesBreakdown.accountsPayable)).padStart(16)}
  Emprunts à court terme                ${("-" + formatCurrency(result.liabilitiesBreakdown.shortTermLoans)).padStart(16)}
  Salaires & charges sociales dues      ${("-" + formatCurrency(result.liabilitiesBreakdown.salariesPayable)).padStart(16)}
  Taxes & impôts exigibles              ${("-" + formatCurrency(result.liabilitiesBreakdown.taxesPayable)).padStart(16)}
                                        ${line.slice(0, 16)}
  TOTAL PASSIFS CIRCULANTS              ${("-" + formatCurrency(result.totalCurrentLiabilities)).padStart(16)}

${separator}
  CALCUL DE LA ZAKAT
${separator}

  Capital Circulant Net (Assiette)      ${formatCurrency(result.netWorkingCapital).padStart(16)}
  Seuil Nisab (85g d'or)                ${formatCurrency(result.nisabValue).padStart(16)}
  Condition Nisab satisfaite            ${ (result.meetsNisab ? "OUI ✓" : "NON ✗").padStart(16)}
  Taux Zakat applicable                 ${ ((result.zakatRate * 100).toFixed(1) + "%").padStart(16)}

  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │   ZAKAT DUE : ${formatCurrency(result.zakatAmount).padEnd(39)}│
  │                                                      │
  └──────────────────────────────────────────────────────┘

${separator}
  MÉTHODOLOGIE & RÉFÉRENCES
${separator}

  Ce calcul utilise la méthode du Capital Circulant Net
  (Net Working Capital Method) telle que définie par
  l'AAOIFI (Accounting and Auditing Organisation for
  Islamic Financial Institutions).

  Formule : (Actifs Circulants - Passifs Circulants) × 2,5%

  Le Nisab est calculé sur la base de 85 grammes d'or
  selon le cours du jour, conformément au standard AAOIFI
  et à l'interprétation Hanafi/Malikite.

  Les créances douteuses (probabilité < 50%) sont exclues
  de l'assiette Zakat.

${separator}
  AVERTISSEMENT LÉGAL
${separator}

  Ce rapport est fourni à titre informatif et indicatif.
  Pour une validation religieuse officielle, veuillez
  consulter un savant qualifié (alim) spécialisé en
  fiqh al-muamalat ou un expert en finance islamique
  certifié AAOIFI.

  Zakat Business — zakatbusiness.fr
  Document généré le ${result.calculationDate}
${separator}
`.trim();
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("zakat_pending_report");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  function handleDownload() {
    if (!result) return;
    const content = generateDetailedReport(result);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-zakat-detaille-${result.companyName || "entreprise"}-${result.fiscalYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.removeItem("zakat_pending_report");
    setDownloaded(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-16 max-w-lg">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">Paiement confirmé !</h1>
              <p className="text-muted-foreground text-sm">
                Merci pour votre achat. Votre rapport détaillé est prêt.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Référence : <code className="font-mono">{sessionId.slice(0, 24)}…</code>
                </p>
              )}
            </div>

            {result ? (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-sm text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entreprise</span>
                  <span className="font-medium">{result.companyName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exercice</span>
                  <span className="font-medium">{result.fiscalYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zakat due</span>
                  <span className="font-bold text-primary">{formatCurrency(result.zakatAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <p>
                  Le rapport sera disponible si vous avez initié le paiement depuis la page
                  calculateur dans cet onglet.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {result && (
                <Button
                  onClick={handleDownload}
                  className="w-full gap-2"
                  size="lg"
                  disabled={downloaded}
                >
                  {downloaded ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Rapport téléchargé
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Télécharger le rapport PDF détaillé
                    </>
                  )}
                </Button>
              )}

              <Button variant="outline" asChild className="w-full gap-2">
                <Link href="/calculateur">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au calculateur
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>Zakat Business · Paiement sécurisé par Stripe</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
