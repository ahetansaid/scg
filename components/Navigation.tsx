import Link from "next/link";

import { BoutonLien } from "./ui/Bouton";

/* On ne navigue que vers ce qui existe : Mentorat (étape 5) et Publications
   (étape 6) entreront ici quand leurs pages seront livrées. Un lien mort dans
   une navigation coûte plus cher qu'une entrée manquante. */
const LIENS = [
  { href: "/programmes", libelle: "Programmes" },
  { href: "/le-cabinet", libelle: "Le cabinet" },
  { href: "/contact", libelle: "Contact" },
] as const;

export function Sigle({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-2 text-[1.12rem] font-extrabold tracking-[-0.055em] ${className}`}
    >
      <svg width="26" height="10" viewBox="0 0 118 26" fill="none" aria-hidden="true">
        <path
          d="M4 24 C 22 2, 96 2, 114 24"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
      SCG
    </span>
  );
}

/* La nav en pilule flottante, sur fond nuit. Sous 768 px les liens laissent
   place à un menu déplié en dessous – pas de tiroir à JavaScript pour quatre
   entrées, ça marche même si le script ne part pas. */
export function Navigation({ actif }: { actif?: string }) {
  return (
    <header className="relative z-[4]">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-[1010px] items-center gap-[18px] rounded-full border border-white/15 bg-white/8 px-4 py-[11px] backdrop-blur-[9px]"
      >
        <Link href="/" className="text-white no-underline">
          <Sigle />
          <span className="sr-only-scg">SCG, Strategic Consulting Group – accueil</span>
        </Link>

        <ul className="flex flex-1 list-none gap-[18px] pl-0 text-[0.79rem] font-medium max-md:hidden">
          {LIENS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={actif === l.href ? "page" : undefined}
                className={`no-underline transition-colors ${
                  actif === l.href
                    ? "font-semibold text-white"
                    : "text-[#b7cbdd] hover:text-white"
                }`}
              >
                {l.libelle}
              </Link>
            </li>
          ))}
        </ul>

        <span className="flex-1 md:hidden" />

        {/* L'espace membre arrive à l'étape 3, avec les comptes. */}
        <BoutonLien href="/programmes" variante="laiton" taille="sm">
          Voir le calendrier
        </BoutonLien>
      </nav>

      <ul className="mx-auto mt-2 flex max-w-[1010px] list-none flex-wrap gap-2 px-1 pl-0 md:hidden">
        {LIENS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={actif === l.href ? "page" : undefined}
              className={`inline-block rounded-full border px-[13px] py-1.5 text-[0.78rem] font-semibold no-underline ${
                actif === l.href
                  ? "border-laiton bg-laiton text-[#1a1204]"
                  : "border-white/22 bg-white/7 text-[#dce7f1]"
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
