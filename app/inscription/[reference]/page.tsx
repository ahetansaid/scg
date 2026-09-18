import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EnTete } from "@/components/EnTete";
import { Cohorte } from "@/components/motifs/Cohorte";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { dejaInscrit, sessionOuverte } from "@/lib/espace";
import { formatLong, LIBELLE_FORMAT, montant, pluriel } from "@/lib/vocabulaire";

import { sInscrireALaSession } from "../../espace/actions";

export const metadata: Metadata = { title: "Réserver une place" };

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-ligne py-3 last:border-b-0">
      <dt className="text-[0.86rem] font-semibold text-gris">{label}</dt>
      <dd className="text-right font-semibold text-marine">{children}</dd>
    </div>
  );
}

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
      <EnTete
        etroit
        actif="/programmes"
        fil={[
          { href: "/programmes", libelle: "Programmes" },
          { href: `/programmes/${session.programmeSlug}`, libelle: session.programmeTitre },
        ]}
        sur="Réservation"
        titre={session.programmeTitre}
        sous={<p>Session {session.reference}</p>}
      />

      <main className="mx-auto max-w-[680px] px-4 py-10 sm:px-6 md:py-14">
        {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La demande a échoué."}</Alerte>}

        <div className="rounded-carte border border-ligne bg-white p-6 shadow-carte md:p-8">
          <dl className="m-0">
            <Ligne label="Dates">
              du {formatLong.format(session.debut)} au {formatLong.format(session.fin)}
            </Ligne>
            <Ligne label="Format">
              {LIBELLE_FORMAT[session.format as keyof typeof LIBELLE_FORMAT]}
              {session.dureeLibelle ? ` · ${session.dureeLibelle}` : ""}
            </Ligne>
            {session.lieu && <Ligne label="Lieu">{session.lieu}</Ligne>}
            <Ligne label="Participation">
              <span className="t-chiffres text-[1.2rem] font-extrabold">{montant(session.prixFcfa)} FCFA</span>
            </Ligne>
            <Ligne label="Places">
              <Cohorte capacite={session.capacite} pris={session.confirmees} compteur />
            </Ligne>
            <Ligne label="Au nom de">
              {[utilisateur.prenom, utilisateur.nom].filter(Boolean).join(" ") || utilisateur.email}
              {utilisateur.structure ? ` · ${utilisateur.structure}` : ""}
            </Ligne>
          </dl>

          <div className="mt-6">
            {existante ? (
              <>
                <p className="text-gris">
                  Vous avez déjà une demande pour cette session
                  {existante.statut === "en_attente" ? ", en attente de confirmation" : existante.statut === "confirmee" ? ", confirmée" : ""}.
                </p>
                <BoutonLien href="/espace/programmes" variante="canard" className="mt-4">
                  Voir mes programmes
                </BoutonLien>
              </>
            ) : !possible ? (
              <>
                <p className="text-gris">
                  {restantes === 0 ? "Cette session est complète." : close ? "Les inscriptions sont closes." : "Cette session n'accepte pas d'inscription pour le moment."}
                </p>
                <BoutonLien
                  href={`/contact?sujet=${encodeURIComponent(`Prochaine session – ${session.programmeTitre}`)}`}
                  variante="contour"
                  className="mt-4"
                >
                  Être prévenu de la prochaine
                </BoutonLien>
              </>
            ) : (
              <form action={sInscrireALaSession}>
                <input type="hidden" name="reference" value={session.reference} />
                <Bouton type="submit" variante="canard" taille="lg" className="w-full">
                  Demander ma place
                </Bouton>
                <p className="mt-3 text-[0.85rem] text-gris">
                  Votre demande part en attente de confirmation. Nous vous recontactons pour arrêter les modalités, puis
                  votre place est validée. Clôture le {formatLong.format(session.clotureAt)}, il reste {restantes}{" "}
                  {pluriel(restantes, "place")}.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[0.9rem]">
          <Link href={`/programmes/${session.programmeSlug}`} className="font-semibold text-canard">
            ← Revoir le programme
          </Link>
        </p>
      </main>

      <PiedDePage />
    </>
  );
}
