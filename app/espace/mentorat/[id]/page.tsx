import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Application, Panneau, TitrePage } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, ChampTexte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerUtilisateur } from "@/lib/auth";
import { filDeLaDemande, trouverDemande } from "@/lib/mentorat";
import { formatDateHeure, LIBELLE_FORMAT } from "@/lib/vocabulaire";

import { ecrireDansLeFil, repondreDemande } from "../../../mentorat/actions";

export const metadata: Metadata = { title: "Fil de mentorat" };

const ETAT = {
  envoyee: { etat: "bientot", texte: "En attente de réponse" },
  acceptee: { etat: "ouvert", texte: "Acceptée" },
  declinee: { etat: "complet", texte: "Déclinée" },
  close: { etat: "certifiante", texte: "Close" },
} as const;

export default async function FilMentorat(props: PageProps<"/espace/mentorat/[id]">) {
  const utilisateur = await exigerUtilisateur();
  const { id } = await props.params;

  const demande = await trouverDemande(id);
  if (!demande) notFound();

  /* Le fil n'est lisible que par les deux intéressés. Un 404 plutôt qu'un 403 :
     inutile de confirmer l'existence de la demande à quelqu'un d'étranger. */
  const estLeMentor = demande.mentorUserId === utilisateur.id;
  const estLeDemandeur = demande.demandeurUserId === utilisateur.id;
  if (!estLeMentor && !estLeDemandeur) notFound();

  const fil = await filDeLaDemande(id);

  const params = await props.searchParams;
  const v = params.erreur;
  const erreur = Array.isArray(v) ? v[0] : v;

  const echangePossible = demande.statut === "acceptee" || demande.statut === "envoyee";

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/mentorat">
      <TitrePage
        surtitre={estLeMentor ? `Demande de ${demande.demandeurNom}` : `Mentorat · ${demande.mentorTitre}`}
        titre={demande.objet}
        sous={
          <>
            Envoyée le {formatDateHeure.format(demande.creeAt)} · {LIBELLE_FORMAT[demande.format]}
            {demande.creneauAt ? ` · créneau ${formatDateHeure.format(demande.creneauAt)}` : ""}
          </>
        }
        actions={<Etiquette etat={ETAT[demande.statut].etat}>{ETAT[demande.statut].texte}</Etiquette>}
      />

      {erreur === "vide" && <Alerte nature="erreur">Écrivez un message avant d&apos;envoyer.</Alerte>}
      {erreur === "debit" && (
        <Alerte nature="erreur">Trop de messages envoyés. Réessayez dans quelques minutes.</Alerte>
      )}

      <Panneau titre="La demande" className="mb-3.5">
        <p className="m-0 text-[0.94rem] whitespace-pre-line">{demande.message}</p>
      </Panneau>

      {/* Seul le mentor destinataire décide. */}
      {estLeMentor && demande.statut === "envoyee" && (
        <Panneau titre="Votre réponse" className="mb-3.5">
          <p className="mb-3 text-[0.88rem] text-gris">
            Accepter réserve le créneau choisi. Décliner le rend disponible pour quelqu&apos;un
            d&apos;autre.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={repondreDemande}>
              <input type="hidden" name="demande" value={id} />
              <input type="hidden" name="decision" value="acceptee" />
              <Bouton type="submit" variante="marine" taille="sm">
                Accepter
              </Bouton>
            </form>
            <form action={repondreDemande}>
              <input type="hidden" name="demande" value={id} />
              <input type="hidden" name="decision" value="declinee" />
              <Bouton type="submit" variante="fantomeClair" taille="sm">
                Décliner
              </Bouton>
            </form>
          </div>
        </Panneau>
      )}

      {estLeMentor && demande.statut === "acceptee" && (
        <Panneau className="mb-3.5">
          <form action={repondreDemande} className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-[0.88rem] text-gris">
              L&apos;accompagnement est terminé ? Clore la demande libère votre quota du mois.
            </p>
            <input type="hidden" name="demande" value={id} />
            <input type="hidden" name="decision" value="close" />
            <Bouton type="submit" variante="fantomeClair" taille="sm">
              Clore
            </Bouton>
          </form>
        </Panneau>
      )}

      <Panneau titre="Le fil" extra={`${fil.length} message${fil.length > 1 ? "s" : ""}`}>
        {fil.length === 0 ? (
          <p className="m-0 text-[0.9rem] text-gris">
            {demande.statut === "envoyee"
              ? "Aucun échange pour l'instant – la demande attend une réponse."
              : "Aucun échange pour l'instant."}
          </p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-4 pl-0">
            {fil.map((m) => {
              const moi = m.auteurUserId === utilisateur.id;
              return (
                <li
                  key={m.id}
                  className={`max-w-[52ch] rounded-carte px-4 py-3 ${
                    moi ? "self-end bg-marine text-white" : "bg-papier"
                  }`}
                >
                  <p className="t-balise m-0 text-[0.56rem] opacity-70">
                    {moi
                      ? "Vous"
                      : [m.prenom, m.nom].filter(Boolean).join(" ") || m.email}{" "}
                    · {formatDateHeure.format(m.creeAt)}
                  </p>
                  <p className="mt-1.5 mb-0 text-[0.92rem] whitespace-pre-line">{m.corps}</p>
                </li>
              );
            })}
          </ol>
        )}

        {echangePossible ? (
          <form action={ecrireDansLeFil} className="mt-5 flex flex-col gap-3 border-t border-ligne-douce pt-4">
            <input type="hidden" name="demande" value={id} />
            <ChampTexte id="corps" name="corps" label="Votre message" rows={4} required maxLength={4000} />
            <Bouton type="submit" variante="marine" taille="sm" className="self-start">
              Envoyer
            </Bouton>
          </form>
        ) : (
          <p className="mt-5 border-t border-ligne-douce pt-4 text-[0.86rem] text-gris">
            Ce fil est clos. Pour reprendre l&apos;échange,{" "}
            <Link href={`/mentorat/${demande.mentorSlug}`} className="font-semibold text-marine">
              adressez une nouvelle demande
            </Link>
            .
          </p>
        )}
      </Panneau>
    </Application>
  );
}
