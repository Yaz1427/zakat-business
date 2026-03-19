import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Suspense } from "react";
import ProgressBar from "@/components/ProgressBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://zakatbusiness.com"),
  title: "Zakat Business | Calculateur de Zakat pour Entreprises",
  description:
    "Calculez la Zakat de votre entreprise avec précision selon les normes AAOIFI. Solution SaaS conforme aux écoles juridiques islamiques.",
  keywords: ["Zakat", "Entreprise", "AAOIFI", "Islam", "Finance", "Calcul", "SaaS"],
  authors: [{ name: "Zakat Business" }],
  creator: "Zakat Business",
  publisher: "Zakat Business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://zakatbusiness.com",
    siteName: "Zakat Business",
    title: "Zakat Business | Calculateur de Zakat pour Entreprises",
    description:
      "Calculez la Zakat de votre entreprise avec précision selon les normes AAOIFI. Solution SaaS conforme aux écoles juridiques islamiques.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zakat Business Calculateur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakat Business | Calculateur de Zakat pour Entreprises",
    description:
      "Calculez la Zakat de votre entreprise avec précision selon les normes AAOIFI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://zakatbusiness.com",
  },
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
