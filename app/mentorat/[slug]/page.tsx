import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampTexte, classeLabel } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { demandesOuvertes, DEMANDES_OUVERTES_MAX, trouverMentor } from "@/lib/mentorat";
import { formatDateHeure, LIBELLE_FORMAT, pluriel } from "@/lib/vocabulaire";

import { envoyerDemande } from "../actions";

export async function generateMetadata(props: PageProps<"/mentorat/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = await trouverMentor(slug);
  if (!m) return { title: "Mentor introuvable" };
  return { title: m.nomComplet, description: `${m.titre}${m.organisation ? ` · ${m.organisation}` : ""}` };
}

const ERREURS: Record<string, string> = {
  objet: "Donnez un objet à votre demande, au moins cinq caractères.",
  message: "Votre message fait moins de quarante caractères. Un mentor a besoin de contexte pour répondre utilement.",
  plafond: `Vous avez déjà ${DEMANDES_OUVERTES_MAX} demandes en attente de réponse. Attendez une réponse avant d'en envoyer une autre.`,
  quota: "Ce mentor a atteint son quota du mois. Revenez au début du mois prochain.",
  creneau: "Ce créneau vient d'être pris. Choisissez-en un autre.",
  "soi-meme": "Vous ne pouvez pas vous adresser une demande à vous-même.",
  debit: "Trop de demandes envoyées récemment. Réessayez dans une heure.",
  introuvable: "Ce mentor n'est plus disponible.",
};

export default async function FicheMentor(props: PageProps<"/mentorat/[slug]">) {
  const { slug } = await props.params;
  const [m, utilisateur] = await Promise.all([trouverMentor(slug), utilisateurCourant()]);
  if (!m) notFound();

  const params = await props.searchParams;
  const v = params.erreur;
  const erreur = Array.isArray(v) ? v[0] : v;

  const ouvertes = utilisateur ? await demandesOuvertes(utilisateur.id) : 0;
  const plafondAtteint = ouvertes >= DEMANDES_OUVERTES_MAX;
  const soiMeme = utilisateur?.id === m.userId;

  return (
    <>
      <div
        className="pb-9"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 70%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/mentorat" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">
            <Link href="/mentorat" className="text-laiton no-underline hover:underline">
              Réseau
            </Link>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span
              className="t-italique flex size-[68px] items-center justify-center rounded-[18px] text-[1.7rem] text-white"
              style={{ background: "linear-gradient(135deg,#8a5f14,#d89b34)" }}
              aria-hidden="true"
            >
              {m.initiales}
            </span>
            <div>
              <h1 className="t-h2 text-white">{m.nomComplet}</h1>
              <p className="mt-1 text-[#b9cddf]">
                {m.titre}
                {m.organisation ? ` · ${m.organisation}` : ""}
              </p>
            </div>
          </div>

          {m.domaines.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.domaines.map((d) => (
                <span
                  key={d}
                  className="t-balise rounded-etiquette bg-azur/16 px-[9px] py-[4px] text-[0.58rem] text-[#8cc5e8]"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto grid max-w-[1010px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.4fr_1fr] md:py-14">
          <div>
            {m.presentation && <p className="max-w-[62ch] text-[1.02rem]">{m.presentation}</p>}

            <h2 className="t-h3 mt-9 mb-3">Comment ça se passe</h2>
            <ol className="m-0 flex list-none flex-col gap-3 pl-0 text-[0.94rem]">
              {[
                "Vous décrivez votre situation et ce que vous cherchez à trancher.",
                "Le mentor répond sous 72 heures ouvrées, et accepte ou décline.",
                "S'il accepte, l'échange se poursuit dans un fil, à l'écrit ou en séance.",
              ].map((etape, i) => (
                <li key={etape} className="grid grid-cols-[26px_1fr] gap-3">
                  <span className="t-balise text-[0.61rem] tracking-[0.1em] text-laiton-fonce">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{etape}</span>
                </li>
              ))}
            </ol>

            <h2 className="t-h3 mt-9 mb-3">Écrire à {m.nomComplet.split(" ")[0]}</h2>

            {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La demande n'a pas pu être envoyée."}</Alerte>}

            {!utilisateur ? (
              <div className="rounded-carte border border-ligne bg-white p-5">
                <p className="m-0 text-gris">
                  Les demandes de mentorat sont réservées aux membres. La création de compte est
                  gratuite.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <BoutonLien href={`/connexion?suite=/mentorat/${slug}`} variante="marine">
                    Se connecter
                  </BoutonLien>
                  <BoutonLien href="/creer-un-compte" variante="fantomeClair">
                    Créer un compte
                  </BoutonLien>
                </div>
              </div>
            ) : soiMeme ? (
              <p className="rounded-carte border border-ligne bg-white p-5 text-gris">
                C&apos;est votre propre fiche. Vos créneaux et vos demandes reçues sont dans{" "}
                <Link href="/espace/mentorat" className="font-semibold text-marine">
                  votre espace
                </Link>
                .
              </p>
            ) : plafondAtteint ? (
              <p className="rounded-carte border border-ligne bg-white p-5 text-gris">
                Vous avez déjà {ouvertes} demandes en attente de réponse, c&apos;est le maximum.
                Cette limite existe pour que chaque demande reçoive une vraie réponse.{" "}
                <Link href="/espace/mentorat" className="font-semibold text-marine">
                  Voir mes demandes
                </Link>
                .
              </p>
            ) : m.creneauxLibres === 0 ? (
              <p className="rounded-carte border border-ligne bg-white p-5 text-gris">
                Ce mentor n&apos;a pas de créneau ouvert en ce moment. Vous pouvez tout de même
                envoyer une demande : il vous proposera une date s&apos;il accepte.
              </p>
            ) : null}

            {utilisateur && !soiMeme && !plafondAtteint && (
              <form
                action={envoyerDemande}
                className="mt-4 flex flex-col gap-4 rounded-panneau border border-ligne bg-white p-5"
              >
                <input type="hidden" name="mentor" value={slug} />

                <Champ
                  id="objet"
                  name="objet"
                  label="Objet"
                  required
                  maxLength={160}
                  placeholder="Ex. Structurer une direction de la performance"
                />

                <ChampTexte
                  id="message"
                  name="message"
                  label="Votre message"
                  required
                  rows={6}
                  maxLength={4000}
                  aide="Décrivez votre situation, la décision que vous cherchez à trancher, et ce que vous avez déjà essayé."
                />

                <div>
                  <span className={classeLabel}>Format souhaité</span>
                  <div className="flex flex-wrap gap-4 text-[0.9rem]">
                    {(["en_ligne", "presentiel", "hybride"] as const).map((f, i) => (
                      <label key={f} className="flex items-center gap-2">
                        <input type="radio" name="format" value={f} defaultChecked={i === 0} />
                        {LIBELLE_FORMAT[f]}
                      </label>
                    ))}
                  </div>
                </div>

                {m.creneaux.length > 0 && (
                  <div>
                    <span className={classeLabel}>
                      Créneaux ouverts ({m.creneaux.length}{" "}
                      {pluriel(m.creneaux.length, "disponible")})
                    </span>
                    <div className="flex flex-col gap-2 text-[0.9rem]">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="creneau" value="" defaultChecked />
                        Peu importe, à convenir ensemble
                      </label>
                      {m.creneaux.map((c) => (
                        <label key={c.id} className="flex items-center gap-2">
                          <input type="radio" name="creneau" value={c.id} />
                          {formatDateHeure.format(c.debutAt)} · {c.dureeMinutes} min ·{" "}
                          {LIBELLE_FORMAT[c.format]}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Bouton type="submit" variante="marine" className="mt-1 w-full justify-center">
                  Envoyer la demande
                </Bouton>
                <p className="m-0 text-[0.8rem] text-gris">
                  Réponse sous 72 heures ouvrées. Vous pouvez avoir {DEMANDES_OUVERTES_MAX}{" "}
                  demandes en attente au maximum
                  {ouvertes > 0 ? ` – il vous en reste ${DEMANDES_OUVERTES_MAX - ouvertes}` : ""}.
                </p>
              </form>
            )}
          </div>

          <aside className="md:sticky md:top-6 md:self-start">
            <div className="rounded-panneau border border-ligne bg-white p-5">
              <p className="t-balise text-[0.6rem] text-laiton-fonce">Disponibilité</p>
              {m.creneauxLibres > 0 ? (
                <>
                  <p className="mt-2 text-[1.5rem] font-extrabold tracking-[-0.035em] text-marine">
                    {m.creneauxLibres}
                  </p>
                  <p className="mt-0.5 text-[0.86rem] text-gris">
                    {pluriel(m.creneauxLibres, "créneau", "créneaux")}{" "}
                    {pluriel(m.creneauxLibres, "ouvert")} à venir
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[0.9rem] text-gris">Aucun créneau ouvert actuellement.</p>
              )}

              <p className="mt-4 border-t border-ligne-douce pt-4 text-[0.84rem] text-gris">
                Quota de {m.quotaMensuel} {pluriel(m.quotaMensuel, "accompagnement")} par mois.
                C&apos;est ce qui garantit qu&apos;une demande acceptée reçoit vraiment du temps.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
