import Link from "next/link";

import { Logo } from "./Logo";

/* Les coordonnées viennent de l'en-tête officielle du cabinet. Adresse,
   téléphone et IFU sont retirés de l'affichage pour le moment, à la demande
   du cabinet : seul l'e-mail reste. */
export const CABINET = {
  nom: "Strategic Consulting Group",
  ville: "Cotonou, Bénin",
  email: "Pdandjinou@gmail.com",
} as const;

const COLONNES = [
  {
    titre: "Se former",
    liens: [
      { href: "/programmes", libelle: "Tous les programmes" },
      { href: "/programmes?nature=masterclass", libelle: "Masterclasses" },
      { href: "/programmes?nature=formation", libelle: "Formations" },
      { href: "/programmes?nature=certification", libelle: "Certifications" },
    ],
  },
  {
    titre: "Le cabinet",
    liens: [
      { href: "/le-cabinet", libelle: "À propos" },
      { href: "/mentorat", libelle: "Mentorat" },
      { href: "/publications", libelle: "Publications" },
      { href: "/opportunites", libelle: "Opportunités" },
      { href: "/contact", libelle: "Contact" },
    ],
  },
] as const;

export function PiedDePage() {
  return (
    <footer className="mt-10 bg-marine text-white/80">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo hauteur={56} clair />
          <p className="mt-5 max-w-[34ch] text-[0.9rem] leading-relaxed">
            Conseil, formation et mentorat pour les dirigeants, cadres publics et entrepreneurs
            de la sous-région.
          </p>
        </div>

        {COLONNES.map((col) => (
          <nav key={col.titre} aria-label={col.titre}>
            <p className="mb-4 text-[0.95rem] font-bold text-white">{col.titre}</p>
            <ul className="flex list-none flex-col gap-2.5 pl-0 text-[0.9rem]">
              {col.liens.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="no-underline hover:text-white">
                    {l.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="mb-4 text-[0.95rem] font-bold text-white">Nous joindre</p>
          <address className="flex flex-col gap-2.5 text-[0.9rem] not-italic">
            <a href={`mailto:${CABINET.email}`} className="break-all no-underline hover:text-white">
              {CABINET.email}
            </a>
            <span>{CABINET.ville}</span>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3 px-4 py-5 text-[0.8rem] text-white/60 sm:px-6">
          <span>
            © {new Date().getFullYear()} {CABINET.nom}
          </span>
          <span>Cotonou, Bénin</span>
        </div>
      </div>
    </footer>
  );
}
