"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ZakatFormStepper from "@/components/ZakatFormStepper";
import ZakatResults from "@/components/ZakatResults";
import { calculateZakat, type ZakatInputs, type ZakatResult } from "@/lib/zakatEngine";

export default function CalculateurPage() {
  const [result, setResult] = useState<ZakatResult | null>(null);

  function handleCalculate(inputs: ZakatInputs) {
    const r = calculateZakat(inputs);
    setResult(r);
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
        {result ? (
          <ZakatResults result={result} onReset={handleReset} />
        ) : (
          <ZakatFormStepper onComplete={handleCalculate} />
        )}
      </main>

      <footer className="border-t border-border/40 mt-12 py-5">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Ce calcul est une estimation basée sur les données fournies et les normes AAOIFI.
            Pour une validation religieuse finale, consultez un expert en finance islamique qualifié.
            Zakat Business ne saurait être tenu responsable des décisions prises sur la base de ces estimations.
          </p>
        </div>
      </footer>
    </div>
  );
}
