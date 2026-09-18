import type { Metadata } from "next";
import Link from "next/link";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { ArcTrajectoire } from "@/components/motifs/Arc";
import { BoutonLien } from "@/components/ui/Bouton";
import { exigerUtilisateur } from "@/lib/auth";
import { mesEcheances, mesInscriptions, prochainesSessions, trajectoire } from "@/lib/espace";
import { formatDateHeure, montant, pluriel } from "@/lib/vocabulaire";

export const metadata: Metadata = { title: "Ma trajectoire" };

export default async function Espace() {
  const utilisateur = await exigerUtilisateur();
  const liste = await mesInscriptions(utilisateur.id);
  const [echeances, propositions] = await Promise.all([
    mesEcheances(utilisateur.id, liste),
    liste.length === 0 ? prochainesSessions(4) : Promise.resolve([]),
  ]);

  const etapes = trajectoire(liste);
  const enCours = liste.filter((i) => i.statut === "confirmee");
  const enAttente = liste.filter((i) => i.statut === "en_attente");
  const prochaine = echeances[0];

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace">
      <TitrePage
        surtitre="Espace membre"
        titre="Bonjour"
        accent={utilisateur.prenom || utilisateur.email}
        sous={
          prochaine
            ? `Prochaine échéance : ${prochaine.titre}, ${formatDateHeure.format(prochaine.quand)}.`
            : "Aucune échéance à venir."
        }
        actions={
          <BoutonLien href="/programmes" variante="marine" taille="sm">
            Voir le calendrier
          </BoutonLien>
        }
      />

      {etapes.length > 0 && (
        <section className="mb-3.5 overflow-hidden rounded-carte bg-marine p-5 text-[#dce7f1]">
          <p className="t-etiquette text-[0.6rem] text-[#7fa3c4]">Votre trajectoire</p>
          <p className="mt-1 text-[1.02rem] font-bold tracking-[-0.025em] text-white">
            {etapes.filter((e) => e.etat === "termine").length} sur {etapes.length}{" "}
            {pluriel(etapes.length, "programme")}
          </p>
          <div className="mt-3">
            <ArcTrajectoire etapes={etapes} />
          </div>
        </section>
      )}

      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <Panneau
          titre="Vos prochaines échéances"
          extra={`${echeances.length} ${pluriel(echeances.length, "à venir")}`}
        >
          {echeances.length === 0 ? (
            <Vide>
              Rien de programmé.{" "}
              <Link href="/programmes" className="font-semibold text-marine">
                Parcourez le catalogue
              </Link>{" "}
              pour vous inscrire à une session.
            </Vide>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-3 pl-0 text-[0.84rem]">
              {echeances.map((e) => (
                <li key={`${e.titre}-${e.quand.toISOString()}`} className="grid grid-cols-[auto_1fr] gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 block size-2 shrink-0 rounded-full ${
                      e.nature === "mentorat" ? "bg-canard" : "bg-soleil"
                    }`}
                  />
                  <span>
                    <b className="block font-semibold tracking-[-0.015em]">{e.titre}</b>
                    <span className="text-[0.78rem] text-gris">
                      {formatDateHeure.format(e.quand)} · {e.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panneau>

        <Panneau titre="Vos programmes" extra={`${liste.length} au total`}>
          {liste.length === 0 ? (
            <Vide>Vous n&apos;êtes inscrit à aucun programme pour l&apos;instant.</Vide>
          ) : (
            <div className="flex flex-col gap-3.5">
              {enCours.slice(0, 4).map((i) => (
                <div key={i.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-3 text-[0.8rem]">
                    <b className="font-semibold">{i.programme.titre}</b>
                    <span className="t-chiffres font-mono text-[0.72rem] text-gris">
                      {i.seancesTotal > 0 ? `${i.seancesFaites}/${i.seancesTotal}` : "–"}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-brume-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-marine to-azur"
                      style={{ width: `${i.progression}%` }}
                    />
                  </div>
                </div>
              ))}

              {enAttente.length > 0 && (
                <p className="m-0 border-t border-ligne pt-3 text-[0.82rem] text-gris">
                  {enAttente.length} {pluriel(enAttente.length, "demande")}{" "}
                  {pluriel(enAttente.length, "en attente de confirmation")}.
                </p>
              )}

              <BoutonLien href="/espace/programmes" variante="contourMarine" taille="sm" className="self-start">
                Tout voir
              </BoutonLien>
            </div>
          )}
        </Panneau>
      </div>

      {propositions.length > 0 && (
        <Panneau titre="Sessions ouvertes" extra="à venir" className="mt-3.5">
          <ul className="m-0 flex list-none flex-col gap-2.5 pl-0">
            {propositions.map((s) => (
              <li key={s.reference} className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <Link
                    href={`/programmes/${s.slug}`}
                    className="text-[0.92rem] font-semibold text-encre no-underline hover:text-marine"
                  >
                    {s.titre}
                  </Link>
                  <span className="t-etiquette mt-0.5 block text-[0.58rem] text-gris">
                    {formatDateHeure.format(s.debut)} · {montant(s.prixFcfa)} FCFA
                  </span>
                </span>
                <BoutonLien href={`/inscription/${s.reference}`} variante="marine" taille="sm">
                  S&apos;inscrire
                </BoutonLien>
              </li>
            ))}
          </ul>
        </Panneau>
      )}
    </Application>
  );
}
