import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { Etiquette } from "@/components/ui/Etiquette";
import { derouleProgramme, slugsProgrammes, trouverProgramme } from "@/lib/catalogue";
import { photoProgramme } from "@/lib/photos";
import { formatLong, LIBELLE_FORMAT, LIBELLE_NATURE, montant, pluriel } from "@/lib/vocabulaire";

export const revalidate = 600;

export async function generateStaticParams() {
  return (await slugsProgrammes()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/programmes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await trouverProgramme(slug);
  if (!p) return { title: "Programme introuvable" };
  return { title: p.titre, description: p.accroche };
}

const ETAT = {
  ouverte: { etat: "ouvert", texte: "Inscriptions ouvertes" },
  dernieres: { etat: "bientot", texte: "Dernières places" },
  complete: { etat: "complet", texte: "Complet" },
  close: { etat: "neutre", texte: "Inscriptions closes" },
} as const;

export default async function FicheProgramme(props: PageProps<"/programmes/[slug]">) {
  const { slug } = await props.params;
  const p = await trouverProgramme(slug);
  if (!p) notFound();

  const modules = await derouleProgramme(p.id);
  const s = p.prochaine;
  const marque = s ? ETAT[s.etat] : null;

  return (
    <>
      <Navigation actif="/programmes" />

      {/* Bandeau : vignette large avec le titre par-dessus, comme une carte
          de cours agrandie. */}
      <section className="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-[0.82rem] text-gris">
          <Link href="/" className="no-underline hover:text-canard">
            Accueil
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/programmes" className="no-underline hover:text-canard">
            Programmes
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-marine">{p.domaine}</span>
        </nav>

        <div className="relative overflow-hidden rounded-grand">
          <div className="relative aspect-[16/7] min-h-[260px]">
            <Image src={photoProgramme(p.domaine, p.imageUrl)} alt="" fill sizes="1180px" priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-nuit/85 via-nuit/35 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-canard px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase">
                {LIBELLE_NATURE[p.nature]}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.72rem] font-semibold backdrop-blur">
                {p.domaine}
              </span>
            </div>
            <h1 className="mt-3 max-w-[22ch] text-[clamp(1.7rem,4vw,2.8rem)] leading-tight font-extrabold tracking-[-0.025em]">
              {p.titre}
            </h1>
            {p.accroche && <p className="mt-2 max-w-[56ch] text-white/85">{p.accroche}</p>}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.6fr_1fr] md:py-14">
        <div>
          {p.description && <p className="max-w-[64ch] text-[1.05rem] leading-relaxed">{p.description}</p>}

          {p.objectifs.length > 0 && (
            <section className="mt-10">
              <h2 className="t-h2 text-[1.5rem]">Ce que vous en repartez avec</h2>
              <ul className="mt-4 grid list-none gap-3 pl-0 sm:grid-cols-2">
                {p.objectifs.map((o) => (
                  <li key={o} className="flex gap-3 rounded-carte bg-brume p-4 text-[0.95rem]">
                    <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-canard text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {modules.length > 0 && (
            <section className="mt-10">
              <h2 className="t-h2 text-[1.5rem]">Le déroulé</h2>
              <div className="mt-4 flex flex-col gap-3">
                {modules.map((m) => (
                  <details key={m.id} open className="group rounded-carte border border-ligne bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                      <span>
                        <span className="t-h3">{m.titre}</span>
                        {m.resume && <span className="mt-0.5 block text-[0.86rem] text-gris">{m.resume}</span>}
                      </span>
                      <span className="text-[0.8rem] font-semibold whitespace-nowrap text-gris">
                        {m.seances.length} {pluriel(m.seances.length, "séance")}
                      </span>
                    </summary>
                    <ol className="m-0 flex list-none flex-col border-t border-ligne pl-0">
                      {m.seances.map((seance, i) => (
                        <li key={seance.id} className="flex items-center gap-4 border-b border-ligne px-5 py-3 last:border-b-0">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pastel-ciel text-[0.8rem] font-bold text-marine">
                            {m.debut + i + 1}
                          </span>
                          <span className="flex-1 text-[0.95rem]">{seance.titre}</span>
                          {seance.dureeMinutes > 0 && (
                            <span className="text-[0.8rem] text-gris">{Math.round(seance.dureeMinutes / 60)} h</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </details>
                ))}
              </div>
            </section>
          )}

          {p.prerequis.length > 0 && (
            <section className="mt-10">
              <h2 className="t-h2 text-[1.5rem]">Pour qui</h2>
              <ul className="mt-4 flex list-none flex-col gap-2 pl-0 text-[0.95rem] text-gris">
                {p.prerequis.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-canard" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="md:sticky md:top-6 md:self-start">
          <div className="rounded-carte border border-ligne bg-white p-6 shadow-carte">
            {s ? (
              <>
                {marque && <Etiquette etat={marque.etat}>{marque.texte}</Etiquette>}
                <p className="t-chiffres mt-3 text-[2rem] leading-none font-extrabold text-marine">
                  {montant(s.prixFcfa)}{" "}
                  <span className="text-[0.85rem] font-semibold text-gris">FCFA</span>
                </p>

                <dl className="mt-5 flex flex-col gap-3.5 border-t border-ligne pt-5 text-[0.9rem]">
                  <div>
                    <dt className="text-[0.78rem] font-semibold text-gris">Dates</dt>
                    <dd className="mt-0.5 font-semibold text-marine">
                      du {formatLong.format(s.debut)} au {formatLong.format(s.fin)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.78rem] font-semibold text-gris">Format</dt>
                    <dd className="mt-0.5 font-semibold text-marine">
                      {LIBELLE_FORMAT[p.format]}
                      {p.dureeLibelle ? ` · ${p.dureeLibelle}` : ""}
                    </dd>
                  </div>
                  {s.lieu && (
                    <div>
                      <dt className="text-[0.78rem] font-semibold text-gris">Lieu</dt>
                      <dd className="mt-0.5 font-semibold text-marine">{s.lieu}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[0.78rem] font-semibold text-gris">Places</dt>
                    <dd className="mt-1.5">
                      <Cohorte capacite={s.capacite} pris={s.confirmees} compteur />
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  {s.etat === "complete" || s.etat === "close" ? (
                    <>
                      <BoutonLien
                        href={`/contact?sujet=${encodeURIComponent(`Prochaine session – ${p.titre}`)}`}
                        variante="contour"
                        className="w-full"
                      >
                        Être prévenu de la prochaine
                      </BoutonLien>
                      <p className="mt-2 text-[0.8rem] text-gris">
                        {s.etat === "complete" ? "Cette session est complète." : "Les inscriptions sont closes."}
                      </p>
                    </>
                  ) : (
                    <>
                      <BoutonLien href={`/inscription/${s.reference}`} variante="canard" taille="lg" className="w-full">
                        Réserver ma place
                      </BoutonLien>
                      <p className="mt-2 text-[0.8rem] text-gris">
                        Clôture le {formatLong.format(s.cloture)} · {s.restantes} {pluriel(s.restantes, "place")}{" "}
                        {pluriel(s.restantes, "restante")}
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gris">
                Aucune session programmée pour l&apos;instant.{" "}
                <Link href="/contact" className="font-semibold text-canard">
                  Écrivez-nous
                </Link>{" "}
                pour être prévenu.
              </p>
            )}
          </div>
        </aside>
      </main>

      <PiedDePage />
    </>
  );
}
