"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanGateProps {
  children: React.ReactNode;
  isPro: boolean;
  feature?: string;
  blur?: boolean;
  compact?: boolean;
}

export default function PlanGate({ children, isPro, feature, blur = true, compact = false }: PlanGateProps) {
  if (isPro) return <>{children}</>;

  if (compact) {
    return (
      <Button asChild variant="outline" size="sm" className="gap-1.5 text-muted-foreground border-dashed">
        <Link href="/pricing">
          <Lock className="h-3.5 w-3.5" />
          {feature ?? "Pro"}
        </Link>
      </Button>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {blur && (
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="opacity-30 blur-sm">{children}</div>
        </div>
      )}
      <div className={`${blur ? "absolute inset-0" : ""} flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-xl border border-primary/20 px-6 py-8 text-center gap-4`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <p className="font-semibold text-sm">Fonctionnalité Pro</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {feature
              ? <>Débloquez <strong>{feature}</strong> avec le plan Pro.</>
              : <>Débloquez votre certificat officiel et votre optimisation fiscale.</>}
          </p>
        </div>
        <Button asChild size="sm" className="gap-2 shadow-sm shadow-primary/20">
          <Link href="/pricing">
            Passer à Pro — 49 €/an
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
