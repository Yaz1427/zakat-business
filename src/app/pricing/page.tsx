"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe-plans";
import {
  CheckCircle,
  ArrowRight,
  Receipt,
  ShieldCheck,
  Star,
  Loader2,
  Building2,
  Briefcase,
  X,
} from "lucide-react";

const FREE_FEATURES = [
  "1 calcul par an",
  "Récapitulatif en ligne",
  "Méthode AAOIFI",
];

const PLAN_ICONS: Record<string, React.ElementType> = {
  pro: Briefcase,
  cabinet: Building2,
};

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    if (!isSignedIn) return;
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      router.push(url);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-[#F9F8F6] dark:bg-background border-b border-border/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(152,55%,25%,0.08),transparent)]" />
          <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-3 py-1.5 rounded-full mb-5">
              <Receipt className="h-3.5 w-3.5" />
              Déductible des frais professionnels
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tarifs simples et transparents
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              Abonnement annuel. Accès à vie aux archives de vos rapports payés, même après expiration.
            </p>
          </div>
        </section>

        {/* Plans grid */}
        <section className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Free */}
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-7 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gratuit</p>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-4xl font-bold">0 €</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">Pour toujours</p>
              </div>
              <p className="text-sm text-muted-foreground">Pour découvrir la plateforme.</p>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-muted-foreground/50">
                  <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Certificats PDF
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground/50">
                  <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Historique & archives
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/calculate">Commencer gratuitement</Link>
              </Button>
            </div>

            {/* Paid plans */}
            {PLANS.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] ?? Briefcase;
              const isLoading = loading === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 space-y-6 relative ${
                    plan.highlight
                      ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border border-border bg-white dark:bg-card"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${plan.highlight ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
                    </div>
                    <div className="flex items-end gap-1.5 mt-2">
                      <span className="text-4xl font-bold">{plan.price} €</span>
                      <span className="text-muted-foreground text-sm mb-1.5">/an</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">{plan.description}</p>
                  </div>

                  {/* Déductible badge on highlight plan */}
                  {plan.highlight && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2">
                      <Receipt className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Déductible des frais professionnels
                      </span>
                    </div>
                  )}

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isLoaded && isSignedIn ? (
                    <Button
                      className={`w-full gap-2 ${plan.highlight ? "shadow-sm shadow-primary/20" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Redirection…</>
                      ) : (
                        <>Choisir {plan.name}<ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </Button>
                  ) : isLoaded ? (
                    <SignInButton mode="redirect">
                      <Button className="w-full gap-2" variant={plan.highlight ? "default" : "outline"}>
                        Se connecter pour souscrire
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button className="w-full" disabled variant="outline">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            {[
              { Icon: ShieldCheck, label: "Paiement sécurisé Stripe" },
              { Icon: Star, label: "Conforme AAOIFI" },
              { Icon: Receipt, label: "Facture TVA disponible" },
              { Icon: CheckCircle, label: "Archives à vie incluses" },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ rapide */}
        <section className="bg-muted/30 dark:bg-muted/10 py-14 border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-6 max-w-2xl space-y-5">
            <h2 className="text-lg font-bold text-center mb-6">Questions sur l&apos;abonnement</h2>
            {[
              {
                q: "L'abonnement est-il déductible fiscalement ?",
                a: "Oui. En tant qu'outil professionnel, ZakatBiz est déductible de vos charges d'exploitation (BIC/BNC). Une facture Stripe est automatiquement générée.",
              },
              {
                q: "Que se passe-t-il si je ne renouvelle pas ?",
                a: "Vous perdez l'accès aux nouvelles fonctionnalités Pro, mais conservez à vie l'accès aux archives de tous vos rapports déjà générés.",
              },
              {
                q: "Le plan Cabinet permet-il plusieurs entreprises ?",
                a: "Oui, il est conçu pour les experts-comptables gérant plusieurs mandants. Chaque dossier est isolé avec son propre historique.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-card rounded-xl border border-border/60 px-5 py-4 space-y-1.5">
                <p className="font-semibold text-sm">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
