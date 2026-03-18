import { SignIn } from "@clerk/nextjs";
import { Star, ShieldCheck, FileCheck2, Lock, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none p-0 bg-transparent w-full",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "hidden",
    dividerRow: "hidden",
    dividerText: "hidden",
    formFieldLabel: "text-sm font-medium text-foreground mb-1.5 block",
    formFieldInput:
      "w-full border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/60 text-sm h-11 px-4 transition-colors",
    formButtonPrimary:
      "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 text-sm transition-colors shadow-sm shadow-primary/20",
    footerActionLink: "text-primary hover:text-primary/80 font-medium text-sm",
    footerActionText: "text-muted-foreground text-sm",
    identityPreviewText: "text-foreground text-sm",
    identityPreviewEditButtonIcon: "text-primary",
    formResendCodeLink: "text-primary hover:text-primary/80 text-sm font-medium",
    otpCodeFieldInput:
      "border border-border rounded-xl bg-background text-foreground text-center text-xl font-mono w-11 h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/60",
    alertText: "text-sm",
    formFieldSuccessText: "text-primary text-sm",
    formFieldErrorText: "text-destructive text-sm",
    footer: "hidden",
  },
};

const PERKS = [
  { icon: Lock, text: "Magic Link — aucun mot de passe à retenir" },
  { icon: ShieldCheck, text: "Données chiffrées et confidentielles" },
  { icon: FileCheck2, text: "Attestation PDF téléchargeable à vie" },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branded panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 bg-[#0f2e1c] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_100%,rgba(45,122,79,0.35),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Star className="h-4.5 w-4.5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-white">Zakat</span>
          <span className="text-xs font-bold bg-white/15 text-white/80 px-2 py-0.5 rounded-full">Business</span>
        </Link>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <p className="text-primary/80 text-sm font-semibold uppercase tracking-widest">
              Conforme AAOIFI · Finance Islamique
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Calculez votre Zakat<br />
              <span className="text-primary">en toute sérénité.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Un outil sérieux conçu pour les chefs d&apos;entreprise qui souhaitent
              honorer leur obligation religieuse avec précision et confidentialité.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-white/75 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs leading-relaxed">
            &ldquo;La Zakat est l&apos;un des cinq piliers de l&apos;Islam.
            Notre outil vous aide à la calculer selon les normes AAOIFI en vigueur.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 h-16 border-b border-border/50">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Star className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-bold text-base">ZakatBiz</span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
          <div className="w-full max-w-sm space-y-7">
            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Entrez votre e-mail pour recevoir un{" "}
                <span className="font-medium text-foreground">lien de connexion instantané</span>
                {" "}— aucun mot de passe.
              </p>
            </div>

            {/* Clerk SignIn */}
            <SignIn appearance={clerkAppearance} />

            {/* Trust note */}
            <div className="flex items-start gap-2.5 bg-muted/40 rounded-xl px-4 py-3 border border-border/50">
              <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vos données financières sont chiffrées et ne sont jamais partagées
                avec des tiers.
              </p>
            </div>

            {/* Legal links */}
            <p className="text-center text-[11px] text-muted-foreground/60">
              En vous connectant, vous acceptez nos{" "}
              <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                CGU
              </Link>{" "}
              et notre{" "}
              <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                politique de confidentialité
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
