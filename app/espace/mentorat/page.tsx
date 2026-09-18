import type { Metadata } from "next";
import Link from "next/link";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampListe } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerUtilisateur } from "@/lib/auth";
import {
  creneauxDuMentor,
  demandesOuvertes,
  DEMANDES_OUVERTES_MAX,
  demandesRecues,
  estMentor,
  mesDemandes,
} from "@/lib/mentorat";
import { formatDateHeure, LIBELLE_FORMAT, pluriel } from "@/lib/vocabulaire";

import { ouvrirCreneau, retirerCreneau } from "../../mentorat/actions";

export const metadata: Metadata = { title: "Mon mentorat" };

const ETAT = {
  envoyee: { etat: "bientot", texte: "En attente" },
  acceptee: { etat: "ouvert", texte: "Acceptée" },
  declinee: { etat: "complet", texte: "Déclinée" },
  close: { etat: "certifiante", texte: "Close" },
} as const;

const ERREURS: Record<string, string> = {
  creneau_date: "Choisissez une date à venir.",
  decision: "Décision inconnue.",
};

export default async function MonMentorat(props: PageProps<"/espace/mentorat">) {
  const utilisateur = await exigerUtilisateur();
  const fiche = await estMentor(utilisateur.id);

  const [envoyees, recues, ouvertes, creneaux] = await Promise.all([
    mesDemandes(utilisateur.id),
    fiche ? demandesRecues(utilisateur.id) : Promise.resolve([]),
    demandesOuvertes(utilisateur.id),
    fiche ? creneauxDuMentor(fiche.id) : Promise.resolve([]),
  ]);

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };
  const erreur = lire("erreur");

  /* `creneauxDuMentor` ne renvoie déjà que les créneaux à venir. */
  const aVenir = creneaux;

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/mentorat">
      <TitrePage
        surtitre="Espace membre"
        titre="Mon"
        accent="mentorat"
        sous={`${ouvertes} ${pluriel(ouvertes, "demande")} en attente sur ${DEMANDES_OUVERTES_MAX} possibles.`}
        actions={
          <BoutonLien href="/mentorat" variante="marine" taille="sm">
            L&apos;annuaire
          </BoutonLien>
        }
      />

      {lire("envoyee") === "1" && (
        <Alerte nature="succes">
          <strong className="font-semibold">Demande envoyée.</strong> Le mentor répond sous 72
          heures ouvrées.
        </Alerte>
      )}
      {lire("creneau") === "1" && <Alerte nature="succes">Créneau ouvert.</Alerte>}
      {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "L'action a échoué."}</Alerte>}

      {/* --- Côté mentor : demandes reçues et créneaux ------------------- */}
      {fiche && (
        <>
          <Panneau
            titre="Demandes reçues"
            extra={`${recues.filter((d) => d.statut === "envoyee").length} à traiter`}
            className="mb-3.5"
          >
            {recues.length === 0 ? (
              <Vide>Aucune demande reçue pour l&apos;instant.</Vide>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-3 pl-0">
                {recues.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-start justify-between gap-3 border-b border-ligne pb-3 last:border-b-0 last:pb-0"
                  >
                    <span>
                      <Link
                        href={`/espace/mentorat/${d.id}`}
                        className="text-[0.94rem] font-semibold text-encre no-underline hover:text-marine"
                      >
                        {d.objet}
                      </Link>
                      <span className="mt-0.5 block text-[0.8rem] text-gris">
                        {d.demandeurNom} · {formatDateHeure.format(d.creeAt)}
                      </span>
                    </span>
                    <Etiquette etat={ETAT[d.statut].etat}>{ETAT[d.statut].texte}</Etiquette>
                  </li>
                ))}
              </ul>
            )}
          </Panneau>

          <Panneau
            titre="Mes créneaux"
            extra={`${aVenir.length} ${pluriel(aVenir.length, "à venir")}`}
            className="mb-3.5"
          >
            <form action={ouvrirCreneau} className="mb-4 grid items-end gap-3 sm:grid-cols-[1fr_120px_150px_auto]">
              <Champ id="quand" name="quand" type="datetime-local" label="Date et heure" required />
              <Champ id="duree" name="duree" type="number" label="Minutes" defaultValue={45} min={15} max={240} />
              <ChampListe id="format" name="format" label="Format" defaultValue="en_ligne">
                <option value="en_ligne">En ligne</option>
                <option value="presentiel">Présentiel</option>
                <option value="hybride">Hybride</option>
              </ChampListe>
              <Bouton type="submit" variante="marine" taille="sm">
                Ouvrir
              </Bouton>
            </form>

            {aVenir.length === 0 ? (
              <Vide>
                Aucun créneau ouvert. Sans créneau, les membres peuvent tout de même vous écrire –
                vous leur proposerez une date.
              </Vide>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 pl-0 text-[0.88rem]">
                {aVenir.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      {formatDateHeure.format(c.debutAt)} · {c.dureeMinutes} min ·{" "}
                      {LIBELLE_FORMAT[c.format]}
                      {c.pris && <span className="ml-2 text-[0.78rem] text-vert">réservé</span>}
                    </span>
                    {!c.pris && (
                      <form action={retirerCreneau}>
                        <input type="hidden" name="creneau" value={c.id} />
                        <Bouton type="submit" variante="contourMarine" taille="sm">
                          Retirer
                        </Bouton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panneau>
        </>
      )}

      {/* --- Côté demandeur --------------------------------------------- */}
      <Panneau titre="Mes demandes" extra={`${envoyees.length} au total`}>
        {envoyees.length === 0 ? (
          <Vide>
            Vous n&apos;avez adressé aucune demande.{" "}
            <Link href="/mentorat" className="font-semibold text-marine">
              Parcourez l&apos;annuaire
            </Link>{" "}
            pour trouver un mentor.
          </Vide>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 pl-0">
            {envoyees.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-ligne pb-3 last:border-b-0 last:pb-0"
              >
                <span>
                  <Link
                    href={`/espace/mentorat/${d.id}`}
                    className="text-[0.94rem] font-semibold text-encre no-underline hover:text-marine"
                  >
                    {d.objet}
                  </Link>
                  <span className="mt-0.5 block text-[0.8rem] text-gris">
                    {d.mentorTitre} · envoyée le {formatDateHeure.format(d.creeAt)}
                    {d.creneauAt ? ` · créneau ${formatDateHeure.format(d.creneauAt)}` : ""}
                  </span>
                </span>
                <Etiquette etat={ETAT[d.statut].etat}>{ETAT[d.statut].texte}</Etiquette>
              </li>
            ))}
          </ul>
        )}
      </Panneau>
    </Application>
  );
}
