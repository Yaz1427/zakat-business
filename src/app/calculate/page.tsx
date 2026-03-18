"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Building2,
  Wallet,
  CreditCard,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Shield,
  Info,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  TrendingDown as TaxIcon,
  Download,
  ArrowRight,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateZakatLogic, GOLD_PRICE_EUR_PER_GRAM, NISAB_GOLD_GRAMS } from "@/lib/zakat-logic";
import type { CertificateData } from "@/components/pdf/ZakatCertificate";
import { formatCurrency } from "@/lib/utils";
import { type Currency, CURRENCY_CONFIGS, formatAmount } from "@/lib/currency";
import { toast } from "sonner";
import { useUserPlan } from "@/hooks/useUserPlan";
import { computeFiscalOptimization, FISCAL_COUNTRIES, type FiscalOptimization } from "@/lib/fiscal";
import { exportCalculationCSV } from "@/lib/export-csv";

const PDFDownloadButton = dynamic(
  () => import("@/components/pdf/PDFDownloadButton"),
  { ssr: false }
);

// ─── Zod Schema ───────────────────────────────────────────────
const MAX_AMOUNT = 999_999_999_999_999; // 15 chiffres max

// Zod v4: use z.number() + valueAsNumber: true on <input> so RHF delivers a number, not a string
const amountField = z
  .number({ error: "Montant invalide" })
  .min(0, "Le montant doit être positif ou nul")
  .max(MAX_AMOUNT, "Montant trop élevé");

const formSchema = z.object({
  companyName: z.string().min(1, "Le nom est requis"),
  year: z
    .number({ error: "Année invalide" })
    .int()
    .min(2000, "Année invalide")
    .max(2030, "Année invalide"),
  siren: z
    .string()
    .regex(/^\d{9}$/, "Le SIREN doit comporter exactement 9 chiffres")
    .optional()
    .or(z.literal("")),
  cash: amountField,
  stocks: amountField,
  receivables: amountField,
  supplierDebts: amountField,
  taxDebts: amountField,
  salaryDebts: amountField,
});
type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: (keyof FormData)[][] = [
  ["companyName", "year", "siren"],
  ["cash", "stocks", "receivables"],
  ["supplierDebts", "taxDebts", "salaryDebts"],
];

// ─── Step Config ──────────────────────────────────────────────
const STEPS = [
  { title: "Entreprise", subtitle: "Identité & exercice", Icon: Building2, accent: "#7c3aed" },
  { title: "Actifs", subtitle: "Trésorerie & créances", Icon: Wallet, accent: "#059669" },
  { title: "Passifs", subtitle: "Dettes déductibles", Icon: CreditCard, accent: "#e11d48" },
  { title: "Résumé", subtitle: "Zakat calculée", Icon: BarChart3, accent: "hsl(var(--primary))" },
];

// ─── Animation variants ───────────────────────────────────────
const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 52 : -52, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir: number) => ({ x: dir < 0 ? 52 : -52, opacity: 0, transition: { duration: 0.2 } }),
};

// ─── Reusable field ───────────────────────────────────────────
function EuroField({
  label,
  hint,
  name,
  register,
  error,
  placeholder = "0,00",
}: {
  label: string;
  hint?: string;
  name: keyof FormData;
  register: ReturnType<typeof useForm<FormData>>["register"];
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-[13px] font-semibold text-foreground/80 tracking-wide uppercase">
        {label}
        {hint && (
          <span className="ml-2 text-[11px] font-normal normal-case text-muted-foreground tracking-normal">
            {hint}
          </span>
        )}
      </Label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground/70 select-none">
          €
        </span>
        <Input
          id={name}
          type="number"
          min="0"
          max={MAX_AMOUNT}
          step="0.01"
          placeholder={placeholder}
          className="h-12 pl-8 text-[15px] font-medium border-border/60 bg-background hover:border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60"
          {...register(name, { valueAsNumber: true })}
        />
      </div>
      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
      {children}
    </p>
  );
}

// ─── Summary row ─────────────────────────────────────────────
function Row({
  label,
  value,
  variant = "default",
  large,
  format = formatCurrency,
}: {
  label: string;
  value: number;
  variant?: "default" | "positive" | "negative" | "neutral";
  large?: boolean;
  format?: (n: number) => string;
}) {
  const colorClass =
    variant === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : variant === "negative"
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-4 ${
        large ? "bg-muted/30" : ""
      }`}
    >
      <span className={`text-sm ${large ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`text-sm tabular-nums font-semibold ${colorClass} ${large ? "text-base" : ""}`}>
        {variant === "negative" && value > 0 ? "− " : ""}
        {format(value)}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CalculatePage() {
  const { user, isLoaded } = useUser();
  const { isPro, loading: planLoading, freeLimitReached } = useUserPlan();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showLimitGate, setShowLimitGate] = useState(false);
  const [sirenStatus, setSirenStatus] = useState<"idle" | "loading" | "valid" | "invalid" | "closed" | "unavailable">("idle");
  const [sirenDenomination, setSirenDenomination] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goldPrice, setGoldPrice] = useState(GOLD_PRICE_EUR_PER_GRAM);
  const [goldSource, setGoldSource] = useState("default");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [agreed, setAgreed] = useState(false);
  const [fiscalCountry, setFiscalCountry] = useState<FiscalOptimization["country"]>("FR");

  useEffect(() => {
    fetch("/api/gold-price")
      .then((r) => r.json())
      .then((d) => {
        if (d.pricePerGram) {
          setGoldPrice(d.pricePerGram);
          setGoldSource(d.source);
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      year: new Date().getFullYear(),
      siren: "",
      cash: 0,
      stocks: 0,
      receivables: 0,
      supplierDebts: 0,
      taxDebts: 0,
      salaryDebts: 0,
    },
    mode: "onBlur",
  });

  async function validateSiren(value: string) {
    if (!value || !/^\d{9}$/.test(value)) return;
    setSirenStatus("loading");
    setSirenDenomination(null);
    try {
      const res = await fetch(`/api/validate-siren?siren=${value}`);
      const data = await res.json();
      if (data.valid === null) {
        setSirenStatus("unavailable"); // API down — fail open
      } else if (!data.valid) {
        setSirenStatus("invalid");
      } else if (!data.active) {
        setSirenStatus("closed");
        setSirenDenomination(data.denomination ?? null);
      } else {
        setSirenStatus("valid");
        setSirenDenomination(data.denomination ?? null);
      }
    } catch {
      setSirenStatus("unavailable");
    }
  }

  async function goNext() {
    const fields = STEP_FIELDS[step] as (keyof FormData)[];
    const valid = await trigger(fields);
    if (!valid) return;
    // Block step 1→2 if SIREN was provided but is invalid/closed
    if (step === 0 && (sirenStatus === "invalid" || sirenStatus === "closed")) return;
    // Gate: show upgrade prompt before results if free limit reached
    if (step === 2 && freeLimitReached) {
      setShowLimitGate(true);
      return;
    }
    setDirection(1);
    setStep((p) => p + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((p) => p - 1);
  }

  const v = getValues();
  // ⚠️ React Hook Form returns raw DOM strings from getValues().
  // z.coerce only runs during trigger()/handleSubmit(), NOT on reads.
  // Force Number() here to prevent "1000" + "2000" = "10002000" concatenation.
  const nCash         = Number(v.cash)          || 0;
  const nStocks       = Number(v.stocks)        || 0;
  const nReceivables  = Number(v.receivables)   || 0;
  const nSupplier     = Number(v.supplierDebts) || 0;
  const nTax          = Number(v.taxDebts)      || 0;
  const nSalary       = Number(v.salaryDebts)   || 0;
  const debts         = nSupplier + nTax + nSalary;

  const effectiveGoldPrice =
    currency === "DZD"
      ? (CURRENCY_CONFIGS.DZD.nisabFixed! / NISAB_GOLD_GRAMS)
      : goldPrice;

  const result = calculateZakatLogic({
    cash: nCash,
    stocks: nStocks,
    receivables: nReceivables,
    debts,
    goldPriceEur: effectiveGoldPrice,
  });

  const fmt = (n: number) => formatAmount(n, currency);

  const certNumber = `ZKT-${v.year || new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const certData: CertificateData = {
    companyName: v.companyName || "—",
    year: Number(v.year) || new Date().getFullYear(),
    cash: nCash,
    stocks: nStocks,
    receivables: nReceivables,
    supplierDebts: nSupplier,
    taxDebts: nTax,
    salaryDebts: nSalary,
    totalAssets: result.totalAssets,
    totalDebts: debts,
    zakatableBase: result.zakatableBase,
    nisabValue: result.nisabValue,
    meetsNisab: result.meetsNisab,
    finalZakat: result.finalZakat,
    goldPriceEur: goldPrice,
    certNumber,
    issuedAt: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };

  async function handleSave() {
    if (!agreed) { toast.warning("Veuillez accepter la mention ci-dessus avant de sauvegarder."); return; }
    setSaving(true);
    try {
      const data = getValues();
      const sCash         = Number(data.cash)          || 0;
      const sStocks       = Number(data.stocks)        || 0;
      const sReceivables  = Number(data.receivables)   || 0;
      const sSupplier     = Number(data.supplierDebts) || 0;
      const sTax          = Number(data.taxDebts)      || 0;
      const sSalary       = Number(data.salaryDebts)   || 0;
      const totalDebts    = sSupplier + sTax + sSalary;
      const calc = calculateZakatLogic({
        cash: sCash,
        stocks: sStocks,
        receivables: sReceivables,
        debts: totalDebts,
      });
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName,
          year: Number(data.year) || new Date().getFullYear(),
          siren: data.siren || null,
          cash: sCash,
          stocks: sStocks,
          receivables: sReceivables,
          debts: totalDebts,
          supplierDebts: sSupplier,
          taxDebts: sTax,
          salaryDebts: sSalary,
          nisabValue: calc.nisabValue,
          finalZakat: calc.finalZakat,
        }),
      });
      if (res.status === 403) {
        const payload = await res.json();
        if (payload.error === "LIMIT_REACHED") {
          toast.error("Limite du plan gratuit atteinte", {
            description: "1 calcul sauvegardé par an sur le plan gratuit.",
            action: { label: "Passer à Pro — 49 €/an", onClick: () => window.location.href = "/pricing" },
            duration: 8000,
          });
          return;
        }
        if (payload.error === "SIREN_LIMIT_REACHED") {
          toast.error("SIREN déjà utilisé", {
            description: "Ce SIREN a déjà été utilisé pour un calcul gratuit cette année depuis un autre compte.",
            action: { label: "Passer à Pro — 49 €/an", onClick: () => window.location.href = "/pricing" },
            duration: 8000,
          });
          return;
        }
      }
      if (!res.ok) throw new Error();
      setSaved(true);
      toast.success("Bilan sauvegardé !", {
        description: `${data.companyName} · ${data.year}`,
        action: { label: "Voir l'historique", onClick: () => window.location.href = "/dashboard/history" },
      });
    } catch {
      toast.error("Erreur de sauvegarde", { description: "Vérifiez votre connexion et réessayez." });
    } finally {
      setSaving(false);
    }
  }

  const isSummary = step === 3;

  return (
    <div className="min-h-screen bg-[#F9F8F6] dark:bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-xl">
        {/* ── Page header ── */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full">
            <Shield className="h-3 w-3" />
            Calcul confidentiel · Normes AAOIFI
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Zakat de votre entreprise</h1>
          <p className="text-muted-foreground text-sm">
            Méthode du Capital Circulant Net — 4 étapes, moins de 3 minutes.
          </p>
          {/* Currency selector */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {(["EUR", "DZD"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  currency === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {CURRENCY_CONFIGS[c].symbol} {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center mb-7 relative">
          {/* Background line */}
          <div className="absolute top-4 left-4 right-4 h-px bg-border" />
          {/* Progress line */}
          <motion.div
            className="absolute top-4 left-4 h-px bg-primary origin-left"
            style={{ width: `calc(100% - 2rem)` }}
            initial={false}
            animate={{ scaleX: step / (STEPS.length - 1) }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {STEPS.map((s, i) => (
            <div key={i} className="relative flex flex-1 flex-col items-center gap-2 z-10">
              <motion.div
                animate={{
                  backgroundColor:
                    i < step
                      ? "hsl(var(--primary))"
                      : i === step
                      ? s.accent
                      : "hsl(var(--muted))",
                  scale: i === step ? 1.15 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
              >
                <span style={{ color: i <= step ? "white" : "hsl(var(--muted-foreground))" }}>
                  {i < step ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <s.Icon className="h-3.5 w-3.5" />
                  )}
                </span>
              </motion.div>
              <div className="text-center">
                <p
                  className={`text-[11px] font-semibold leading-none ${
                    i === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 hidden sm:block">
                  {s.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Free plan limit gate ── */}
        {showLimitGate && (
          <Card className="border-2 border-primary/20 shadow-[0_1px_4px_rgba(0,0,0,0.06)] bg-white dark:bg-card">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Limite du plan gratuit atteinte</h2>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Vous avez déjà utilisé votre calcul gratuit pour {new Date().getFullYear()}.
                    Passez à <strong>Pro</strong> pour effectuer des calculs illimités et accéder à vos résultats.
                  </p>
                </div>
                <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5 text-left">
                  <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Anti-bypass :</strong> votre SIREN est enregistré. Recréer un compte ne vous donnera pas un nouveau calcul gratuit pour la même entreprise.
                  </p>
                </div>
                <Button
                  className="w-full h-11 gap-2 shadow-sm shadow-primary/20"
                  asChild
                >
                  <Link href="/pricing">
                    <ArrowRight className="h-4 w-4" />
                    Passer à Pro — 49 €/an
                  </Link>
                </Button>
                <button
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                  onClick={() => setShowLimitGate(false)}
                >
                  Retour au formulaire
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Form card ── */}
        {!showLimitGate && <Card className="border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden bg-white dark:bg-card">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─── STEP 1: Company ─── */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                      <Building2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <SectionLabel color="#7c3aed">Étape 1 / 3</SectionLabel>
                      <p className="font-semibold text-base mt-0.5">Votre entreprise</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-[13px] font-semibold text-foreground/80 tracking-wide uppercase">
                        Nom de l&apos;entreprise
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Ex : SARL Al-Baraka Négoce"
                        className="h-12 text-[15px] font-medium border-border/60 bg-background hover:border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60"
                        {...register("companyName")}
                      />
                      {errors.companyName && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="year" className="text-[13px] font-semibold text-foreground/80 tracking-wide uppercase">
                        Exercice fiscal <span className="text-[11px] font-normal normal-case text-muted-foreground tracking-normal">— année comptable</span>
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        min="2000"
                        max="2030"
                        className="h-12 text-[15px] font-medium border-border/60 bg-background hover:border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60"
                        {...register("year", { valueAsNumber: true })}
                      />
                      {errors.year && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.year.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="siren" className="text-[13px] font-semibold text-foreground/80 tracking-wide uppercase">
                        SIREN
                        <span className="ml-2 text-[11px] font-normal normal-case text-muted-foreground tracking-normal">— 9 chiffres · recommandé</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="siren"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          placeholder="Ex : 123456789"
                          className={`h-12 text-[15px] font-medium tracking-[0.15em] border-border/60 bg-background hover:border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60 pr-10 ${
                            sirenStatus === "valid" ? "border-emerald-400 focus-visible:border-emerald-400" :
                            sirenStatus === "invalid" || sirenStatus === "closed" ? "border-destructive focus-visible:border-destructive" : ""
                          }`}
                          {...register("siren", {
                            onBlur: (e) => validateSiren(e.target.value),
                          })}
                        />
                        {sirenStatus === "loading" && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {sirenStatus === "valid" && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                        {(sirenStatus === "invalid" || sirenStatus === "closed") && (
                          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                        )}
                      </div>
                      {errors.siren && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.siren.message}
                        </p>
                      )}
                      {sirenStatus === "valid" && sirenDenomination && (
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                          {sirenDenomination}
                        </p>
                      )}
                      {sirenStatus === "invalid" && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                          <XCircle className="h-3 w-3 flex-shrink-0" />
                          SIREN introuvable dans le registre SIRENE
                        </p>
                      )}
                      {sirenStatus === "closed" && sirenDenomination && (
                        <p className="text-[11px] text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          {sirenDenomination} — entreprise radiée
                        </p>
                      )}
                      {sirenStatus === "unavailable" && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          API SIRENE indisponible — vérification ignorée
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-violet-50/60 border border-violet-100 px-4 py-3 flex items-start gap-2.5">
                      <Info className="h-3.5 w-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-violet-700 leading-relaxed">
                        Vos données restent <strong>strictement confidentielles</strong>.
                        Aucun partage avec des tiers. Le SIREN est utilisé pour garantir l’unicité de votre calcul.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* ─── STEP 2: Assets ─── */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                      <Wallet className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <SectionLabel color="#059669">Étape 2 / 3 · Actifs zakatable</SectionLabel>
                      <p className="font-semibold text-base mt-0.5">Trésorerie, stocks & créances</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <EuroField
                      label="Trésorerie"
                      hint="Banque, caisse, placements disponibles"
                      name="cash"
                      register={register}
                      error={errors.cash?.message}
                    />
                    <EuroField
                      label="Stocks"
                      hint="Valeur de revente actuelle (prix marché)"
                      name="stocks"
                      register={register}
                      error={errors.stocks?.message}
                    />
                    <EuroField
                      label="Créances clients"
                      hint="Factures impayées, argent dû par vos clients"
                      name="receivables"
                      register={register}
                      error={errors.receivables?.message}
                    />

                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 flex items-start gap-2.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Les stocks sont valorisés au <strong>prix de revente</strong>,
                        non au prix d&apos;achat — norme AAOIFI.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* ─── STEP 3: Liabilities ─── */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                      <CreditCard className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <SectionLabel color="#e11d48">Étape 3 / 3 · Passifs déductibles</SectionLabel>
                      <p className="font-semibold text-base mt-0.5">Dettes à déduire de l&apos;assiette</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <EuroField
                      label="Dettes fournisseurs"
                      hint="Factures à régler à vos fournisseurs"
                      name="supplierDebts"
                      register={register}
                      error={errors.supplierDebts?.message}
                    />
                    <EuroField
                      label="Taxes & impôts dus"
                      hint="TVA collectée, IS, cotisations fiscales"
                      name="taxDebts"
                      register={register}
                      error={errors.taxDebts?.message}
                    />
                    <EuroField
                      label="Salaires & charges à payer"
                      hint="Salaires du mois, cotisations sociales dues"
                      name="salaryDebts"
                      register={register}
                      error={errors.salaryDebts?.message}
                    />

                    <div className="rounded-xl bg-rose-50/60 border border-rose-100 px-4 py-3 flex items-start gap-2.5">
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-800 leading-relaxed">
                        Seules les dettes <strong>exigibles à court terme</strong> sont
                        déductibles. Les emprunts immobiliers ne s&apos;appliquent pas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* ─── STEP 4: Summary ─── */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
                <CardContent className="p-6 sm:p-8 space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 border border-primary/15">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <SectionLabel color="hsl(var(--primary))">Résumé du bilan Zakat</SectionLabel>
                        <p className="font-semibold text-base mt-0.5">Votre calcul détaillé</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {v.companyName || "—"} · {v.year || "—"}
                    </Badge>
                  </div>

                  {/* Breakdown table — blurred for free plan */}
                  <div className="relative">
                    <div className={isPro || planLoading ? "" : "blur-sm pointer-events-none select-none opacity-60"}>
                      <div className="rounded-xl border border-border overflow-hidden text-sm">
                        <div className="bg-emerald-50/80 px-4 py-2 border-b border-border/50">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Actifs zakatable</p>
                        </div>
                        <Row label="Trésorerie" value={nCash} variant="positive" format={fmt} />
                        <Row label="Stocks (valeur marché)" value={nStocks} variant="positive" format={fmt} />
                        <Row label="Créances clients" value={nReceivables} variant="positive" format={fmt} />
                        <Row label="Total actifs" value={result.totalAssets} variant="positive" large format={fmt} />
                        <div className="bg-rose-50/80 px-4 py-2 border-t border-b border-border/50">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Passifs déductibles</p>
                        </div>
                        <Row label="Dettes fournisseurs" value={nSupplier} variant="negative" format={fmt} />
                        <Row label="Taxes & impôts" value={nTax} variant="negative" format={fmt} />
                        <Row label="Salaires & charges" value={nSalary} variant="negative" format={fmt} />
                        <Row label="Total passifs" value={debts} variant="negative" large format={fmt} />
                        <Separator />
                        <Row label="Assiette Zakat (Capital Circulant Net)" value={result.zakatableBase} large format={fmt} />
                      </div>
                    </div>
                    {!isPro && !planLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[3px] rounded-xl border border-primary/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-3">
                          <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-semibold text-sm mb-1">Détail du calcul — Plan Pro</p>
                        <p className="text-xs text-muted-foreground text-center max-w-[200px] mb-3">
                          Débloquez le détail ligne par ligne et vos certificats PDF.
                        </p>
                        <Button asChild size="sm" className="gap-2 shadow-sm shadow-primary/20">
                          <Link href="/pricing">Passer à Pro — 49 €/an <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Nisab check + Final Zakat */}
                  <div
                    className={`rounded-xl border px-5 py-4 ${
                      result.meetsNisab
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {result.meetsNisab ? (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <p className="font-semibold text-sm">
                            {result.meetsNisab ? "Nisab atteint — Zakat obligatoire" : "Nisab non atteint"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          Seuil : {fmt(result.nisabValue)}
                          {currency === "EUR" && (
                            <span className="ml-1 opacity-70">
                              (85g × {goldPrice.toFixed(2)} €/g
                              {goldSource !== "default" && goldSource !== "manual" ? " · cours live" : ""})
                            </span>
                          )}
                          {currency === "DZD" && (
                            <span className="ml-1 opacity-70">(valeur marché algérien)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-3xl font-bold tabular-nums ${
                            result.meetsNisab ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {fmt(result.finalZakat)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {result.meetsNisab
                            ? `Zakat due (${(result.zakatRate * 100).toFixed(4).replace(".", ",")}% — AAOIFI)`
                            : "Nisab non atteint — Aucune Zakat due"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory disclaimer checkbox */}
                  <div
                    onClick={() => setAgreed((v) => !v)}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors select-none ${
                      agreed
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`flex h-5 w-5 flex-shrink-0 mt-0.5 items-center justify-center rounded border-2 transition-colors ${
                      agreed ? "bg-primary border-primary" : "bg-background border-muted-foreground/40"
                    }`}>
                      {agreed && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Je comprends que ce calcul est une <strong>estimation basée sur les normes AAOIFI</strong> et
                      ne remplace pas une consultation religieuse finale auprès d&apos;un expert qualifié.
                    </p>
                  </div>

                  {/* Save button */}
                  {isLoaded && !user ? (
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Sauvegardez votre bilan</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Connectez-vous pour enregistrer ce calcul dans votre compte.
                        </p>
                      </div>
                      <Button asChild className="flex-shrink-0 gap-2">
                        <Link href="/sign-in">
                          <Save className="h-4 w-4" />
                          Se connecter
                        </Link>
                      </Button>
                    </div>
                  ) : freeLimitReached ? (
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Limite gratuite atteinte</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            1 calcul sauvegardé/an · Passez à Pro pour des calculs illimités.
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" className="flex-shrink-0 gap-1.5 shadow-sm shadow-primary/20">
                        <Link href="/pricing">Pro — 49 €/an <ArrowRight className="h-3.5 w-3.5" /></Link>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-12 text-base font-semibold gap-2.5"
                      onClick={handleSave}
                      disabled={saving || saved || !agreed}
                    >
                      {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Sauvegarde en cours…</>
                      ) : saved ? (
                        <><CheckCircle2 className="h-4 w-4" />Bilan sauvegardé !</>
                      ) : (
                        <><Save className="h-4 w-4" />Sauvegarder dans mon compte</>
                      )}
                    </Button>
                  )}

                  {/* PDF Certificate button — Pro only */}
                  {isPro ? (
                    <PDFDownloadButton data={certData} />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-dashed text-muted-foreground"
                      asChild
                    >
                      <Link href="/pricing">
                        <Lock className="h-4 w-4" />
                        Certificat PDF officiel — Plan Pro requis
                      </Link>
                    </Button>
                  )}

                  {/* Fiscal optimization — Pro only */}
                  {isPro && result.meetsNisab && result.finalZakat > 0 && (
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <TaxIcon className="h-4 w-4 text-emerald-600" />
                        <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Optimisation fiscale</p>
                        <Badge className="text-[10px] px-2 py-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Pro</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-semibold text-muted-foreground">Taux AAOIFI · 2.5775%</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {FISCAL_COUNTRIES.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setFiscalCountry(c.value)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                                fiscalCountry === c.value
                                  ? "bg-emerald-700 text-white border-emerald-700"
                                  : "bg-background text-muted-foreground border-border hover:border-emerald-400"
                              }`}
                            >
                              {c.value}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(() => {
                        const fiscal = computeFiscalOptimization(result.finalZakat, fiscalCountry);
                        return (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Zakat due</span>
                              <span className="font-medium">{fmt(fiscal.zakatAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Réduction fiscale ({Math.round(fiscal.deductionRate * 100)}%)</span>
                              <span className="font-semibold text-emerald-700">− {fmt(fiscal.taxSaving)}</span>
                            </div>
                            <div className="h-px bg-emerald-200/60 dark:bg-emerald-700/40" />
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">Coût net réel</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">{fmt(fiscal.netCost)}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">{fiscal.detail}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Export CSV — Pro only */}
                  {isPro && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-muted-foreground"
                      onClick={() => exportCalculationCSV(certData)}
                    >
                      <Download className="h-4 w-4" />
                      Exporter pour mon comptable (CSV/Excel)
                    </Button>
                  )}

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-3.5 py-3 border border-border/40">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Ce calcul est une estimation basée sur les données fournies et les normes AAOIFI.
                      Pour une validation religieuse finale, consultez un{" "}
                      <strong>expert en finance islamique qualifié</strong>.
                    </span>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation footer ── */}
          <div className="flex items-center justify-between px-6 sm:px-8 pb-6 gap-3">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 3 ? "Modifier" : "Retour"}
            </Button>

            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <Button onClick={goNext} className="gap-1.5">
                {step === 2 ? "Calculer" : "Suivant"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="w-24" />
            )}
          </div>
        </Card>}

      </main>
      <Footer />
    </div>
  );
}
