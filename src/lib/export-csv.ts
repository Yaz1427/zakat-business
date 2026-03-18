import type { CertificateData } from "@/components/pdf/ZakatCertificate";

function esc(v: string | number): string {
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportCalculationCSV(data: CertificateData): void {
  const rows: [string, string | number][] = [
    ["Entreprise", data.companyName],
    ["Exercice fiscal", data.year],
    ["N° Certificat", data.certNumber],
    ["Date d'émission", data.issuedAt],
    ["", ""],
    ["=== ACTIFS ZAKATABLE ===", ""],
    ["Trésorerie & liquidités (€)", data.cash],
    ["Stocks (valeur de revente) (€)", data.stocks],
    ["Créances clients (€)", data.receivables],
    ["Total actifs zakatable (€)", data.totalAssets],
    ["", ""],
    ["=== PASSIFS DÉDUCTIBLES ===", ""],
    ["Dettes fournisseurs (€)", data.supplierDebts],
    ["Taxes & impôts (€)", data.taxDebts],
    ["Salaires & charges (€)", data.salaryDebts],
    ["Total passifs déductibles (€)", data.totalDebts],
    ["", ""],
    ["=== RÉSULTAT ===", ""],
    ["Assiette Zakat - Capital Circulant Net (€)", data.zakatableBase],
    ["Seuil Nisab (€)", data.nisabValue],
    ["Nisab atteint", data.meetsNisab ? "OUI" : "NON"],
    ["Taux Zakat appliqué (%)", data.meetsNisab ? "2.5" : "0"],
    ["Zakat due (€)", data.finalZakat],
    ["", ""],
    ["Cours de l'or utilisé (€/g)", data.goldPriceEur],
    ["Méthode", "Capital Circulant Net (AAOIFI)"],
    ["Source", "ZakatBiz · zakatbiz.com"],
  ];

  const csv = rows.map(([k, v]) => `${esc(k)},${esc(v)}`).join("\r\n");
  const bom = "\uFEFF"; // UTF-8 BOM for Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zakat-${data.companyName.replace(/\s+/g, "-")}-${data.year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
