"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
  LayoutDashboard,
  Star,
  UserCheck,
  Clock,
  ShieldCheck,
  Receipt,
  ChevronRight,
} from "lucide-react";

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  pro: { name: "Pro", color: "text-primary" },
  cabinet: { name: "Cabinet", color: "text-violet-600" },
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "pro";
  const sessionId = searchParams.get("session_id");
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.pro;

  return (
    <div className="flex-1 container mx-auto px-4 sm:px-6 py-16 max-w-2xl">
      {/* Main confirmation card */}
      <div className="rounded-2xl border border-primary/20 bg-white dark:bg-card shadow-lg shadow-primary/5 p-8 text-center space-y-6 mb-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md">
              <Star className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Bienvenue dans ZakatBiz{" "}
            <span className={planMeta.color}>{planMeta.name}</span> !
          </h1>
          <p className="text-muted-foreground text-sm">
            Votre abonnement est actif. Toutes vos fonctionnalités sont débloquées.
          </p>
          {sessionId && (
            <p className="text-[11px] text-muted-foreground/60 font-mono">
              Réf : {sessionId.slice(0, 28)}…
            </p>
          )}
        </div>

        {/* What's unlocked */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {[
            { Icon: ShieldCheck, label: "Certificats PDF", sub: "numérotés & signés" },
            { Icon: LayoutDashboard, label: "Historique complet", sub: "archives à vie" },
            { Icon: Receipt, label: "Facture disponible", sub: "déductible fiscalement" },
          ].map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/50">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1 gap-2 h-11">
            <Link href="/calculateur">
              Calculer ma Zakat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2 h-11">
            <Link href="/dashboard/history">
              <LayoutDashboard className="h-4 w-4" />
              Mon espace
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Expert upsell card ── */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-violet-50/60 to-background dark:from-violet-950/20 dark:to-background p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700">
              <UserCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-sm">Vérification par un expert</p>
                <span className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                  Nouveau
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Un expert en finance islamique certifié AAOIFI relit votre calcul
                et appose sa validation sur votre certificat.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold">50 €</p>
            <p className="text-[10px] text-muted-foreground">paiement unique</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { Icon: Clock, text: "Réponse sous 48h ouvrées" },
            { Icon: ShieldCheck, text: "Validation AAOIFI officielle" },
            { Icon: Receipt, text: "Rapport d'audit PDF inclus" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-400"
          disabled
        >
          Ajouter la vérification experte — 50 €
          <ChevronRight className="h-4 w-4" />
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">(Bientôt disponible)</span>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
