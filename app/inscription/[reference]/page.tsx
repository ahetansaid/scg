import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { dejaInscrit, sessionOuverte } from "@/lib/espace";
import { formatLong, LIBELLE_FORMAT, montant, pluriel } from "@/lib/vocabulaire";

import { sInscrireALaSession } from "../../espace/actions";

export const metadata: Metadata = { title: "Réserver une place" };

const ERREURS: Record<string, string> = {
  complet: "Cette session vient d'être complétée. Écrivez-nous pour la prochaine.",
  deja: "Vous avez déjà une demande pour cette session.",
  close: "Les inscriptions sont closes pour cette session.",
  fermee: "Cette session n'accepte pas d'inscription.",
  introuvable: "Cette session n'existe pas ou plus.",
  debit: "Trop de demandes envoyées récemment. Réessayez dans une demi-heure.",
};

export default async function Inscription(props: PageProps<"/inscription/[reference]">) {
  const { reference } = await props.params;
  const session = await sessionOuverte(reference);
  if (!session) notFound();

  const utilisateur = await utilisateurCourant();
  if (!utilisateur) redirect(`/connexion?suite=/inscription/${reference}`);

  const params = await props.searchParams;
  const v = params.erreur;
  const erreur = Array.isArray(v) ? v[0] : v;

  const existante = await dejaInscrit(utilisateur.id, session.id);
  const { restantes, close } = session;
  const possible = !existante && session.ouverteAuxInscriptions;

  return (
    <>
      <div
        className="pb-9"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 72%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/programmes" />
        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Réservation</p>
          <h1 className="t-h2 mt-2 max-w-[20ch] text-white">{session.programmeTitre}</h1>
          <p className="t-balise mt-3 text-[#9fb8ce]">Session {session.reference}</p>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[680px] px-4 py-10 sm:px-8 md:py-14">
          {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La demande a échoué."}</Alerte>}

          <div className="rounded-panneau border border-ligne bg-white p-6">
            <dl className="flex flex-col gap-4 text-[0.9rem]">
              <div>
                <dt className="t-balise text-[0.58rem] text-gris">Dates</dt>
                <dd className="m-0 mt-0.5 font-medium">
                  du {formatLong.format(session.debut)} au {formatLong.format(session.fin)}
                </dd>
              </div>
              <div>
                <dt className="t-balise text-[0.58rem] text-gris">Format</dt>
                <dd className="m-0 mt-0.5 font-medium">
                  {LIBELLE_FORMAT[session.format as keyof typeof LIBELLE_FORMAT]}
                  {session.dureeLibelle ? ` · ${session.dureeLibelle}` : ""}
                  {session.lieu ? ` · ${session.lieu}` : ""}
                </dd>
              </div>
              <div>
                <dt className="t-balise text-[0.58rem] text-gris">Participation</dt>
                <dd className="t-chiffres m-0 mt-0.5 text-[1.35rem] font-extrabold tracking-[-0.035em] text-marine">
                  {montant(session.prixFcfa)}{" "}
                  <span className="text-[0.68rem] font-medium tracking-normal text-gris">FCFA</span>
                </dd>
              </div>
              <div>
                <dt className="t-balise text-[0.58rem] text-gris">Places</dt>
                <dd className="m-0 mt-1.5">
                  <Cohorte capacite={session.capacite} pris={session.confirmees} compteur />
                </dd>
              </div>
              <div>
                <dt className="t-balise text-[0.58rem] text-gris">Au nom de</dt>
                <dd className="m-0 mt-0.5 font-medium">
                  {[utilisateur.prenom, utilisateur.nom].filter(Boolean).join(" ") ||
                    utilisateur.email}
                  {utilisateur.structure ? ` · ${utilisateur.structure}` : ""}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-ligne-douce pt-5">
              {existante ? (
                <>
                  <p className="m-0 text-gris">
                    Vous avez déjà une demande pour cette session
                    {existante.statut === "en_attente"
                      ? ", en attente de confirmation"
                      : existante.statut === "confirmee"
                        ? ", confirmée"
                        : ""}
                    .
                  </p>
                  <BoutonLien href="/espace/programmes" variante="marine" className="mt-4">
                    Voir mes programmes
                  </BoutonLien>
                </>
              ) : !possible ? (
                <>
                  <p className="m-0 text-gris">
                    {restantes === 0
                      ? "Cette session est complète."
                      : close
                        ? "Les inscriptions sont closes."
                        : "Cette session n'accepte pas d'inscription pour le moment."}
                  </p>
                  <BoutonLien
                    href={`/contact?sujet=${encodeURIComponent(`Prochaine session – ${session.programmeTitre}`)}`}
                    variante="fantomeClair"
                    className="mt-4"
                  >
                    Être prévenu de la prochaine
                  </BoutonLien>
                </>
              ) : (
                <form action={sInscrireALaSession}>
                  <input type="hidden" name="reference" value={session.reference} />
                  <Bouton type="submit" variante="marine" className="w-full justify-center">
                    Demander ma place
                  </Bouton>
                  <p className="mt-3 text-[0.82rem] text-gris">
                    Votre demande part en attente de confirmation. Nous vous recontactons pour
                    arrêter les modalités, puis votre place est validée. Clôture le{" "}
                    {formatLong.format(session.clotureAt)} – il reste {restantes}{" "}
                    {pluriel(restantes, "place")}.
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="mt-5 text-center text-[0.86rem] text-gris">
            <Link href={`/programmes/${session.programmeSlug}`} className="font-semibold text-marine">
              Revoir le programme
            </Link>
          </p>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
