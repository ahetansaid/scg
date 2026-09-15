import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Corps, Figure } from "@/components/Blocs";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { slugsPublications, trouverRapport } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

export const revalidate = 600;

export async function generateStaticParams() {
  const { rapports } = await slugsPublications();
  return rapports.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/publications/rapports/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const r = await trouverRapport(slug);
  if (!r) return { title: "Rapport introuvable" };
  return { title: r.titre, description: r.resume || r.sousTitre };
}

export default async function Rapport(props: PageProps<"/publications/rapports/[slug]">) {
  const { slug } = await props.params;
  const r = await trouverRapport(slug);
  if (!r) notFound();

  return (
    <>
      <div
        className="pb-12"
        style={{
          background:
            "radial-gradient(80% 62% at 50% 118%, rgba(216,155,52,.34) 0%, rgba(216,155,52,0) 62%)," +
            "radial-gradient(66% 52% at 86% -4%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 62%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/publications" />

        <div className="mx-auto max-w-[1010px] px-4 pt-10 sm:px-8">
          <p className="t-balise text-laiton">
            <Link href="/publications" className="text-laiton no-underline hover:underline">
              Publications
            </Link>{" "}
            · Rapport
          </p>
          <h1 className="t-display mt-3 max-w-[16ch] text-white">{r.titre}</h1>
          {r.sousTitre && <p className="mt-4 max-w-[52ch] text-[1.05rem] text-[#b9cddf]">{r.sousTitre}</p>}
          {r.publieAt && (
            <p className="t-balise mt-4 text-[0.58rem] text-[#7fa3c4]">
              {formatLong.format(r.publieAt)}
            </p>
          )}
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
          {r.resume && (
            <p className="mb-10 max-w-[62ch] border-l-2 border-laiton-fonce pl-5 text-[1.05rem]">
              {r.resume}
            </p>
          )}

          {r.chapitres.length === 0 ? (
            <p className="text-gris">Les chapitres de ce rapport ne sont pas encore en ligne.</p>
          ) : (
            <>
              {/* Le sommaire est un vrai index : il dit combien de figures
                  chaque chapitre porte, donc où sont les chiffres. */}
              <nav aria-label="Sommaire" className="mb-12">
                <h2 className="t-balise mb-3 text-[0.6rem] text-laiton-fonce">Sommaire</h2>
                <ol className="m-0 list-none border-t border-[rgba(6,24,47,.16)] pl-0">
                  {r.chapitres.map((c) => (
                    <li key={c.id}>
                      <a
                        href={`#chapitre-${c.numero}`}
                        className="grid grid-cols-[44px_1fr_auto] gap-4 border-b border-[rgba(6,24,47,.13)] px-2 py-3 no-underline hover:bg-[rgba(6,24,47,.04)]"
                      >
                        <span className="t-balise text-[0.66rem] text-gris">{c.numero}</span>
                        <span className="t-italique text-[1.1rem] text-encre">{c.titre}</span>
                        {c.figures.length > 0 && (
                          <span className="t-balise text-[0.56rem] text-gris">
                            {c.figures.length} figure{c.figures.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              {r.chapitres.map((c) => (
                <section
                  key={c.id}
                  id={`chapitre-${c.numero}`}
                  className="mb-14 scroll-mt-8 border-t border-ligne pt-8"
                >
                  <p className="t-balise text-[0.6rem] text-laiton-fonce">Chapitre {c.numero}</p>
                  <h2 className="t-h2 mt-2 mb-6 max-w-[22ch]">{c.titre}</h2>

                  <div className="max-w-[760px]">
                    <Corps blocs={c.blocs} />
                  </div>

                  {c.figures.map((f) => (
                    <Figure
                      key={f.id}
                      titre={f.titre}
                      legende={f.legende}
                      serie={f.serie}
                      source={f.sourceLibelle}
                    />
                  ))}
                </section>
              ))}
            </>
          )}

          <p className="border-t border-ligne pt-6 text-[0.88rem] text-gris">
            <Link href="/publications" className="font-semibold text-marine">
              ← Toutes les publications
            </Link>
          </p>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
