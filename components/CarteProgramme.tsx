import Link from "next/link";

import type { ProgrammeVue } from "@/lib/catalogue";
import { LIBELLE_FORMAT, LIBELLE_NATURE, montant } from "@/lib/vocabulaire";

import { Cohorte } from "./motifs/Cohorte";
import { Etiquette } from "./ui/Etiquette";

export const ETIQUETTE_SESSION = {
  ouverte: { etat: "ouvert", texte: "Ouvertes" },
  dernieres: { etat: "bientot", texte: "Dernières places" },
  complete: { etat: "complet", texte: "Complet" },
  close: { etat: "certifiante", texte: "Inscriptions closes" },
} as const;

/* La ligne d'index du catalogue. Pas une carte : on compare plusieurs
   programmes d'un seul regard vertical, et la colonne de sièges dit d'un coup
   lesquels sont pleins. */
export function LigneProgramme({ programme, rang }: { programme: ProgrammeVue; rang: number }) {
  const s = programme.prochaine;

  return (
    <li>
      <Link
        href={`/programmes/${programme.slug}`}
        className="grid grid-cols-[44px_1fr_160px_150px] items-center gap-5 border-b border-[rgba(6,24,47,.13)] px-3 py-4 no-underline transition-[background-color,padding] duration-200 hover:bg-[rgba(6,24,47,.05)] hover:pl-5 max-lg:grid-cols-[34px_1fr] max-lg:gap-3"
      >
        <span className="t-balise self-start text-[0.68rem] tracking-[0.1em] text-gris">
          {String(rang).padStart(2, "0")}
        </span>

        <span className="block">
          <span className="t-italique block text-[1.3rem] leading-[1.14] text-encre">
            {programme.titre}
          </span>
          <span className="t-balise mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.61rem] tracking-[0.13em] text-gris">
            <span>{LIBELLE_NATURE[programme.nature]}</span>
            {programme.dureeLibelle && <span>{programme.dureeLibelle}</span>}
            <span>
              {LIBELLE_FORMAT[programme.format]}
              {programme.format !== "en_ligne" && s?.ville ? ` · ${s.ville}` : ""}
            </span>
          </span>
        </span>

        <span className="max-lg:col-start-2">
          {s ? <Cohorte capacite={s.capacite} pris={s.confirmees} /> : null}
        </span>

        <span className="block max-lg:col-start-2">
          {s ? (
            <>
              <span className="t-chiffres block text-[0.95rem] font-bold tracking-[-0.02em] text-marine">
                {montant(s.prixFcfa)} <span className="text-[0.68rem] font-medium text-gris">FCFA</span>
              </span>
              <span className="t-balise mt-1 block text-[0.6rem] text-gris">
                {s.etat === "complete" ? "Complet" : s.debutCourt}
              </span>
            </>
          ) : (
            <span className="t-balise block text-[0.6rem] text-gris">Aucune date annoncée</span>
          )}
        </span>
      </Link>
    </li>
  );
}

/* La carte pleine, pour l'accueil. */
export function CarteProgramme({ programme }: { programme: ProgrammeVue }) {
  const s = programme.prochaine;
  const marque = s ? ETIQUETTE_SESSION[s.etat] : null;

  return (
    <article className="flex flex-col gap-2 rounded-carte border border-ligne bg-white p-5 transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
      {marque && (
        <div>
          <Etiquette etat={marque.etat}>{marque.texte}</Etiquette>
        </div>
      )}
      <h3 className="t-italique text-[1.3rem] leading-[1.14] text-encre">
        <Link href={`/programmes/${programme.slug}`} className="no-underline">
          {programme.titre}
        </Link>
      </h3>
      <p className="m-0 text-[0.84rem] text-gris">{programme.accroche}</p>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-ligne-douce pt-3">
        <span className="t-chiffres text-[0.95rem] font-bold tracking-[-0.02em] text-marine">
          {s ? montant(s.prixFcfa) : "–"}{" "}
          {s && <span className="text-[0.68rem] font-medium text-gris">FCFA</span>}
        </span>
        <span className="t-balise text-[0.6rem] text-gris">{s?.debutCourt ?? "–"}</span>
      </div>
    </article>
  );
}
