import type { Metadata } from "next";
import Link from "next/link";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerUtilisateur } from "@/lib/auth";
import { mesInscriptions } from "@/lib/espace";
import { formatLong, LIBELLE_NATURE, montant, pluriel } from "@/lib/vocabulaire";

import { annulerMonInscription } from "../actions";

export const metadata: Metadata = { title: "Mes programmes" };

const ETAT = {
  en_attente: { etat: "bientot", texte: "En attente de confirmation" },
  confirmee: { etat: "ouvert", texte: "Confirmée" },
  terminee: { etat: "certifiante", texte: "Terminée" },
  annulee: { etat: "complet", texte: "Annulée" },
} as const;

export default async function MesProgrammes(props: PageProps<"/espace/programmes">) {
  const utilisateur = await exigerUtilisateur();
  const liste = await mesInscriptions(utilisateur.id);

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  const actives = liste.filter((i) => i.statut !== "annulee");
  const annulees = liste.filter((i) => i.statut === "annulee");

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/programmes">
      <TitrePage
        surtitre="Espace membre"
        titre="Mes"
        accent="programmes"
        sous={`${actives.length} ${pluriel(actives.length, "inscription")} ${pluriel(actives.length, "active")}.`}
        actions={
          <BoutonLien href="/programmes" variante="marine" taille="sm">
            Le catalogue
          </BoutonLien>
        }
      />

      {lire("demande") === "1" && (
        <Alerte nature="succes">
          <strong className="font-semibold">Demande enregistrée.</strong> Nous vous recontactons
          pour arrêter les modalités, puis votre place est confirmée.
        </Alerte>
      )}
      {lire("annulee") === "1" && (
        <Alerte nature="succes">Votre inscription a été annulée.</Alerte>
      )}

      {actives.length === 0 ? (
        <Vide>
          Vous n&apos;êtes inscrit à aucun programme.{" "}
          <Link href="/programmes" className="font-semibold text-marine">
            Parcourez le catalogue
          </Link>{" "}
          pour trouver une session.
        </Vide>
      ) : (
        <div className="flex flex-col gap-3.5">
          {actives.map((i) => {
            const marque = ETAT[i.statut];
            return (
              <Panneau key={i.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="t-etiquette text-[0.58rem] text-canard">
                      {LIBELLE_NATURE[i.programme.nature]} · {i.programme.domaine}
                    </p>
                    <h2 className="font-bold mt-1 text-[1.24rem] leading-tight">
                      <Link
                        href={`/programmes/${i.programme.slug}`}
                        className="text-encre no-underline hover:text-marine"
                      >
                        {i.programme.titre}
                      </Link>
                    </h2>
                    <p className="mt-1.5 text-[0.83rem] text-gris">
                      du {formatLong.format(i.session.debut)} au {formatLong.format(i.session.fin)}
                      {i.session.lieu ? ` · ${i.session.lieu}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Etiquette etat={marque.etat}>{marque.texte}</Etiquette>
                    <span className="t-chiffres text-[0.9rem] font-bold tracking-[-0.02em] text-marine">
                      {montant(i.session.prixFcfa)}{" "}
                      <span className="text-[0.66rem] font-medium text-gris">FCFA</span>
                    </span>
                  </div>
                </div>

                {i.statut === "confirmee" && i.seancesTotal > 0 && (
                  <div className="mt-4 border-t border-ligne pt-3.5">
                    <div className="flex justify-between gap-3 text-[0.8rem]">
                      <span className="font-semibold">Progression</span>
                      <span className="t-chiffres font-mono text-[0.72rem] text-gris">
                        {i.seancesFaites}/{i.seancesTotal} séances · {i.progression} %
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brume-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-marine to-azur"
                        style={{ width: `${i.progression}%` }}
                      />
                    </div>
                  </div>
                )}

                {i.statut === "en_attente" && (
                  <form action={annulerMonInscription} className="mt-4 border-t border-ligne pt-3.5">
                    <input type="hidden" name="inscription" value={i.id} />
                    <Bouton type="submit" variante="contourMarine" taille="sm">
                      Retirer ma demande
                    </Bouton>
                  </form>
                )}
              </Panneau>
            );
          })}
        </div>
      )}

      {annulees.length > 0 && (
        <Panneau titre="Demandes retirées" extra={`${annulees.length}`} className="mt-3.5">
          <ul className="m-0 flex list-none flex-col gap-1.5 pl-0 text-[0.86rem] text-gris">
            {annulees.map((i) => (
              <li key={i.id}>
                {i.programme.titre} – session du {formatLong.format(i.session.debut)}
              </li>
            ))}
          </ul>
        </Panneau>
      )}
    </Application>
  );
}
