import { SignUp } from "@clerk/nextjs";
import { Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-border rounded-xl p-0 bg-transparent w-full",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "hidden",
    socialButtonsBlockButtonText: "hidden",
    socialButtonsProviderIcon: "hidden",
    dividerRow: "hidden",
    dividerText: "hidden",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm h-10 px-3",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg h-10 text-sm w-full transition-colors",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground text-sm",
    identityPreviewText: "text-foreground",
    identityPreviewEditButtonIcon: "text-primary",
    formResendCodeLink: "text-primary hover:text-primary/80",
    otpCodeFieldInput:
      "border border-border rounded-lg bg-background text-foreground text-center text-lg font-mono focus:ring-2 focus:ring-primary",
    alertText: "text-sm",
    formFieldSuccessText: "text-primary text-sm",
    formFieldErrorText: "text-destructive text-sm",
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/95 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Star className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Zakat Business</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Créer votre espace</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Inscrivez-vous avec votre adresse e-mail professionnelle.
              Aucun mot de passe, aucune donnée superflue.
            </p>
          </div>

          <SignUp appearance={clerkAppearance} />

          <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">Pourquoi e-mail uniquement ?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Aucun compte réseau social requis</li>
              <li>• Connexion par lien sécurisé (Magic Link)</li>
              <li>• Données financières strictement confidentielles</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
