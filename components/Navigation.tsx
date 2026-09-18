import Link from "next/link";

import { Logo } from "./Logo";
import { BoutonLien } from "./ui/Bouton";

const LIENS = [
  { href: "/programmes", libelle: "Programmes" },
  { href: "/mentorat", libelle: "Mentorat" },
  { href: "/publications", libelle: "Publications" },
  { href: "/opportunites", libelle: "Opportunités" },
  { href: "/le-cabinet", libelle: "Le cabinet" },
  { href: "/contact", libelle: "Contact" },
] as const;

/* Navigation claire, comme la référence : bandeau d'annonce marine, puis
   barre blanche avec logo, liens et actions. Sous 1024 px les liens passent
   sur une ligne défilante en dessous, sans JavaScript.

   Elle ne lit pas le cookie de session, exprès : les pages publiques sont
   générées statiquement et mises en cache, et une lecture de cookie les
   rendrait dynamiques. « Mon espace » redirige vers la connexion si besoin,
   « Connexion » redirige vers l'espace si l'on est déjà connecté. */
export function Navigation({
  actif,
  annonce,
}: {
  actif?: string;
  annonce?: { texte: string; href?: string; accent?: string };
}) {
  return (
    <header className="relative z-20 bg-white">
      {annonce && (
        <div className="bg-marine text-center text-[0.8rem] text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-2">
            {annonce.href ? (
              <Link href={annonce.href} className="no-underline hover:underline">
                {annonce.texte}
                {annonce.accent && <span className="ml-1 font-semibold text-soleil">{annonce.accent}</span>}
              </Link>
            ) : (
              <>
                {annonce.texte}
                {annonce.accent && <span className="ml-1 font-semibold text-soleil">{annonce.accent}</span>}
              </>
            )}
          </div>
        </div>
      )}

      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-[1180px] items-center gap-6 px-4 py-3.5 sm:px-6"
      >
        <Link href="/" className="shrink-0 no-underline">
          <Logo hauteur={34} />
        </Link>

        <ul className="hidden flex-1 list-none items-center justify-center gap-7 pl-0 text-[0.9rem] font-semibold lg:flex">
          {LIENS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={actif === l.href ? "page" : undefined}
                className={`no-underline transition-colors ${
                  actif === l.href ? "text-canard" : "text-marine hover:text-canard"
                }`}
              >
                {l.libelle}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <BoutonLien href="/connexion" variante="discret" taille="sm">
            Connexion
          </BoutonLien>
          <BoutonLien href="/espace" variante="canard" taille="sm">
            Mon espace
          </BoutonLien>
        </div>
      </nav>

      <ul className="mx-auto flex max-w-[1180px] list-none gap-2 overflow-x-auto px-4 pb-3 pl-4 text-[0.82rem] font-semibold lg:hidden [scrollbar-width:none]">
        {LIENS.map((l) => (
          <li key={l.href} className="shrink-0">
            <Link
              href={l.href}
              aria-current={actif === l.href ? "page" : undefined}
              className={`inline-block rounded-full px-3.5 py-1.5 no-underline ${
                actif === l.href ? "bg-canard text-white" : "bg-brume text-marine"
              }`}
            >
              {l.libelle}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
