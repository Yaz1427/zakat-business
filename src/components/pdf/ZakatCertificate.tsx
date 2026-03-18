import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    padding: 48,
    fontSize: 10,
    color: "#1a1a1a",
  },
  // Header
  header: {
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: "#1a472a",
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  logoBlock: { flexDirection: "column" },
  logoText: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#1a472a", letterSpacing: 1 },
  logoSub: { fontSize: 8, color: "#666", marginTop: 3, letterSpacing: 0.5 },
  certLabel: { fontSize: 8, color: "#888", textAlign: "right" },
  certNumber: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a472a", textAlign: "right", marginTop: 2 },

  // Title
  titleBlock: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1a1a1a", textAlign: "center", letterSpacing: 0.5 },
  titleSub: { fontSize: 9, color: "#666", textAlign: "center", marginTop: 4 },

  // Info section
  infoRow: { flexDirection: "row", marginBottom: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: "#f8f8f6",
    borderRadius: 4,
    padding: 10,
    marginRight: 8,
  },
  infoCardLast: { marginRight: 0 },
  infoKey: { fontSize: 7, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  infoValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a472a",
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 2,
    marginTop: 16,
  },
  tableHeaderText: { fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
  tableHeaderRight: { marginLeft: "auto", fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold" },

  sectionBg: { backgroundColor: "#f0f7f4", paddingVertical: 5, paddingHorizontal: 10, marginBottom: 1 },
  sectionBgRed: { backgroundColor: "#fdf2f2", paddingVertical: 5, paddingHorizontal: 10, marginBottom: 1 },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#1a472a", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionLabelRed: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#c53030", textTransform: "uppercase", letterSpacing: 0.5 },

  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: "#e8e8e8" },
  tableRowBold: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 10, backgroundColor: "#f0f7f4", borderTopWidth: 1, borderTopColor: "#1a472a" },
  tableLabel: { fontSize: 9, color: "#444", flex: 1 },
  tableLabelBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1a1a", flex: 1 },
  tableValue: { fontSize: 9, color: "#444", textAlign: "right" },
  tableValueBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a472a", textAlign: "right" },
  tableValueRed: { fontSize: 9, color: "#c53030", textAlign: "right" },

  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 14 },

  // Zakat result box
  zakatBox: {
    borderWidth: 2,
    borderColor: "#1a472a",
    borderRadius: 6,
    padding: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  zakatBoxLeft: {},
  zakatLabel: { fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  zakatRate: { fontSize: 9, color: "#1a472a" },
  zakatAmount: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#1a472a" },
  zakatCurrency: { fontSize: 12, color: "#1a472a" },
  nisabLine: { fontSize: 8, color: "#666", marginTop: 4 },

  // Compliance
  complianceBox: {
    marginTop: 20,
    backgroundColor: "#f8f8f6",
    borderLeftWidth: 3,
    borderLeftColor: "#1a472a",
    padding: 10,
    borderRadius: 2,
  },
  complianceText: { fontSize: 8, color: "#444", lineHeight: 1.5 },
  complianceBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1a472a" },

  // Methodology page
  methodSection: { marginBottom: 16 },
  methodTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a472a", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#d0e8da", paddingBottom: 4 },
  methodText: { fontSize: 8.5, color: "#444", lineHeight: 1.6 },
  methodStep: { flexDirection: "row", gap: 6, marginBottom: 5 },
  methodStepNum: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1a472a", width: 14 },
  methodStepText: { fontSize: 8, color: "#444", flex: 1, lineHeight: 1.5 },
  formulaBox: { backgroundColor: "#f0f7f4", borderRadius: 4, padding: 10, marginVertical: 10, borderLeftWidth: 2, borderLeftColor: "#1a472a" },
  formulaText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a472a" },
  formulaSub: { fontSize: 7.5, color: "#666", marginTop: 3 },

  // Signature block
  signatureBlock: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#999",
    paddingTop: 6,
  },
  signatureLabel: { fontSize: 7, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 },
  signatureValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1a1a1a", marginTop: 2 },
  signatureSub: { fontSize: 7, color: "#aaa", marginTop: 1 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#999" },
  footerBrand: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#1a472a" },

  // Pro badge strip
  proBadge: {
    backgroundColor: "#1a472a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  proBadgeText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 0.8 },
});

export interface CertificateData {
  companyName: string;
  year: number;
  cash: number;
  stocks: number;
  receivables: number;
  supplierDebts: number;
  taxDebts: number;
  salaryDebts: number;
  totalAssets: number;
  totalDebts: number;
  zakatableBase: number;
  nisabValue: number;
  meetsNisab: boolean;
  finalZakat: number;
  goldPriceEur: number;
  certNumber: string;
  issuedAt: string;
}

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function ZakatCertificateDoc({ data }: { data: CertificateData }) {
  return (
    <Document
      title={`Attestation Zakat ${data.companyName} ${data.year}`}
      author="ZakatBiz"
      subject="Attestation de calcul Zakat entreprise"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBlock}>
            <Text style={styles.logoText}>ZakatBiz</Text>
            <Text style={styles.logoSub}>Finance Islamique · Conformité AAOIFI</Text>
          </View>
          <View>
            <Text style={styles.certLabel}>N° DE CERTIFICAT</Text>
            <Text style={styles.certNumber}>{data.certNumber}</Text>
            <Text style={[styles.certLabel, { marginTop: 4 }]}>Émis le {data.issuedAt}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>ATTESTATION DE ZAKAT ENTREPRISE</Text>
          <Text style={styles.titleSub}>Méthode du Capital Circulant Net — Normes AAOIFI</Text>
        </View>

        {/* ── Company info cards ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoKey}>Entreprise</Text>
            <Text style={styles.infoValue}>{data.companyName}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoKey}>Exercice fiscal</Text>
            <Text style={styles.infoValue}>{data.year}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardLast]}>
            <Text style={styles.infoKey}>Prix de l&apos;or (€/g)</Text>
            <Text style={styles.infoValue}>{data.goldPriceEur.toFixed(2)} €</Text>
          </View>
        </View>

        {/* ── Calculation table ── */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>DÉTAIL DU CALCUL</Text>
          <Text style={styles.tableHeaderRight}>Montant (EUR)</Text>
        </View>

        <View style={styles.sectionBg}>
          <Text style={styles.sectionLabel}>Actifs zakatable</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Trésorerie &amp; liquidités</Text>
          <Text style={styles.tableValue}>{formatEur(data.cash)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Stocks (valeur de revente)</Text>
          <Text style={styles.tableValue}>{formatEur(data.stocks)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Créances clients</Text>
          <Text style={styles.tableValue}>{formatEur(data.receivables)}</Text>
        </View>
        <View style={styles.tableRowBold}>
          <Text style={styles.tableLabelBold}>Total actifs zakatable</Text>
          <Text style={styles.tableValueBold}>{formatEur(data.totalAssets)}</Text>
        </View>

        <View style={[styles.sectionBgRed, { marginTop: 4 }]}>
          <Text style={styles.sectionLabelRed}>Passifs déductibles</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Dettes fournisseurs</Text>
          <Text style={styles.tableValueRed}>− {formatEur(data.supplierDebts)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Taxes &amp; impôts dus</Text>
          <Text style={styles.tableValueRed}>− {formatEur(data.taxDebts)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Salaires &amp; charges à payer</Text>
          <Text style={styles.tableValueRed}>− {formatEur(data.salaryDebts)}</Text>
        </View>
        <View style={[styles.tableRowBold, { backgroundColor: "#fdf2f2" }]}>
          <Text style={styles.tableLabelBold}>Total passifs déductibles</Text>
          <Text style={[styles.tableValueBold, { color: "#c53030" }]}>− {formatEur(data.totalDebts)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Assiette */}
        <View style={[styles.tableRowBold, { backgroundColor: "#f8f8f6", borderTopColor: "#666", marginBottom: 2 }]}>
          <Text style={[styles.tableLabelBold, { fontSize: 10 }]}>Assiette Zakat (Capital Circulant Net)</Text>
          <Text style={[styles.tableValueBold, { fontSize: 10 }]}>{formatEur(data.zakatableBase)}</Text>
        </View>

        {/* ── Zakat result ── */}
        <View style={styles.zakatBox}>
          <View style={styles.zakatBoxLeft}>
            <Text style={styles.zakatLabel}>
              {data.meetsNisab ? "ZAKAT OBLIGATOIRE — NISAB ATTEINT" : "NISAB NON ATTEINT"}
            </Text>
            <Text style={styles.zakatRate}>
              {data.meetsNisab ? "Assiette × 2,5% = Zakat due" : "Assiette inférieure au seuil Nisab"}
            </Text>
            <Text style={styles.nisabLine}>Seuil Nisab : {formatEur(data.nisabValue)} (85g × {data.goldPriceEur.toFixed(2)} €/g)</Text>
          </View>
          <View>
            <Text style={styles.zakatAmount}>{formatEur(data.finalZakat)}</Text>
            <Text style={[styles.certLabel, { textAlign: "right", marginTop: 2 }]}>Zakat due</Text>
          </View>
        </View>

        {/* ── Compliance mention ── */}
        <View style={styles.complianceBox}>
          <Text style={styles.complianceBold}>Calcul conforme aux normes de la finance islamique (AAOIFI)</Text>
          <Text style={[styles.complianceText, { marginTop: 4 }]}>
            Ce document est une attestation de calcul de la Zakat entreprise établie selon la méthode du Capital Circulant Net (Net Working Capital),
            conforme aux normes de l&apos;AAOIFI (Accounting and Auditing Organisation for Islamic Financial Institutions).
            Ce calcul est basé sur les données déclarées par l&apos;entreprise. Pour une validation religieuse définitive,
            consultez un expert en finance islamique qualifié.
          </Text>
        </View>

        {/* ── Signature block ── */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Représentant légal</Text>
            <Text style={styles.signatureValue}>{data.companyName}</Text>
            <Text style={styles.signatureSub}>Signature électronique via ZakatBiz</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Date de génération</Text>
            <Text style={styles.signatureValue}>{data.issuedAt}</Text>
            <Text style={styles.signatureSub}>Document certifié · {data.certNumber}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Plateforme</Text>
            <Text style={styles.signatureValue}>ZakatBiz Pro</Text>
            <Text style={styles.signatureSub}>zakatbiz.com · AAOIFI</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} ZakatBiz · Finance Islamique</Text>
          <Text style={styles.footerBrand}>zakatbiz.com</Text>
          <Text style={styles.footerText}>{data.certNumber} · Page 1/2</Text>
        </View>
      </Page>

      {/* ── Page 2: Methodology & Audit Trail ── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: 20 }]}>
          <View style={styles.logoBlock}>
            <Text style={styles.logoText}>ZakatBiz</Text>
            <Text style={styles.logoSub}>Rapport d&apos;Audit & Méthodologie</Text>
          </View>
          <View>
            <View style={styles.proBadge}><Text style={styles.proBadgeText}>CERTIFIÉ PRO</Text></View>
            <Text style={styles.certNumber}>{data.certNumber}</Text>
          </View>
        </View>

        {/* Methodology */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>1. Méthodologie utilisée</Text>
          <Text style={styles.methodText}>
            Ce calcul utilise la méthode du Capital Circulant Net (Net Working Capital Method), telle que définie
            par l&apos;AAOIFI dans son standard FAS 9 relatif à la Zakat. Cette méthode est la référence internationale
            en matière de Zakat des sociétés commerciales.
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>Assiette Zakat = Actifs Circulants Zakatable - Passifs Circulants Déductibles</Text>
            <Text style={styles.formulaSub}>Si Assiette ≥ Nisab (85g × cours de l&apos;or) → Zakat = Assiette × 2,5%</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>2. Étapes du calcul</Text>
          {[
            ["1", "Identification des actifs zakatable : trésorerie, stocks à la valeur de revente, créances clients recouvrables."],
            ["2", "Déduction des passifs circulants : dettes fournisseurs, taxes exigibles, salaires et charges à payer."],
            ["3", "Calcul du Capital Circulant Net (CCN = Actifs - Passifs)."],
            ["4", "Vérification du Nisab : le CCN doit être supérieur ou égal à la valeur de 85 grammes d&apos;or."],
            ["5", "Application du taux de Zakat : 2,5% sur le CCN si le Nisab est atteint."],
          ].map(([n, t]) => (
            <View key={n} style={styles.methodStep}>
              <Text style={styles.methodStepNum}>{n}.</Text>
              <Text style={styles.methodStepText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Audit trail */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>3. Piste d&apos;audit</Text>
          {[
            ["Entreprise", data.companyName],
            ["Exercice fiscal", String(data.year)],
            ["N° certificat", data.certNumber],
            ["Date d&apos;émission", data.issuedAt],
            ["Cours de l&apos;or appliqué", `${data.goldPriceEur.toFixed(2)} €/g (source : marché)`],
            ["Seuil Nisab calculé", `${formatEur(data.nisabValue)} (85g × ${data.goldPriceEur.toFixed(2)} €)`],
            ["Nisab atteint", data.meetsNisab ? "OUI" : "NON"],
            ["Taux appliqué", data.meetsNisab ? "2,5%" : "0% (exonéré)"],
            ["Zakat calculée", formatEur(data.finalZakat)],
            ["Plateforme", "ZakatBiz Pro · zakatbiz.com"],
          ].map(([k, v]) => (
            <View key={k} style={styles.tableRow}>
              <Text style={[styles.tableLabel, { color: "#666", flex: 0.7 }]}>{k}</Text>
              <Text style={[styles.tableValue, { flex: 1, textAlign: "left", fontFamily: "Helvetica-Bold", color: "#1a1a1a" }]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Fiscal note */}
        <View style={[styles.complianceBox, { borderLeftColor: "#2563eb", backgroundColor: "#eff6ff" }]}>
          <Text style={[styles.complianceBold, { color: "#1d4ed8" }]}>
            Note fiscale — Déductibilité des frais professionnels
          </Text>
          <Text style={[styles.complianceText, { marginTop: 3 }]}>
            En France, les dons versés à des organismes reconnus d&apos;utilité publique ouvrent droit à une réduction d&apos;impôt
            de 60% (sociétés soumises à l&apos;IS) ou 66% (personnes physiques soumises à l&apos;IR), dans les limites prévues
            par les articles 200 et 238 bis du CGI. Conservez ce certificat comme justificatif. Consultez votre expert-comptable
            pour la déductibilité applicable à votre situation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} ZakatBiz · Finance Islamique</Text>
          <Text style={styles.footerBrand}>zakatbiz.com</Text>
          <Text style={styles.footerText}>{data.certNumber} · Page 2/2</Text>
        </View>
      </Page>
    </Document>
  );
}
