import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ProgrammeVue } from "@/lib/catalogue";
import type { MentorVue } from "@/lib/mentorat";
import { photoProgramme, portrait } from "@/lib/photos";
import { LIBELLE_FORMAT, LIBELLE_NATURE, montant, pluriel } from "@/lib/vocabulaire";

import { Cohorte } from "./motifs/Cohorte";
import { Etiquette } from "./ui/Etiquette";

/* ============================================================================
   Briques de la vitrine, dans l'esprit des références : cartes blanches très
   arrondies, ombres douces, vignettes photo, pastilles de couleur.
   ============================================================================ */

/* --- Titre de section ------------------------------------------------------ */

export function TitreSection({
  sur,
  titre,
  souligne,
  centre = false,
  action,
  className = "",
}: {
  sur?: string;
  titre: string;
  /** Le mot du titre qui reçoit le soulignement jaune. */
  souligne?: string;
  centre?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const parties = souligne ? titre.split(souligne) : [titre];
  return (
    <div
      className={`mb-8 flex flex-wrap items-end gap-4 ${centre ? "justify-center text-center" : "justify-between"} ${className}`}
    >
      <div className={centre ? "mx-auto" : ""}>
        {sur && <p className="t-sur mb-1.5">{sur}</p>}
        <h2 className="t-h2">
          {souligne && parties.length === 2 ? (
            <>
              {parties[0]}
              <span className="souligne">{souligne}</span>
              {parties[1]}
            </>
          ) : (
            titre
          )}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* --- Puces de domaine ------------------------------------------------------ */

const ICONES: Record<string, { fond: string; encre: string; icone: ReactNode }> = {
  Finance: {
    fond: "bg-pastel-soleil",
    encre: "text-[#b7791f]",
    icone: (
      <path d="M4 19h16M6 16V9m4 7V5m4 11v-6m4 6V7" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  Stratégie: {
    fond: "bg-pastel-violet",
    encre: "text-violet",
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
  },
  "Secteur public": {
    fond: "bg-pastel-ciel",
    encre: "text-marine",
    icone: (
      <path
        d="M3 21h18M5 21V10m14 11V10M3 10l9-6 9 6M8 21v-6h8v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  Digital: {
    fond: "bg-pastel-canard",
    encre: "text-canard-fonce",
    icone: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8m-4-4v4" strokeLinecap="round" />
      </>
    ),
  },
  "Ressources humaines": {
    fond: "bg-pastel-corail",
    encre: "text-corail",
    icone: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2" strokeLinecap="round" />
      </>
    ),
  },
  Entrepreneuriat: {
    fond: "bg-pastel-mandarine",
    encre: "text-mandarine",
    icone: (
      <path
        d="M14 3l7 7-4 1-4 4-1 4-7-7 4-1 4-4 1-4zM5 19l3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
};

export function PuceDomaine({ domaine, href }: { domaine: string; href: string }) {
  const d = ICONES[domaine] ?? ICONES["Stratégie"]!;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-[0.95rem] font-semibold text-marine no-underline transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${d.fond}`}
    >
      <span className={`flex size-9 items-center justify-center rounded-full bg-white ${d.encre}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          {d.icone}
        </svg>
      </span>
      {domaine}
    </Link>
  );
}

/* --- Carte programme à vignette ------------------------------------------- */

const ETAT_SESSION = {
  ouverte: { etat: "ouvert", texte: "Inscriptions ouvertes" },
  dernieres: { etat: "bientot", texte: "Dernières places" },
  complete: { etat: "complet", texte: "Complet" },
  close: { etat: "neutre", texte: "Inscriptions closes" },
} as const;

export function CarteProgramme({ programme }: { programme: ProgrammeVue }) {
  const s = programme.prochaine;
  const marque = s ? ETAT_SESSION[s.etat] : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-carte border border-ligne bg-white shadow-carte transition-transform hover:-translate-y-1 motion-reduce:hover:translate-y-0">
      <Link href={`/programmes/${programme.slug}`} className="relative block aspect-[4/3] overflow-hidden no-underline">
        <Image
          src={photoProgramme(programme.domaine, programme.imageUrl)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <span className="absolute top-3 left-3 rounded-full bg-canard px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-white uppercase">
          {LIBELLE_NATURE[programme.nature]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[0.78rem] font-semibold text-canard">{programme.domaine}</p>
        <h3 className="t-h3">
          <Link href={`/programmes/${programme.slug}`} className="no-underline hover:text-canard">
            {programme.titre}
          </Link>
        </h3>
        {programme.accroche && (
          <p className="line-clamp-2 text-[0.86rem] text-gris">{programme.accroche}</p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-gris">
          {programme.dureeLibelle && <span>{programme.dureeLibelle}</span>}
          <span>{LIBELLE_FORMAT[programme.format]}</span>
        </div>

        {s && (
          <div className="mt-1">
            <Cohorte capacite={s.capacite} pris={s.confirmees} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ligne pt-3">
          {s ? (
            <span className="t-chiffres text-[1rem] font-extrabold text-marine">
              {montant(s.prixFcfa)} <span className="text-[0.7rem] font-semibold text-gris">FCFA</span>
            </span>
          ) : (
            <span className="text-[0.82rem] text-gris">Dates à venir</span>
          )}
          {marque ? (
            <Etiquette etat={marque.etat}>{marque.texte}</Etiquette>
          ) : (
            <Link href={`/programmes/${programme.slug}`} className="text-[0.84rem] font-semibold text-marine">
              Voir le programme
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* --- Carte mentor ---------------------------------------------------------- */

export function CarteMentor({ mentor }: { mentor: MentorVue }) {
  return (
    <Link
      href={`/mentorat/${mentor.slug}`}
      className="flex h-full flex-col items-center gap-3 rounded-carte border border-ligne bg-white p-6 text-center no-underline shadow-carte transition-transform hover:-translate-y-1 motion-reduce:hover:translate-y-0"
    >
      <span className="relative block size-24 overflow-hidden rounded-full ring-4 ring-canard-clair">
        <Image src={portrait(mentor.slug, mentor.avatarUrl)} alt="" fill sizes="96px" className="object-cover" />
      </span>
      <span className="text-[1.02rem] font-bold text-marine">{mentor.nomComplet}</span>
      <span className="text-[0.84rem] text-gris">
        {mentor.titre}
        {mentor.organisation ? ` · ${mentor.organisation}` : ""}
      </span>
      {mentor.domaines.length > 0 && (
        <span className="flex flex-wrap justify-center gap-1.5">
          {mentor.domaines.slice(0, 3).map((d) => (
            <span key={d} className="rounded-full bg-pastel-ciel px-2.5 py-0.5 text-[0.72rem] font-semibold text-marine">
              {d}
            </span>
          ))}
        </span>
      )}
      <span className={`mt-auto text-[0.8rem] font-semibold ${mentor.creneauxLibres > 0 ? "text-canard" : "text-gris"}`}>
        {mentor.creneauxLibres > 0
          ? `${mentor.creneauxLibres} ${pluriel(mentor.creneauxLibres, "créneau", "créneaux")} ${pluriel(mentor.creneauxLibres, "ouvert")}`
          : "Sur demande"}
      </span>
    </Link>
  );
}

/* --- Découpe photo organique ---------------------------------------------- */

const FORMES = {
  galet: "58% 42% 46% 54% / 47% 58% 42% 53%",
  goutte: "50% 50% 50% 50% / 60% 60% 40% 40%",
  rond: "50%",
} as const;

export function Decoupe({
  src,
  alt = "",
  forme = "galet",
  className = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  forme?: keyof typeof FORMES;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ borderRadius: FORMES[forme] }}
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 90vw, 560px" className="object-cover" priority={priority} />
    </span>
  );
}

/* --- Pastilles décoratives ------------------------------------------------- */

export function Pastilles() {
  return (
    <>
      <span aria-hidden="true" className="pastille size-3 bg-corail" style={{ top: "8%", left: "6%" }} />
      <span aria-hidden="true" className="pastille size-4 bg-soleil" style={{ top: "24%", right: "9%" }} />
      <span aria-hidden="true" className="pastille size-2.5 bg-canard" style={{ bottom: "18%", left: "12%" }} />
      <span aria-hidden="true" className="pastille size-3 bg-violet" style={{ bottom: "10%", right: "20%" }} />
    </>
  );
}
