"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZakatCertificateDoc, type CertificateData } from "./ZakatCertificate";

interface Props {
  data: CertificateData;
  className?: string;
}

export default function PDFDownloadButton({ data, className }: Props) {
  const filename = `attestation-zakat-${data.companyName.replace(/\s+/g, "-").toLowerCase()}-${data.year}.pdf`;

  return (
    <PDFDownloadLink document={<ZakatCertificateDoc data={data} />} fileName={filename}>
      {({ loading }) => (
        <Button
          variant="outline"
          className={`gap-2 w-full h-12 text-base font-semibold border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 ${className ?? ""}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération du PDF…
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Générer mon attestation
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
