import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroLigne, HeroTexte, HeroVisuel, Reveler } from "@/components/Animations";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampTexte, classeLabel } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { demandesOuvertes, DEMANDES_OUVERTES_MAX, trouverMentor } from "@/lib/mentorat";
import { portrait } from "@/lib/photos";
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

const ETAPES = [
  "Vous décrivez votre situation et ce que vous cherchez à trancher.",
  "Le mentor répond sous 72 heures ouvrées, et accepte ou décline.",
  "S'il accepte, l'échange se poursuit dans un fil, à l'écrit ou en séance.",
];

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
      <Navigation actif="/mentorat" />

      <section className="relative overflow-hidden bg-brume">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-8 px-4 pt-10 pb-14 sm:px-6">
          <HeroVisuel className="relative block size-32 shrink-0 overflow-hidden rounded-full ring-8 ring-white shadow-carte md:size-40">
            <Image src={portrait(m.slug, m.avatarUrl)} alt="" fill sizes="160px" className="object-cover" priority />
          </HeroVisuel>
          <HeroTexte>
            <HeroLigne>
            <nav aria-label="Fil d'Ariane" className="mb-2 text-[0.82rem] text-gris">
              <Link href="/mentorat" className="no-underline hover:text-canard">
                Réseau de mentors
              </Link>
            </nav>
            <h1 className="t-hero text-[clamp(1.9rem,4.2vw,3rem)]">{m.nomComplet}</h1>
            <p className="mt-1.5 text-[1.05rem] text-gris">
              {m.titre}
              {m.organisation ? ` · ${m.organisation}` : ""}
            </p>
            {m.domaines.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.domaines.map((d) => (
                  <span key={d} className="rounded-full bg-pastel-ciel px-3 py-1 text-[0.78rem] font-semibold text-marine">
                    {d}
                  </span>
                ))}
              </div>
            )}
            </HeroLigne>
          </HeroTexte>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-8 rounded-t-[100%_100%] bg-white md:h-12" />
      </section>

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr] md:py-14">
        <Reveler>
          {m.presentation && <p className="max-w-[64ch] text-[1.05rem] leading-relaxed">{m.presentation}</p>}

          <h2 className="t-h2 mt-10 text-[1.5rem]">Comment ça se passe</h2>
          <ol className="mt-4 grid list-none gap-3 pl-0 sm:grid-cols-3">
            {ETAPES.map((etape, i) => (
              <li key={etape} className="rounded-carte bg-brume p-4 text-[0.92rem]">
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-canard text-[0.85rem] font-bold text-white">
                  {i + 1}
                </span>
                {etape}
              </li>
            ))}
          </ol>

          <h2 className="t-h2 mt-10 text-[1.5rem]">Écrire à {m.nomComplet.split(" ")[0]}</h2>

          <div className="mt-4">
            {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La demande n'a pas pu être envoyée."}</Alerte>}

            {!utilisateur ? (
              <div className="rounded-carte border border-ligne bg-white p-6 shadow-carte">
                <p className="text-gris">
                  Les demandes de mentorat sont réservées aux membres. La création de compte est gratuite.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <BoutonLien href={`/connexion?suite=/mentorat/${slug}`} variante="canard">
                    Se connecter
                  </BoutonLien>
                  <BoutonLien href="/creer-un-compte" variante="contour">
                    Créer un compte
                  </BoutonLien>
                </div>
              </div>
            ) : soiMeme ? (
              <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
                C&apos;est votre propre fiche. Vos créneaux et vos demandes reçues sont dans{" "}
                <Link href="/espace/mentorat" className="font-semibold text-canard">
                  votre espace
                </Link>
                .
              </p>
            ) : plafondAtteint ? (
              <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
                Vous avez déjà {ouvertes} demandes en attente de réponse, c&apos;est le maximum. Cette limite
                existe pour que chaque demande reçoive une vraie réponse.{" "}
                <Link href="/espace/mentorat" className="font-semibold text-canard">
                  Voir mes demandes
                </Link>
                .
              </p>
            ) : (
              <form action={envoyerDemande} className="flex flex-col gap-4 rounded-carte border border-ligne bg-white p-6 shadow-carte">
                <input type="hidden" name="mentor" value={slug} />

                {m.creneauxLibres === 0 && (
                  <p className="rounded-puce bg-pastel-soleil px-4 py-3 text-[0.88rem] text-[#8a5f14]">
                    Ce mentor n&apos;a pas de créneau ouvert en ce moment. Vous pouvez tout de même écrire :
                    il vous proposera une date s&apos;il accepte.
                  </p>
                )}

                <Champ id="objet" name="objet" label="Objet" required maxLength={160} placeholder="Ex. Structurer une direction de la performance" />

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
                  <div className="flex flex-wrap gap-4 text-[0.92rem]">
                    {(["en_ligne", "presentiel", "hybride"] as const).map((f, i) => (
                      <label key={f} className="flex items-center gap-2">
                        <input type="radio" name="format" value={f} defaultChecked={i === 0} className="accent-canard" />
                        {LIBELLE_FORMAT[f]}
                      </label>
                    ))}
                  </div>
                </div>

                {m.creneaux.length > 0 && (
                  <div>
                    <span className={classeLabel}>
                      Créneaux ouverts ({m.creneaux.length} {pluriel(m.creneaux.length, "disponible")})
                    </span>
                    <div className="flex flex-col gap-2 text-[0.92rem]">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="creneau" value="" defaultChecked className="accent-canard" />
                        Peu importe, à convenir ensemble
                      </label>
                      {m.creneaux.map((c) => (
                        <label key={c.id} className="flex items-center gap-2">
                          <input type="radio" name="creneau" value={c.id} className="accent-canard" />
                          {formatDateHeure.format(c.debutAt)} · {c.dureeMinutes} min · {LIBELLE_FORMAT[c.format]}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Bouton type="submit" variante="canard" taille="lg" className="mt-1 w-full">
                  Envoyer la demande
                </Bouton>
                <p className="text-[0.8rem] text-gris">
                  Réponse sous 72 heures ouvrées. Vous pouvez avoir {DEMANDES_OUVERTES_MAX} demandes en attente au
                  maximum{ouvertes > 0 ? `, il vous en reste ${DEMANDES_OUVERTES_MAX - ouvertes}` : ""}.
                </p>
              </form>
            )}
          </div>
        </Reveler>

        <aside className="md:sticky md:top-6 md:self-start">
          <Reveler delai={0.12}>
          <div className="rounded-carte border border-ligne bg-white p-6 shadow-carte">
            <p className="text-[0.78rem] font-semibold text-canard">Disponibilité</p>
            {m.creneauxLibres > 0 ? (
              <>
                <p className="t-chiffres mt-1 text-[2rem] leading-none font-extrabold text-marine">{m.creneauxLibres}</p>
                <p className="mt-1 text-[0.9rem] text-gris">
                  {pluriel(m.creneauxLibres, "créneau", "créneaux")} {pluriel(m.creneauxLibres, "ouvert")} à venir
                </p>
              </>
            ) : (
              <p className="mt-1 text-[0.95rem] font-semibold text-marine">Sur demande</p>
            )}
            <p className="mt-4 border-t border-ligne pt-4 text-[0.86rem] text-gris">
              Quota de {m.quotaMensuel} {pluriel(m.quotaMensuel, "accompagnement")} par mois. C&apos;est ce qui
              garantit qu&apos;une demande acceptée reçoit vraiment du temps.
            </p>
          </div>
          </Reveler>
        </aside>
      </main>

      <PiedDePage />
    </>
  );
}
