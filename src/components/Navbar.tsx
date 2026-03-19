"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Star, LogIn, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`text-sm transition-colors hover:text-foreground ${
        pathname === href ? "text-foreground font-medium" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Star className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Zakat</span>
          <Badge variant="gold" className="text-[10px] px-1.5 py-0">Business</Badge>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {(["/#arguments", "/pricing", "/#faq"] as const).map((href, i) => {
            const labels = ["Fonctionnement", "Tarifs", "FAQ"];
            const isActive = href.startsWith("/") && !href.startsWith("/#") && pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors hover:text-foreground hover:bg-muted/60 ${
                  isActive ? "text-foreground font-medium bg-muted/40" : "text-muted-foreground"
                }`}
              >
                {labels[i]}
              </Link>
            );
          })}
          <SignedIn>
            <div className="w-px h-4 bg-border mx-2" />
            <Link
              href="/dashboard/history"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors hover:text-foreground hover:bg-muted/60 ${
                pathname?.startsWith("/dashboard") ? "text-foreground font-medium bg-muted/40" : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Mon espace
            </Link>
          </SignedIn>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <SignedOut>
            <SignInButton mode="redirect">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <LogIn className="h-3.5 w-3.5" />
                Connexion
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          </SignedIn>

          <Button asChild size="sm" className="gap-1.5">
            <Link href="/calculateur">
              <Calculator className="h-3.5 w-3.5" />
              Calculer
            </Link>
          </Button>
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background px-4 py-4 flex flex-col gap-3">
          <Link
            href="/#arguments"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Fonctionnement
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Tarifs
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            FAQ
          </Link>
          <SignedIn>
            <Link
              href="/dashboard/history"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              Mon espace
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="redirect">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1 w-full"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </button>
            </SignInButton>
          </SignedOut>
          <div className="pt-1">
            <Button asChild size="sm" className="w-full gap-1.5">
              <Link href="/calculateur" onClick={() => setMobileOpen(false)}>
                <Calculator className="h-3.5 w-3.5" />
                Calculer ma Zakat
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
