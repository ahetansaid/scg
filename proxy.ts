import { NextResponse, type NextRequest } from "next/server";

/* ============================================================================
   Redirection anticipée des zones privées.

   Ce fichier s'appelait `middleware` jusqu'à Next 15 ; il est renommé `proxy`
   en Next 16.

   Il ne PROTÈGE rien : il regarde seulement si un cookie de session est
   présent, pour éviter d'afficher une page de connexion après un aller-retour
   inutile. L'autorisation réelle – session valide, rôle suffisant – est
   vérifiée dans chaque page et chaque action serveur, qui sont les seuls
   endroits que ce proxy ne peut pas court-circuiter.
   ============================================================================ */

const PRIVE = ["/espace", "/admin"];

export function proxy(requete: NextRequest) {
  const chemin = requete.nextUrl.pathname;
  if (!PRIVE.some((p) => chemin === p || chemin.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (requete.cookies.has("scg_session")) return NextResponse.next();

  const versConnexion = new URL("/connexion", requete.url);
  versConnexion.searchParams.set("suite", chemin + requete.nextUrl.search);
  return NextResponse.redirect(versConnexion);
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*"],
};
