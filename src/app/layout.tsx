import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Suspense } from "react";
import ProgressBar from "@/components/ProgressBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zakat Business | Calculateur de Zakat pour Entreprises",
  description:
    "Calculez la Zakat de votre entreprise avec précision selon les normes AAOIFI. Solution SaaS conforme aux écoles juridiques islamiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>
          <Suspense><ProgressBar /></Suspense>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
