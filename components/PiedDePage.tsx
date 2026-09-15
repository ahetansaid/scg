import Link from "next/link";

import { Sigle } from "./Navigation";

/* Les coordonnées viennent de l'en-tête officielle du cabinet. */
export const CABINET = {
  nom: "Strategic Consulting Group",
  adresse: "Lot 100, Tokplegbe",
  ville: "Cotonou, Bénin",
  telephone: "+229 66 56 66 10",
  telephoneLien: "+22966566610",
  email: "Pdandjinou@gmail.com",
  ifu: "1200901241800",
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
      { href: "/le-cabinet", libelle: "Qui nous sommes" },
      { href: "/contact", libelle: "Nous écrire" },
    ],
  },
] as const;

export function PiedDePage() {
  return (
    <footer className="bg-nuit text-[#b7cbdd]">
      <div className="mx-auto grid max-w-[1010px] gap-10 px-4 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Sigle className="text-white" />
          <p className="t-balise mt-2 text-[0.6rem] text-[#8fb0cc]">{CABINET.nom}</p>
          <p className="mt-4 max-w-[34ch] text-[0.86rem]">
            Conseil, formation et mentorat pour les dirigeants, cadres publics et entrepreneurs
            de la sous-région.
          </p>
        </div>

        {COLONNES.map((col) => (
          <nav key={col.titre} aria-label={col.titre}>
            <p className="t-balise mb-3 text-[0.6rem] text-[#5f7b96]">{col.titre}</p>
            <ul className="flex list-none flex-col gap-2 pl-0 text-[0.86rem]">
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
          <p className="t-balise mb-3 text-[0.6rem] text-[#5f7b96]">Nous joindre</p>
          <address className="flex flex-col gap-2 text-[0.86rem] not-italic">
            <span>
              {CABINET.adresse}
              <br />
              {CABINET.ville}
            </span>
            <a href={`tel:${CABINET.telephoneLien}`} className="no-underline hover:text-white">
              {CABINET.telephone}
            </a>
            <a href={`mailto:${CABINET.email}`} className="no-underline hover:text-white">
              {CABINET.email}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1010px] flex-wrap justify-between gap-3 px-4 py-5 text-[0.78rem] text-[#8fb0cc] sm:px-8">
          <span>
            © {new Date().getFullYear()} {CABINET.nom} · IFU {CABINET.ifu}
          </span>
          <a href={`mailto:${CABINET.email}`} className="no-underline hover:text-white">
            {CABINET.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
