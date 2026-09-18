import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Cascade, Element, HeroLigne, HeroTexte, HeroVisuel, Reveler } from "@/components/Animations";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { CarteProgramme, TitreSection } from "@/components/Vitrine";
import { Etiquette } from "@/components/ui/Etiquette";
import { derouleProgramme, listerProgrammes, slugsProgrammes, trouverProgramme } from "@/lib/catalogue";
import { photoProgramme } from "@/lib/photos";
import { dateCourte, formatLong, LIBELLE_FORMAT, LIBELLE_NATURE, montant, pluriel } from "@/lib/vocabulaire";

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

  const [modules, voisins] = await Promise.all([
    derouleProgramme(p.id),
    listerProgrammes({ domaine: p.domaine }).then((l) => l.filter((v) => v.slug !== p.slug).slice(0, 3)),
  ]);
  const s = p.prochaine;
  const marque = s ? ETAT[s.etat] : null;
  const nbSeances = modules.reduce((n, m) => n + m.seances.length, 0);

  /* Les repères posés sur le bandeau : ce qu'on veut savoir avant de lire. */
  const reperes = [
    p.dureeLibelle && { libelle: "Durée", valeur: p.dureeLibelle },
    { libelle: "Format", valeur: LIBELLE_FORMAT[p.format] },
    s?.lieu && { libelle: "Lieu", valeur: s.lieu },
    s && { libelle: "Prochaine date", valeur: dateCourte(s.debut) },
    nbSeances > 0 && { libelle: "Séances", valeur: String(nbSeances) },
  ].filter((r): r is { libelle: string; valeur: string } => Boolean(r));

  return (
    <>
      <Navigation actif="/programmes" />

      {/* Bandeau : le cadre sombre de l'accueil, avec la vignette du
          programme et les repères essentiels posés en bas. */}
      <section className="px-3 pt-3 sm:px-4">
        <div className="relative mx-auto flex min-h-[460px] max-w-[1400px] flex-col justify-end overflow-hidden rounded-grand bg-nuit text-white md:min-h-[540px]">
          <HeroVisuel className="absolute inset-0">
            <Image src={photoProgramme(p.domaine, p.imageUrl)} alt="" fill sizes="(max-width: 1400px) 100vw, 1400px" priority className="object-cover" />
          </HeroVisuel>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,24,47,.9)_0%,rgba(6,24,47,.55)_55%,rgba(6,24,47,.3)_100%)]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-nuit/95 to-transparent" />

          <div className="relative p-6 pt-24 sm:p-10 md:p-14 md:pt-28">
            <HeroTexte>
              <HeroLigne>
                <nav aria-label="Fil d'Ariane" className="mb-4 text-[0.82rem] text-white/70">
                  <Link href="/" className="no-underline hover:text-white">
                    Accueil
                  </Link>
                  <span className="mx-1.5">/</span>
                  <Link href="/programmes" className="no-underline hover:text-white">
                    Programmes
                  </Link>
                  <span className="mx-1.5">/</span>
                  <Link href={`/programmes?domaine=${encodeURIComponent(p.domaine)}`} className="no-underline hover:text-white">
                    {p.domaine}
                  </Link>
                </nav>
              </HeroLigne>
              <HeroLigne className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-canard px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase">
                  {LIBELLE_NATURE[p.nature]}
                </span>
                {marque && (
                  <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[0.72rem] font-semibold backdrop-blur-md">
                    {marque.texte}
                  </span>
                )}
              </HeroLigne>
              <HeroLigne>
                <h1 className="t-hero t-clair mt-4 max-w-[18ch] text-[clamp(2rem,4.6vw,3.4rem)]">{p.titre}</h1>
              </HeroLigne>
              {p.accroche && (
                <HeroLigne>
                  <p className="mt-4 max-w-[56ch] text-[1.05rem] text-white/80">{p.accroche}</p>
                </HeroLigne>
              )}
              {reperes.length > 0 && (
                <HeroLigne className="mt-8 flex flex-wrap gap-2.5">
                  {reperes.map((r) => (
                    <span key={r.libelle} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[0.82rem] backdrop-blur-md">
                      <span className="text-white/60">{r.libelle} · </span>
                      <span className="font-semibold">{r.valeur}</span>
                    </span>
                  ))}
                </HeroLigne>
              )}
            </HeroTexte>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.6fr_1fr] md:py-14">
        <Reveler>
          {p.description && <p className="max-w-[64ch] text-[1.05rem] leading-relaxed">{p.description}</p>}

          {p.objectifs.length > 0 && (
            <section className="mt-12">
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
            <section className="mt-12">
              <h2 className="t-h2 text-[1.5rem]">Le déroulé</h2>
              <p className="mt-1 text-[0.9rem] text-gris">
                {modules.length} {pluriel(modules.length, "module")} · {nbSeances} {pluriel(nbSeances, "séance")}
              </p>
              <ol className="relative mt-6 m-0 flex list-none flex-col gap-8 border-l-2 border-ligne pl-0">
                {modules.map((m, im) => (
                  <li key={m.id} className="relative pl-8">
                    <span
                      aria-hidden="true"
                      className="t-chiffres absolute top-0 -left-[19px] flex size-9 items-center justify-center rounded-full bg-marine text-[0.8rem] font-bold text-white ring-4 ring-white"
                    >
                      {String(im + 1).padStart(2, "0")}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="t-h3">{m.titre}</h3>
                      {m.resume && <p className="mt-1 text-[0.9rem] text-gris">{m.resume}</p>}
                    </div>
                    {m.seances.length > 0 && (
                      <ul className="mt-3 flex list-none flex-col gap-1.5 pl-0">
                        {m.seances.map((seance, i) => (
                          <li key={seance.id} className="flex items-center gap-3 rounded-[14px] bg-brume px-4 py-2.5 text-[0.92rem]">
                            <span className="t-chiffres w-6 shrink-0 text-[0.78rem] font-bold text-canard">{m.debut + i + 1}</span>
                            <span className="flex-1">{seance.titre}</span>
                            {seance.dureeMinutes > 0 && (
                              <span className="text-[0.78rem] text-gris">{Math.round(seance.dureeMinutes / 60)} h</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {p.prerequis.length > 0 && (
            <section className="mt-12">
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
        </Reveler>

        <aside className="md:sticky md:top-6 md:self-start">
          <Reveler delai={0.12}>
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
          </Reveler>
        </aside>
      </main>

      {voisins.length > 0 && (
        <section className="bg-brume">
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 md:py-20">
            <TitreSection
              sur={p.domaine}
              titre="Dans le même domaine"
              souligne="même domaine"
              action={
                <BoutonLien href={`/programmes?domaine=${encodeURIComponent(p.domaine)}`} variante="contour" taille="sm">
                  Tout le domaine
                </BoutonLien>
              }
            />
            <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {voisins.map((v) => (
                <Element key={v.slug}>
                  <CarteProgramme programme={v} />
                </Element>
              ))}
            </Cascade>
          </div>
        </section>
      )}

      <PiedDePage />
    </>
  );
}
