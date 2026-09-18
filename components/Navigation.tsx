import Link from "next/link";

import { Logo } from "./Logo";
import { CABINET } from "./PiedDePage";
import { BoutonLien } from "./ui/Bouton";

const LIENS = [
  { href: "/programmes", libelle: "Programmes" },
  { href: "/mentorat", libelle: "Mentorat" },
  { href: "/publications", libelle: "Publications" },
  { href: "/opportunites", libelle: "Opportunités" },
  { href: "/le-cabinet", libelle: "Le cabinet" },
  { href: "/contact", libelle: "Contact" },
] as const;

/* Navigation claire : une barre translucide collée en haut, avec logo, liens
   et actions, alignée sur les cadres des pages. Sous 1024 px les liens
   passent sur une ligne défilante en dessous, sans JavaScript. La prochaine
   session s'annonce dans le hero, pas dans un ruban.

   Elle ne lit pas le cookie de session, exprès : les pages publiques sont
   générées statiquement et mises en cache, et une lecture de cookie les
   rendrait dynamiques. « Mon espace » redirige vers la connexion si besoin,
   « Connexion » redirige vers l'espace si l'on est déjà connecté. */
export function Navigation({ actif }: { actif?: string }) {
  return (
    <header className="relative z-30">
      {/* La barre reste collée en haut, translucide : le contenu passe dessous.
          Sa largeur est celle des cadres (1400 px), pour que le logo tombe
          au-dessus du bord gauche du hero. */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3 sm:gap-6 sm:px-8"
      >
        <Link href="/" className="shrink-0 no-underline">
          <Logo hauteur={46} />
        </Link>

        <ul className="hidden flex-1 list-none items-center justify-center gap-7 pl-0 text-[0.9rem] font-semibold whitespace-nowrap lg:flex">
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

        {/* Le téléphone du cabinet, comme dans la référence : visible sur grand écran. */}
        <a href={`tel:${CABINET.telephoneLien}`} className="hidden items-center gap-3 whitespace-nowrap no-underline 2xl:flex">
          <span className="flex size-10 items-center justify-center rounded-full bg-pastel-canard text-canard-fonce">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[0.72rem] text-gris">Une question ?</span>
            <span className="t-chiffres block text-[0.9rem] font-bold text-marine">{CABINET.telephone}</span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* Sous 640 px, « Mon espace » suffit : il renvoie vers la connexion. */}
          <span className="hidden sm:block">
            <BoutonLien href="/connexion" variante="discret" taille="sm">
              Connexion
            </BoutonLien>
          </span>
          <BoutonLien href="/espace" variante="canard" taille="sm">
            Mon espace
          </BoutonLien>
        </div>
      </nav>
      </div>

      <ul className="mx-auto flex max-w-[1400px] list-none gap-2 overflow-x-auto bg-white px-5 py-2 text-[0.82rem] font-semibold lg:hidden [scrollbar-width:none]">
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
