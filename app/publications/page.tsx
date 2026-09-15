import type { Metadata } from "next";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { categoriesArticles, listerArticles, listerRapports } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Notes de conjoncture et rapports chapitrés de Strategic Consulting Group, avec les jeux de données consultables.",
};

export default async function Publications(props: PageProps<"/publications">) {
  const params = await props.searchParams;
  const v = params.categorie;
  const categorie = Array.isArray(v) ? v[0] : v;

  const [articles, rapports, categories] = await Promise.all([
    listerArticles(categorie),
    listerRapports(),
    categoriesArticles(),
  ]);

  const vide = articles.length === 0 && rapports.length === 0;

  return (
    <>
      <div
        className="pb-8"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 70%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/publications" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Publications</p>
          <h1 className="t-h2 mt-1.5 text-white">
            Ce que le cabinet <em className="t-italique text-laiton">écrit</em>
          </h1>
          <p className="mt-3 max-w-[54ch] text-[#b9cddf]">
            Notes de conjoncture et rapports chapitrés. Chaque figure porte sa série et sa source :
            c&apos;est ce qui permet de vérifier les chiffres plutôt que de les croire.
          </p>

          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={
                    categorie === c ? "/publications" : `/publications?categorie=${encodeURIComponent(c)}`
                  }
                  aria-current={categorie === c ? "true" : undefined}
                  className={`inline-block rounded-full border px-[13px] py-1.5 text-[0.79rem] font-semibold no-underline transition-colors ${
                    categorie === c
                      ? "border-laiton bg-laiton text-[#1a1204]"
                      : "border-white/22 bg-white/7 text-[#dce7f1] hover:border-laiton/60"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
          {vide ? (
            <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
              Aucune publication n&apos;est encore parue.{" "}
              <Link href="/contact" className="font-semibold text-marine">
                Écrivez-nous
              </Link>{" "}
              pour être prévenu de la prochaine note.
            </p>
          ) : (
            <>
              {rapports.length > 0 && (
                <section className="mb-12">
                  <h2 className="t-h3 mb-4">Rapports</h2>
                  <ul className="m-0 grid list-none gap-4 pl-0 sm:grid-cols-2">
                    {rapports.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/publications/rapports/${r.slug}`}
                          className="flex h-full flex-col gap-2 rounded-carte border border-ligne bg-nuit p-5 text-[#dce7f1] no-underline transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                        >
                          <span className="t-balise text-[0.58rem] text-laiton">Rapport</span>
                          <span className="t-italique text-[1.35rem] leading-tight text-white">
                            {r.titre}
                          </span>
                          {r.sousTitre && (
                            <span className="text-[0.86rem] text-[#9fb8ce]">{r.sousTitre}</span>
                          )}
                          {r.resume && (
                            <span className="mt-1 text-[0.84rem] text-[#a8c0d6]">{r.resume}</span>
                          )}
                          {r.publieAt && (
                            <span className="t-balise mt-auto pt-3 text-[0.56rem] text-[#7fa3c4]">
                              {formatLong.format(r.publieAt)}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {articles.length > 0 && (
                <section>
                  <h2 className="t-h3 mb-4">Notes et tribunes</h2>
                  <ol className="m-0 list-none border-t border-[rgba(6,24,47,.16)] pl-0">
                    {articles.map((a, i) => (
                      <li key={a.slug}>
                        <Link
                          href={`/publications/${a.slug}`}
                          className="grid grid-cols-[44px_1fr_auto] items-start gap-5 border-b border-[rgba(6,24,47,.13)] px-3 py-4 no-underline transition-[background-color,padding] duration-200 hover:bg-[rgba(6,24,47,.05)] hover:pl-5 max-sm:grid-cols-[34px_1fr] max-sm:gap-3"
                        >
                          <span className="t-balise text-[0.68rem] tracking-[0.1em] text-gris">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <span className="t-italique block text-[1.24rem] leading-[1.16] text-encre">
                              {a.titre}
                            </span>
                            {a.chapo && (
                              <span className="mt-1 block max-w-[62ch] text-[0.86rem] text-gris">
                                {a.chapo}
                              </span>
                            )}
                            <span className="t-balise mt-1.5 flex flex-wrap gap-x-3.5 text-[0.58rem] text-gris">
                              <span>{a.categorie}</span>
                              {a.minutesLecture > 0 && <span>{a.minutesLecture} min</span>}
                              {a.publieAt && <span>{formatLong.format(a.publieAt)}</span>}
                            </span>
                          </span>
                          <span className="t-balise text-[0.6rem] text-gris max-sm:hidden">Lire →</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
