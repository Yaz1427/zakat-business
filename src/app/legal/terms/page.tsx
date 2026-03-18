import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — ZakatBiz",
};

export default function TermsPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1>Conditions Générales d&apos;Utilisation</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : mars 2025</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
        l&apos;utilisation de la plateforme <strong>ZakatBiz</strong> (ci-après &quot;le Service&quot;),
        éditée par ZakatBiz. Le Service est un outil de calcul de la Zakat pour les entreprises,
        basé sur les normes comptables AAOIFI (Accounting and Auditing Organisation for Islamic
        Financial Institutions).
      </p>

      <h2>2. Acceptation des CGU</h2>
      <p>
        En accédant au Service et en créant un compte, vous acceptez sans réserve les présentes CGU.
        Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser le Service.
      </p>

      <h2>3. Description du Service</h2>
      <p>ZakatBiz permet à ses utilisateurs de :</p>
      <ul>
        <li>Calculer la Zakat de leur entreprise selon la méthode du Capital Circulant Net (AAOIFI)</li>
        <li>Sauvegarder leurs calculs et historiques fiscaux</li>
        <li>Générer une attestation PDF de leurs calculs</li>
        <li>Obtenir le seuil Nisab basé sur le cours actuel de l&apos;or</li>
      </ul>

      <h2>4. Limite de responsabilité</h2>
      <p>
        <strong>Le Service fournit des estimations à titre indicatif uniquement.</strong> ZakatBiz
        n&apos;est pas un cabinet d&apos;expertise comptable, ni un organisme religieux. Les calculs
        produits par le Service ne constituent pas un avis juridique, fiscal ou religieux.
      </p>
      <p>
        ZakatBiz ne peut être tenu responsable des décisions prises par l&apos;utilisateur sur la
        base des résultats produits. Pour toute validation religieuse définitive, l&apos;utilisateur
        est invité à consulter un érudit qualifié en finance islamique.
      </p>

      <h2>5. Compte utilisateur</h2>
      <p>
        L&apos;accès aux fonctionnalités de sauvegarde et d&apos;attestation nécessite la création
        d&apos;un compte via notre prestataire d&apos;authentification (Clerk). L&apos;utilisateur
        est responsable de la confidentialité de ses identifiants.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus, algorithmes, interfaces et marques du Service sont la propriété
        exclusive de ZakatBiz. Toute reproduction, même partielle, est interdite sans autorisation
        préalable écrite.
      </p>

      <h2>7. Modification des CGU</h2>
      <p>
        ZakatBiz se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
        seront informés par e-mail ou notification en application. La poursuite de l&apos;utilisation
        du Service après notification vaut acceptation des nouvelles conditions.
      </p>

      <h2>8. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la
        compétence des tribunaux de Paris.
      </p>
    </article>
  );
}
