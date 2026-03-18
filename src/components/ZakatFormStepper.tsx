"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Package,
  ArrowDownCircle,
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  BarChart3,
  Info,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  zakatFormSchema,
  type ZakatFormData,
  STEP_FIELDS,
} from "@/lib/validations/zakatSchema";
import {
  NISAB_GOLD_GRAMS,
  GOLD_PRICES_DEFAULT,
  type ZakatInputs,
} from "@/lib/zakatEngine";

const GOLD_PRICE = GOLD_PRICES_DEFAULT.EUR;
const NISAB_VALUE = NISAB_GOLD_GRAMS * GOLD_PRICE;

const STEP_CONFIG = [
  {
    title: "Liquidités & Créances",
    subtitle: "Trésorerie et argent dû par vos clients",
    Icon: Banknote,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-200",
  },
  {
    title: "Stocks",
    subtitle: "Valeur de revente de vos marchandises",
    Icon: Package,
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    ring: "ring-sky-200",
  },
  {
    title: "Dettes déductibles",
    subtitle: "Passifs à déduire de l'assiette Zakat",
    Icon: ArrowDownCircle,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    ring: "ring-rose-200",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 48 : -48,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] },
  }),
};

interface FieldProps {
  label: string;
  hint?: string;
  name: keyof ZakatFormData;
  register: ReturnType<typeof useForm<ZakatFormData>>["register"];
  error?: string;
}

function AmountField({ label, hint, name, register, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {hint && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            — {hint}
          </span>
        )}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
          €
        </span>
        <Input
          id={name}
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          className="pl-7 h-11 text-base"
          {...register(name)}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  onComplete: (inputs: ZakatInputs) => void;
}

export default function ZakatFormStepper({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ZakatFormData>({
    resolver: zodResolver(zakatFormSchema),
    defaultValues: {
      cash: 0,
      accountsReceivable: 0,
      inventoryValue: 0,
      accountsPayable: 0,
      salariesPayable: 0,
    },
    mode: "onBlur",
  });

  async function goNext() {
    const fields = STEP_FIELDS[step] as (keyof ZakatFormData)[];
    const valid = await trigger(fields);
    if (valid) {
      setDirection(1);
      setStep((p) => p + 1);
    }
  }

  function goBack() {
    setDirection(-1);
    setStep((p) => p - 1);
  }

  const values = getValues();
  const totalActifs =
    (values.cash || 0) +
    (values.accountsReceivable || 0) +
    (values.inventoryValue || 0);
  const totalDettes =
    (values.accountsPayable || 0) + (values.salariesPayable || 0);
  const assiette = Math.max(0, totalActifs - totalDettes);
  const meetsNisab = assiette >= NISAB_VALUE;
  const zakatAmount = meetsNisab ? assiette * 0.025 : 0;

  async function handleSave() {
    setIsSaving(true);
    try {
      const data = getValues();
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cash: data.cash,
          accountsReceivable: data.accountsReceivable,
          inventoryValue: data.inventoryValue,
          accountsPayable: data.accountsPayable,
          salariesPayable: data.salariesPayable,
          netWorkingCapital: assiette,
          zakatAmount,
          nisabValue: NISAB_VALUE,
          meetsNisab,
          goldPriceEur: GOLD_PRICE,
          fiscalYear: new Date().getFullYear().toString(),
        }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  function buildZakatInputs(): ZakatInputs {
    const data = getValues();
    return {
      companyName: "",
      fiscalYear: new Date().getFullYear().toString(),
      cash: data.cash,
      accountsReceivable: data.accountsReceivable,
      inventory: data.inventoryValue,
      shortTermInvestments: 0,
      accountsPayable: data.accountsPayable,
      shortTermLoans: 0,
      salariesPayable: data.salariesPayable,
      taxesPayable: 0,
      goldPricePerGram: GOLD_PRICE,
      madhhab: "hanafi",
    };
  }

  const isSummary = step === 3;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step indicator */}
      {!isSummary && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-10" />
            <motion.div
              className="absolute left-0 top-4 h-0.5 bg-primary -z-10"
              initial={false}
              animate={{ width: `${(step / (STEP_CONFIG.length - 1)) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
            {STEP_CONFIG.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                <motion.div
                  animate={{
                    backgroundColor:
                      i <= step
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                    scale: i === step ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm"
                  style={{
                    color: i <= step ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </motion.div>
                <span
                  className={`text-xs font-medium text-center hidden sm:block max-w-[80px] leading-tight ${
                    i === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── STEP 1 ── */}
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <CardContent className="p-6 space-y-6">
                <StepHeader config={STEP_CONFIG[0]} />
                <div className="space-y-4">
                  <AmountField
                    label="Trésorerie & liquidités"
                    hint="argent en banque, caisse, placements disponibles"
                    name="cash"
                    register={register}
                    error={errors.cash?.message}
                  />
                  <AmountField
                    label="Créances clients"
                    hint="argent dû par vos clients, factures impayées"
                    name="accountsReceivable"
                    register={register}
                    error={errors.accountsReceivable?.message}
                  />
                </div>
              </CardContent>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <CardContent className="p-6 space-y-6">
                <StepHeader config={STEP_CONFIG[1]} />
                <div className="space-y-4">
                  <AmountField
                    label="Valeur de revente des stocks"
                    hint="prix de vente actuel du marché, pas le prix d'achat"
                    name="inventoryValue"
                    register={register}
                    error={errors.inventoryValue?.message}
                  />
                  <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2.5 text-xs text-sky-700 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      Selon les normes AAOIFI, les stocks sont valorisés à la{" "}
                      <strong>valeur de revente</strong>, non au prix de revient.
                    </span>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <CardContent className="p-6 space-y-6">
                <StepHeader config={STEP_CONFIG[2]} />
                <div className="space-y-4">
                  <AmountField
                    label="Dettes fournisseurs"
                    hint="montant dû à vos fournisseurs, factures à payer"
                    name="accountsPayable"
                    register={register}
                    error={errors.accountsPayable?.message}
                  />
                  <AmountField
                    label="Salaires & charges à payer"
                    hint="salaires dus, cotisations sociales en attente"
                    name="salariesPayable"
                    register={register}
                    error={errors.salariesPayable?.message}
                  />
                </div>
              </CardContent>
            </motion.div>
          )}

          {/* ── SUMMARY ── */}
          {step === 3 && (
            <motion.div
              key="summary"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Résumé de votre bilan</p>
                    <p className="text-xs text-muted-foreground">
                      Exercice {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Breakdown table */}
                <div className="rounded-xl border border-border overflow-hidden text-sm">
                  <div className="bg-emerald-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Actifs (zakatable)
                  </div>
                  <SummaryRow
                    label="Trésorerie & liquidités"
                    value={values.cash || 0}
                  />
                  <SummaryRow
                    label="Créances clients"
                    value={values.accountsReceivable || 0}
                  />
                  <SummaryRow
                    label="Stocks (valeur marché)"
                    value={values.inventoryValue || 0}
                  />
                  <SummaryRow
                    label="Total actifs"
                    value={totalActifs}
                    bold
                    positive
                  />

                  <div className="bg-rose-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 border-t border-border">
                    Dettes déductibles
                  </div>
                  <SummaryRow
                    label="Dettes fournisseurs"
                    value={values.accountsPayable || 0}
                    negative
                  />
                  <SummaryRow
                    label="Salaires & charges"
                    value={values.salariesPayable || 0}
                    negative
                  />
                  <SummaryRow
                    label="Total dettes"
                    value={totalDettes}
                    bold
                    negative
                  />

                  <Separator />
                  <SummaryRow
                    label="Assiette Zakat (Capital Circulant Net)"
                    value={assiette}
                    bold
                  />
                </div>

                {/* Nisab check */}
                <div
                  className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                    meetsNisab
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted border-border"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                      meetsNisab ? "bg-primary/10" : "bg-muted-foreground/10"
                    }`}
                  >
                    {meetsNisab ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Info className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {meetsNisab ? "Nisab atteint ✓" : "Nisab non atteint"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seuil : {formatCurrency(NISAB_VALUE)} (85g × {GOLD_PRICE} €/g)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(zakatAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meetsNisab ? "Zakat due (2,5%)" : "Aucune Zakat due"}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={handleSave}
                    disabled={isSaving || saveStatus === "saved"}
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Sauvegarde…</>
                    ) : saveStatus === "saved" ? (
                      <><CheckCircle className="h-4 w-4 text-primary" />Bilan sauvegardé</>
                    ) : saveStatus === "error" ? (
                      <><AlertTriangle className="h-4 w-4 text-amber-500" />Réessayer</>
                    ) : (
                      <><Save className="h-4 w-4" />Sauvegarder mon bilan</>
                    )}
                  </Button>
                  <Button
                    className="gap-2 flex-1"
                    onClick={() => onComplete(buildZakatInputs())}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Voir le rapport détaillé
                  </Button>
                </div>

                {/* Legal disclaimer */}
                <div className="rounded-lg bg-muted/40 border border-border/50 px-3.5 py-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Ce calcul est une estimation basée sur les données fournies.
                    Pour une validation religieuse finale, consultez un expert en
                    finance islamique.
                  </span>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!isSummary && (
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Button>

            <p className="text-xs text-muted-foreground">
              Étape {step + 1} sur {STEP_CONFIG.length}
            </p>

            <Button onClick={goNext} className="gap-1.5">
              {step === STEP_CONFIG.length - 1 ? "Calculer" : "Suivant"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isSummary && (
          <div className="px-6 pb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="gap-1.5 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Modifier mes données
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepHeader({
  config,
}: {
  config: (typeof STEP_CONFIG)[number];
}) {
  const { Icon, title, subtitle, color, bg, ring } = config;
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bg} ring-1 ${ring}`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <h2 className="font-semibold text-base leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  positive,
  negative,
}: {
  label: string;
  value: number;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 border-t border-border/50 first:border-t-0 ${
        bold ? "bg-muted/30" : ""
      }`}
    >
      <span
        className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium tabular-nums ${
          bold && positive
            ? "text-emerald-700"
            : bold && negative
            ? "text-rose-600"
            : bold
            ? "text-foreground font-bold"
            : negative
            ? "text-rose-500"
            : ""
        }`}
      >
        {negative && value > 0 ? "− " : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}
