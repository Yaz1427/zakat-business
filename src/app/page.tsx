import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const ARGUMENTS = [
  {
    Icon: ShieldCheck,
    title: "Conformité religieuse",
    description:
      "Calcul basé sur la méthode du Capital Circulant Net, conforme aux normes AAOIFI — l'organisme de référence mondial en finance islamique.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    Icon: Lock,
    title: "Sécurité bancaire",
    description:
      "Vos données financières restent strictement confidentielles. Authentification par Magic Link, aucun mot de passe, aucun partage tiers.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    Icon: FileCheck2,
    title: "Rapport certifié pour votre compta",
    description:
      "Générez une attestation PDF officielle avec numéro de certificat unique — prête pour votre expert-comptable ou votre dossier RSE.",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
];

const STEPS = [
  { n: "01", label: "Vos actifs", detail: "Trésorerie, stocks, créances clients" },
  { n: "02", label: "Vos passifs", detail: "Dettes fournisseurs, taxes, salaires" },
  { n: "03", label: "Votre Zakat", detail: "Calcul précis + attestation téléchargeable" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#F9F8F6] dark:bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,hsl(152,55%,25%,0.10),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">

          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3 w-3" />
            Normes AAOIFI · Finance Islamique
          </div>

          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight leading-tight sm:text-5xl md:text-[3.5rem]">
            Calculez la Zakat de votre entreprise{" "}
            <span className="text-primary">en 3 minutes</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            Un outil sérieux, confidentiel et conforme aux normes islamiques — conçu pour les
            chefs d&apos;entreprise qui veulent honorer leur obligation religieuse avec précision.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base font-semibold gap-2 shadow-md shadow-primary/20">
              <Link href="/calculate">
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-12 px-7 text-base text-muted-foreground gap-2" asChild>
              <Link href="#arguments">
                En savoir plus
              </Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            {[
              { Icon: CheckCircle, label: "Aucun mot de passe" },
              { Icon: CheckCircle, label: "Magic Link sécurisé" },
              { Icon: CheckCircle, label: "Données chiffrées" },
              { Icon: CheckCircle, label: "Conforme AAOIFI" },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Arguments ── */}
      <section id="arguments" className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Pourquoi ZakatBiz
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Trois engagements pour votre sérénité
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {ARGUMENTS.map(({ Icon, title, description, color, bg, border }) => (
            <Card key={title} className={`border ${border} bg-white dark:bg-card hover:shadow-md transition-shadow`}>
              <CardContent className="p-6 space-y-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} border ${border}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-muted/30 dark:bg-muted/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              3 étapes simples
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Simple comme un bilan comptable
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex md:flex-col items-center md:flex-1 gap-4 md:gap-3 md:text-center relative py-4 md:py-0">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <>
                    <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-border" />
                    <div className="md:hidden absolute left-5 top-full w-px h-4 bg-border" />
                  </>
                )}
                <div className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild className="gap-2 h-12 px-8 text-base font-semibold">
              <Link href="/calculate">
                <Clock className="h-4 w-4" />
                Commencer — moins de 3 minutes
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section id="tarifs" className="container mx-auto px-4 sm:px-6 py-20 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Tarification</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Simple et transparent</h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
            Commencez gratuitement. Passez à Pro pour vos attestations PDF certifiées.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-white dark:bg-card p-7 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gratuit</p>
              <p className="text-4xl font-bold mt-2">0 €</p>
              <p className="text-xs text-muted-foreground mt-1">Pour toujours</p>
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["1 calcul par an", "Récapitulatif en ligne", "Méthode AAOIFI"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/calculate">Commencer</Link>
            </Button>
          </div>
          {/* Pro */}
          <div className="rounded-2xl border-2 border-primary bg-primary/5 p-7 space-y-5 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                Populaire
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pro</p>
              <p className="text-4xl font-bold mt-2">49 €<span className="text-lg font-normal text-muted-foreground">/an</span></p>
              <p className="text-xs text-muted-foreground mt-1">Par entreprise · déductible</p>
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Calculs illimités",
                "Certificats PDF numérotés",
                "Historique complet & archives à vie",
                "Garantie de conformité AAOIFI & Rapport d'audit détaillé",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full gap-2 shadow-sm shadow-primary/20">
              <Link href="/pricing">
                Souscrire au plan Pro
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {/* Cabinet */}
          <div className="rounded-2xl border border-border bg-white dark:bg-card p-7 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cabinet</p>
              <p className="text-4xl font-bold mt-2">199 €<span className="text-lg font-normal text-muted-foreground">/an</span></p>
              <p className="text-xs text-muted-foreground mt-1">Experts-comptables · multi-entreprises</p>
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Tout le plan Pro",
                "Accès multi-entreprises illimité",
                "Rapports PDF co-brandés",
                "Support dédié & onboarding",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/pricing">
                Voir le plan Cabinet
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-muted/30 dark:bg-muted/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">FAQ</p>
            <h2 className="text-2xl font-bold tracking-tight">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Quelle méthode de calcul est utilisée ?",
                a: "Nous utilisons la méthode du Capital Circulant Net (CCN), conforme aux normes AAOIFI — l'organisme international de référence en finance islamique.",
              },
              {
                q: "Mes données financières sont-elles sécurisées ?",
                a: "Oui. Vos données sont chiffrées, stockées en Europe, et ne sont jamais partagées avec des tiers. Chaque calcul est strictement lié à votre compte.",
              },
              {
                q: "L'attestation PDF est-elle reconnue ?",
                a: "Notre attestation est un document de support pour votre expert-comptable ou dossier RSE. Pour une validation religieuse officielle, consultez un érudit qualifié.",
              },
              {
                q: "Puis-je calculer la Zakat pour plusieurs entreprises ?",
                a: "Oui, avec le plan Pro vous pouvez effectuer des calculs illimités et gérer l'historique de chaque entité séparément.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-card rounded-xl border border-border/60 px-5 py-4 space-y-2">
                <p className="font-semibold text-sm">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="mx-auto max-w-lg space-y-5">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Star className="h-7 w-7 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Votre obligation, calculée avec précision.
          </h2>
          <p className="text-muted-foreground">
            Rejoignez les chefs d&apos;entreprise qui font confiance à ZakatBiz
            pour honorer leur devoir religieux en toute sérénité.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold gap-2 shadow-md shadow-primary/20">
            <Link href="/calculate">
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
