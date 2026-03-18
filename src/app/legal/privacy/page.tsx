import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — ZakatBiz",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1>Politique de Confidentialité</h1>
      <p className="text-muted-foreground text-sm">Conforme au RGPD · Dernière mise à jour : mars 2025</p>

      <h2>1. Responsable du traitement</h2>
      <p>
        ZakatBiz est responsable du traitement de vos données personnelles dans le cadre de
        l&apos;utilisation du Service.
      </p>

      <h2>2. Données collectées</h2>
      <p>Nous collectons les données suivantes :</p>
      <ul>
        <li><strong>Données d&apos;identification</strong> : adresse e-mail (via Clerk)</li>
        <li><strong>Données financières</strong> : montants saisis dans le formulaire de calcul (trésorerie, stocks, créances, dettes). Ces données sont liées à votre compte et jamais partagées.</li>
        <li><strong>Données de navigation</strong> : logs techniques anonymisés</li>
      </ul>

      <h2>3. Finalité du traitement</h2>
      <ul>
        <li>Fournir le Service de calcul et de sauvegarde</li>
        <li>Générer les attestations PDF</li>
        <li>Améliorer le Service (données agrégées et anonymisées)</li>
        <li>Respecter nos obligations légales</li>
      </ul>

      <h2>4. Base légale</h2>
      <p>
        Le traitement est fondé sur l&apos;exécution du contrat (CGU acceptées) et, pour les
        données de navigation, sur notre intérêt légitime à améliorer le Service.
      </p>

      <h2>5. Conservation des données</h2>
      <p>
        Vos données sont conservées pendant toute la durée d&apos;activité de votre compte,
        et supprimées dans les 30 jours suivant une demande de suppression ou la clôture
        du compte.
      </p>

      <h2>6. Partage des données</h2>
      <p>
        Vos données ne sont <strong>jamais vendues ni partagées</strong> avec des tiers à des
        fins commerciales. Elles peuvent être communiquées aux sous-traitants techniques
        (hébergement, authentification) strictement nécessaires au fonctionnement du Service,
        tous soumis à des obligations contractuelles de confidentialité.
      </p>

      <h2>7. Vos droits (RGPD)</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
        <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
        <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
        <li><strong>Droit d&apos;opposition</strong> : s&apos;opposer à certains traitements</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à : <strong>privacy@zakatbiz.com</strong>
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Toutes les communications sont chiffrées via HTTPS/TLS. L&apos;authentification est
        gérée par Clerk, certifié SOC 2 Type II. Les données sont hébergées sur Supabase
        (PostgreSQL) avec isolation par identifiant utilisateur.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Le Service utilise uniquement des cookies techniques strictement nécessaires à
        l&apos;authentification et à la session. Aucun cookie publicitaire ou de suivi tiers
        n&apos;est utilisé.
      </p>
    </article>
  );
}
