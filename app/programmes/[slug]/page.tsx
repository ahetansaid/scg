import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ETIQUETTE_SESSION } from "@/components/CarteProgramme";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { Etiquette } from "@/components/ui/Etiquette";
import { derouleProgramme, slugsProgrammes, trouverProgramme } from "@/lib/catalogue";
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

export default async function FicheProgramme(props: PageProps<"/programmes/[slug]">) {
  const { slug } = await props.params;
  const p = await trouverProgramme(slug);
  if (!p) notFound();

  const modules = await derouleProgramme(p.id);
  const s = p.prochaine;
  const marque = s ? ETIQUETTE_SESSION[s.etat] : null;

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
        <Navigation actif="/programmes" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">
            <Link href="/programmes" className="text-laiton no-underline hover:underline">
              Catalogue
            </Link>{" "}
            · {LIBELLE_NATURE[p.nature]} · {p.domaine}
          </p>

          <h1 className="t-h2 mt-2 max-w-[20ch] text-white">{p.titre}</h1>
          {p.accroche && <p className="mt-3 max-w-[52ch] text-[#b9cddf]">{p.accroche}</p>}

          {s && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {marque && (
                <Etiquette etat={marque.etat} fond="nuit">
                  {marque.texte}
                </Etiquette>
              )}
              <Cohorte capacite={s.capacite} pris={s.confirmees} fond="nuit" compteur />
            </div>
          )}
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto grid max-w-[1010px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.6fr_1fr] md:py-14">
          <div>
            {p.description && <p className="max-w-[62ch] text-[1.02rem]">{p.description}</p>}

            {p.objectifs.length > 0 && (
              <>
                <h2 className="t-h3 mt-9 mb-3">Ce que vous en repartez avec</h2>
                <ul className="m-0 flex list-none flex-col gap-2 pl-0">
                  {p.objectifs.map((o) => (
                    <li key={o} className="flex gap-3 text-[0.94rem]">
                      <span
                        aria-hidden="true"
                        className="mt-2 block size-1.5 shrink-0 rounded-full bg-laiton-fonce"
                      />
                      {o}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {modules.length > 0 && (
              <>
                <h2 className="t-h3 mt-9 mb-3">Le déroulé</h2>
                <div className="border-t border-[rgba(6,24,47,.14)]">
                  {modules.map((m) => (
                    <section key={m.id} className="border-b border-[rgba(6,24,47,.1)] py-4">
                      <h3 className="t-balise m-0 text-[0.61rem] text-laiton-fonce">{m.titre}</h3>
                      {m.resume && <p className="mt-1 text-[0.86rem] text-gris">{m.resume}</p>}
                      <ol className="mt-2 flex list-none flex-col gap-2 pl-0">
                        {m.seances.map((seance, i) => (
                          <li key={seance.id} className="grid grid-cols-[26px_1fr_auto] gap-3">
                            <span className="t-balise text-[0.61rem] tracking-[0.1em] text-laiton-fonce">
                              {String(m.debut + i + 1).padStart(2, "0")}
                            </span>
                            <span className="t-italique text-[1.02rem]">{seance.titre}</span>
                            {seance.dureeMinutes > 0 && (
                              <span className="t-balise text-[0.58rem] text-gris">
                                {Math.round(seance.dureeMinutes / 60)} h
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              </>
            )}

            {p.prerequis.length > 0 && (
              <>
                <h2 className="t-h3 mt-9 mb-3">Pour qui</h2>
                <ul className="m-0 flex list-none flex-col gap-2 pl-0 text-[0.94rem] text-gris">
                  {p.prerequis.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Le prix et l'action restent visibles pendant qu'on lit le déroulé. */}
          <aside className="md:sticky md:top-6 md:self-start">
            <div className="rounded-panneau border border-ligne bg-white p-5">
              {s ? (
                <>
                  <p className="t-chiffres m-0 text-[1.5rem] font-extrabold tracking-[-0.035em] text-marine">
                    {montant(s.prixFcfa)}{" "}
                    <span className="text-[0.7rem] font-medium tracking-normal text-gris">FCFA</span>
                  </p>

                  <dl className="mt-5 flex flex-col gap-3 border-t border-ligne-douce pt-4 text-[0.86rem]">
                    <div>
                      <dt className="t-balise text-[0.58rem] text-gris">Dates</dt>
                      <dd className="m-0 mt-0.5 font-medium">
                        du {formatLong.format(s.debut)}
                        <br />
                        au {formatLong.format(s.fin)}
                      </dd>
                    </div>
                    <div>
                      <dt className="t-balise text-[0.58rem] text-gris">Format</dt>
                      <dd className="m-0 mt-0.5 font-medium">
                        {LIBELLE_FORMAT[p.format]}
                        {p.dureeLibelle ? ` · ${p.dureeLibelle}` : ""}
                      </dd>
                    </div>
                    {s.lieu && (
                      <div>
                        <dt className="t-balise text-[0.58rem] text-gris">Lieu</dt>
                        <dd className="m-0 mt-0.5 font-medium">{s.lieu}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="t-balise text-[0.58rem] text-gris">Places</dt>
                      <dd className="m-0 mt-1.5">
                        <Cohorte capacite={s.capacite} pris={s.confirmees} compteur />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    {s.etat === "complete" || s.etat === "close" ? (
                      <>
                        <BoutonLien
                          href={`/contact?sujet=${encodeURIComponent(`Prochaine session – ${p.titre}`)}`}
                          variante="fantomeClair"
                          className="w-full justify-center"
                        >
                          Être prévenu de la prochaine
                        </BoutonLien>
                        <p className="mt-2 text-[0.78rem] text-gris">
                          {s.etat === "complete"
                            ? "Cette session est complète."
                            : "Les inscriptions sont closes."}{" "}
                          Nous vous écrirons à l&apos;ouverture de la suivante.
                        </p>
                      </>
                    ) : (
                      <>
                        <BoutonLien
                          href={`/inscription/${s.reference}`}
                          variante="marine"
                          className="w-full justify-center"
                        >
                          Réserver ma place
                        </BoutonLien>
                        <p className="mt-2 text-[0.78rem] text-gris">
                          Clôture des inscriptions le {formatLong.format(s.cloture)}. Il reste{" "}
                          {s.restantes} {pluriel(s.restantes, "place")}.
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <p className="m-0 text-gris">
                  Aucune session programmée pour l&apos;instant.{" "}
                  <Link href="/contact" className="font-semibold text-marine">
                    Écrivez-nous
                  </Link>{" "}
                  pour être prévenu.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
