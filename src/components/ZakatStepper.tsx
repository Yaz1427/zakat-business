"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type ZakatInputs, MADHHAB_LABELS, GOLD_PRICES_DEFAULT } from "@/lib/zakatEngine";
import {
  Building2,
  Wallet,
  Package,
  Receipt,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
} from "lucide-react";

interface Props {
  onCalculate: (inputs: ZakatInputs) => void;
}

const STEPS = [
  { id: 1, title: "Identité", icon: Building2, description: "Informations générales sur votre entreprise" },
  { id: 2, title: "Actifs", icon: Wallet, description: "Vos actifs circulants (trésorerie, stocks, créances)" },
  { id: 3, title: "Passifs", icon: Receipt, description: "Vos dettes et obligations à court terme" },
  { id: 4, title: "Paramètres", icon: Package, description: "École juridique et devise" },
];

const DEFAULT_INPUTS: ZakatInputs = {
  companyName: "",
  fiscalYear: `${new Date().getFullYear() - 1}–${new Date().getFullYear()}`,
  cash: 0,
  accountsReceivable: 0,
  inventory: 0,
  shortTermInvestments: 0,
  accountsPayable: 0,
  shortTermLoans: 0,
  salariesPayable: 0,
  taxesPayable: 0,
  goldPricePerGram: GOLD_PRICES_DEFAULT["EUR"],
  madhhab: "maliki",
};

function NumberInput({
  label,
  id,
  value,
  onChange,
  tooltip,
  currency = "€",
}: {
  label: string;
  id: string;
  value: number;
  onChange: (val: number) => void;
  tooltip?: string;
  currency?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          step={100}
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {currency}
        </span>
      </div>
    </div>
  );
}

export default function ZakatStepper({ onCalculate }: Props) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<ZakatInputs>(DEFAULT_INPUTS);

  function update<K extends keyof ZakatInputs>(key: K, value: ZakatInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  function handleNext() {
    if (step < STEPS.length) setStep((s) => s + 1);
    else onCalculate(inputs);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  const currentStep = STEPS[step - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Calculateur de Zakat Entreprise</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Méthode du Capital Circulant Net · Normes AAOIFI
        </p>
      </div>

      {/* Steps indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                s.id === step
                  ? "text-primary"
                  : s.id < step
                  ? "text-primary/70"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs transition-all ${
                  s.id < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : s.id === step
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <span className="hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <currentStep.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Étape {step} — {currentStep.title}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">{currentStep.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input
                  id="companyName"
                  placeholder="Ma SARL, Mon EI…"
                  value={inputs.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fiscalYear">Exercice fiscal</Label>
                <Input
                  id="fiscalYear"
                  placeholder="2024–2025"
                  value={inputs.fiscalYear}
                  onChange={(e) => update("fiscalYear", e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Quel document préparer ?</p>
                <p>
                  Munissez-vous de votre <strong>bilan comptable</strong> ou de votre{" "}
                  <strong>balance des comptes</strong> à la date de clôture de l'exercice fiscal.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
                Renseignez les montants au <strong>jour de clôture</strong> de votre exercice.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Trésorerie & équivalents"
                  id="cash"
                  value={inputs.cash}
                  onChange={(v) => update("cash", v)}
                  tooltip="Comptes bancaires, caisse, placements très court terme (< 3 mois)"
                />
                <NumberInput
                  label="Créances clients nettes"
                  id="accountsReceivable"
                  value={inputs.accountsReceivable}
                  onChange={(v) => update("accountsReceivable", v)}
                  tooltip="Factures émises non encaissées. Excluez les créances douteuses (probabilité de recouvrement < 50%)."
                />
                <NumberInput
                  label="Stocks (prix de vente actuel)"
                  id="inventory"
                  value={inputs.inventory}
                  onChange={(v) => update("inventory", v)}
                  tooltip="Valorisez au prix de vente du marché au jour de clôture (norme AAOIFI, méthode Hanafi/Malikite)."
                />
                <NumberInput
                  label="Placements financiers court terme"
                  id="shortTermInvestments"
                  value={inputs.shortTermInvestments}
                  onChange={(v) => update("shortTermInvestments", v)}
                  tooltip="Obligations, bons du Trésor ou fonds halal à échéance < 1 an."
                />
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
                <span className="font-semibold text-primary">Total actifs circulants : </span>
                <span className="font-bold text-primary">
                  {(
                    inputs.cash +
                    inputs.accountsReceivable +
                    inputs.inventory +
                    inputs.shortTermInvestments
                  ).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
                Les dettes déductibles sont celles <strong>exigibles à court terme</strong> ({"<"} 12 mois).
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Dettes fournisseurs"
                  id="accountsPayable"
                  value={inputs.accountsPayable}
                  onChange={(v) => update("accountsPayable", v)}
                  tooltip="Factures fournisseurs reçues non payées à moins de 12 mois."
                />
                <NumberInput
                  label="Emprunts court terme"
                  id="shortTermLoans"
                  value={inputs.shortTermLoans}
                  onChange={(v) => update("shortTermLoans", v)}
                  tooltip="Part des emprunts bancaires remboursable dans l'année."
                />
                <NumberInput
                  label="Salaires et charges à payer"
                  id="salariesPayable"
                  value={inputs.salariesPayable}
                  onChange={(v) => update("salariesPayable", v)}
                  tooltip="Salaires du mois, congés payés provisionnés, cotisations sociales dues."
                />
                <NumberInput
                  label="Taxes et impôts à payer"
                  id="taxesPayable"
                  value={inputs.taxesPayable}
                  onChange={(v) => update("taxesPayable", v)}
                  tooltip="TVA collectée, IS dû, cotisation foncière, etc."
                />
              </div>

              <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm">
                <span className="font-semibold">Total passifs circulants : </span>
                <span className="font-bold text-destructive">
                  {(
                    inputs.accountsPayable +
                    inputs.shortTermLoans +
                    inputs.salariesPayable +
                    inputs.taxesPayable
                  ).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">École juridique (Madhhab)</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Influence le traitement des stocks et la méthode de valorisation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(MADHHAB_LABELS) as [ZakatInputs["madhhab"], string][]).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => update("madhhab", key)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                          inputs.madhhab === key
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            inputs.madhhab === key ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {inputs.madhhab === key && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span className="leading-snug">{label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goldPrice" className="text-sm font-medium">
                  Prix de l'or (par gramme en €)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Utilisé pour calculer le Nisab (seuil minimum = 85g d'or).
                </p>
                <NumberInput
                  label=""
                  id="goldPrice"
                  value={inputs.goldPricePerGram}
                  onChange={(v) => update("goldPricePerGram", v)}
                  tooltip="Cours actuel de l'or au gramme en euros. Valeur indicative : ~77–80 €/g"
                />
                <p className="text-xs text-muted-foreground">
                  Nisab estimé :{" "}
                  <strong>
                    {(inputs.goldPricePerGram * 85).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </strong>{" "}
                  (85g × {inputs.goldPricePerGram}€)
                </p>
              </div>

              <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 text-sm">
                <p className="font-medium text-foreground mb-1">Récapitulatif avant calcul</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                  <span>Entreprise :</span>
                  <span className="font-medium text-foreground">{inputs.companyName || "—"}</span>
                  <span>Actifs circulants :</span>
                  <span className="font-medium text-foreground">
                    {(inputs.cash + inputs.accountsReceivable + inputs.inventory + inputs.shortTermInvestments).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                  <span>Passifs circulants :</span>
                  <span className="font-medium text-foreground">
                    {(inputs.accountsPayable + inputs.shortTermLoans + inputs.salariesPayable + inputs.taxesPayable).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                  <span>Assiette estimée :</span>
                  <span className="font-bold text-primary">
                    {Math.max(0,
                      inputs.cash + inputs.accountsReceivable + inputs.inventory + inputs.shortTermInvestments -
                      inputs.accountsPayable - inputs.shortTermLoans - inputs.salariesPayable - inputs.taxesPayable
                    ).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {step} / {STEPS.length}
          </Badge>
          <Button onClick={handleNext} className="gap-2" size="lg">
            {step === STEPS.length ? (
              <>
                Calculer ma Zakat
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
