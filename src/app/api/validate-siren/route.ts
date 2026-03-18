import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/validate-siren?siren=123456789
 * Proxy vers l'API SIRENE (data.gouv.fr) — gratuite, sans clé API.
 * Évite les problèmes CORS depuis le navigateur.
 */
export async function GET(req: NextRequest) {
  const siren = req.nextUrl.searchParams.get("siren");

  if (!siren || !/^\d{9}$/.test(siren)) {
    return NextResponse.json({ valid: false, error: "Format invalide" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${siren}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 }, // cache 1h — les données SIRENE changent rarement
      }
    );

    if (res.status === 404) {
      return NextResponse.json({ valid: false, error: "SIREN introuvable" });
    }

    if (!res.ok) {
      // API SIRENE indisponible — fail open (ne pas bloquer l'utilisateur)
      return NextResponse.json({ valid: null, error: "API SIRENE indisponible" });
    }

    const data = await res.json();
    const ul = data.unite_legale;

    const denomination: string =
      ul.denomination ||
      [ul.prenom_usuel_dirigeant_pp, ul.nom_usage_unite_legale]
        .filter(Boolean)
        .join(" ") ||
      "Dénomination inconnue";

    const active: boolean = ul.etat_administratif === "A";

    return NextResponse.json({
      valid: true,
      active,
      denomination,
      siren: ul.siren,
      activitePrincipale: ul.activite_principale,
    });
  } catch {
    // Réseau ou parse error — fail open
    return NextResponse.json({ valid: null, error: "API SIRENE indisponible" });
  }
}
