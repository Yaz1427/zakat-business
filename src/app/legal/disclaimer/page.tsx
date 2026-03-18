import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Décharge de Responsabilité Religieuse — ZakatBiz",
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1>Décharge de Responsabilité Religieuse</h1>
      <p className="text-muted-foreground text-sm">À lire attentivement avant toute utilisation</p>

      <div className="not-prose bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-6">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Important</p>
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          ZakatBiz est un outil de calcul technique. Il ne constitue pas une fatwa, un avis religieux
          ou une consultation d&apos;un érudit islamique. Tout résultat produit doit être validé par
          un savant qualifié avant d&apos;être considéré comme définitif.
        </p>
      </div>

      <h2>1. Nature du Service</h2>
      <p>
        ZakatBiz est un outil numérique de <strong>calcul assisté</strong> de la Zakat sur les
        actifs d&apos;entreprise. Il s&apos;appuie sur les normes comptables et d&apos;audit de
        l&apos;AAOIFI (Accounting and Auditing Organisation for Islamic Financial Institutions),
        un organisme international de référence en finance islamique.
      </p>
      <p>
        L&apos;AAOIFI n&apos;est pas un organisme religieux à proprement parler, mais un organisme
        de normalisation comptable. Ses normes, bien que largement acceptées, peuvent ne pas
        correspondre à la pratique de certaines écoles juridiques (madhhabs) ou à
        l&apos;interprétation de certains savants.
      </p>

      <h2>2. Limites du calcul automatisé</h2>
      <p>Le calcul produit par ZakatBiz repose sur les données saisies par l&apos;utilisateur et
        sur des règles génériques. Il ne prend <strong>pas en compte</strong> :</p>
      <ul>
        <li>Les situations particulières de votre entreprise (créances douteuses spécifiques, actifs mixtes…)</li>
        <li>Les divergences entre écoles juridiques sur certains postes du bilan</li>
        <li>Les fatwas spécifiques d&apos;un conseil de savants auquel vous seriez affilié</li>
        <li>Les règlementations locales (pays, région, contexte fiscal)</li>
      </ul>

      <h2>3. Recommandation</h2>
      <p>
        Nous vous encourageons vivement à soumettre vos résultats à un <strong>érudit qualifié
        en finance islamique</strong> ou à un <strong>conseiller en finance halal certifié</strong>
        avant de procéder au versement de votre Zakat.
      </p>
      <p>
        Des organismes comme le <strong>CIFIE</strong> (Centre Islamique de Finance et
        d&apos;Investissement Éthique), l&apos;AAOIFI ou tout conseil de savants reconnu dans
        votre communauté peuvent vous accompagner.
      </p>

      <h2>4. Non-responsabilité</h2>
      <p>
        ZakatBiz et ses fondateurs déclinent toute responsabilité quant aux conséquences
        religieuses, fiscales ou juridiques découlant de l&apos;utilisation des calculs produits
        par le Service. En utilisant ZakatBiz, vous reconnaissez avoir pris connaissance de ces
        limites et les acceptez pleinement.
      </p>

      <h2>5. Objet de l&apos;attestation PDF</h2>
      <p>
        L&apos;attestation PDF générée par ZakatBiz est un document de <strong>traçabilité
        comptable interne</strong>. Elle matérialise vos déclarations chiffrées et le calcul
        résultant. Elle n&apos;a pas valeur de certification religieuse.
      </p>
    </article>
  );
}
