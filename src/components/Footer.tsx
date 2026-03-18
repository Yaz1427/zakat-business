import Link from "next/link";
import { Star } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-[#F9F8F6] dark:bg-muted/10 py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-bold text-sm">ZakatBiz</span>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-sm">
            Estimation basée sur les normes AAOIFI · Pour usage indicatif.
            Consultez un expert en finance islamique pour une validation finale.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">CGU</Link>
            <span className="text-border">·</span>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <span className="text-border">·</span>
            <Link href="/legal/disclaimer" className="hover:text-foreground transition-colors">Décharge religieuse</Link>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 text-center text-[10px] text-muted-foreground/50">
          © {new Date().getFullYear()} ZakatBiz · Finance Islamique · Calculs basés sur les normes AAOIFI
        </div>
      </div>
    </footer>
  );
}
