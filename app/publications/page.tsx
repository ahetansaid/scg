import type { Metadata } from "next";
import Link from "next/link";

import { Cascade, Element, Eleve } from "@/components/Animations";
import { EnTete, Filtre } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { TitreSection } from "@/components/Vitrine";
import { PHOTOS } from "@/lib/photos";
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
      <EnTete
        photo={PHOTOS.conference}
        actif="/publications"
        sur="Publications"
        titre="Ce que le cabinet écrit"
        souligne="écrit"
        sous="Notes de conjoncture et rapports chapitrés. Chaque figure porte sa série et sa source : c'est ce qui permet de vérifier les chiffres plutôt que de les croire."
      >
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Filtre
                key={c}
                href={categorie === c ? "/publications" : `/publications?categorie=${encodeURIComponent(c)}`}
                actif={categorie === c}
              >
                {c}
              </Filtre>
            ))}
          </div>
        )}
      </EnTete>

      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
        {vide ? (
          <div className="rounded-carte border border-ligne bg-brume p-8 text-center">
            <p className="t-h3">Aucune publication n&apos;est encore parue</p>
            <p className="mx-auto mt-2 max-w-[48ch] text-gris">
              <Link href="/contact" className="font-semibold text-canard">
                Écrivez-nous
              </Link>{" "}
              pour être prévenu de la prochaine note.
            </p>
          </div>
        ) : (
          <>
            {rapports.length > 0 && (
              <section className="mb-14">
                <TitreSection titre="Rapports" />
                <Cascade className="grid gap-5 md:grid-cols-2">
                  {rapports.map((r) => (
                    <Element key={r.slug}>
                    <Eleve className="h-full">
                    <Link
                      href={`/publications/rapports/${r.slug}`}
                      className="relative flex h-full flex-col gap-2 overflow-hidden rounded-grand bg-marine p-8 text-white no-underline shadow-carte"
                    >
                      <span className="relative text-[0.78rem] font-semibold text-soleil">Rapport</span>
                      <span className="relative text-[1.5rem] leading-tight font-extrabold tracking-[-0.02em]">{r.titre}</span>
                      {r.sousTitre && <span className="relative text-white/80">{r.sousTitre}</span>}
                      {r.resume && <span className="relative mt-1 line-clamp-3 text-[0.9rem] text-white/70">{r.resume}</span>}
                      {r.publieAt && (
                        <span className="relative mt-auto pt-4 text-[0.8rem] text-white/60">{formatLong.format(r.publieAt)}</span>
                      )}
                    </Link>
                    </Eleve>
                    </Element>
                  ))}
                </Cascade>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <TitreSection titre="Notes et tribunes" />
                <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((a) => (
                    <Element key={a.slug}>
                    <Eleve className="h-full">
                    <Link
                      href={`/publications/${a.slug}`}
                      className="flex h-full flex-col gap-2 rounded-carte border border-ligne bg-white p-6 no-underline shadow-carte"
                    >
                      <span className="text-[0.78rem] font-semibold text-canard">{a.categorie}</span>
                      <span className="t-h3">{a.titre}</span>
                      {a.chapo && <span className="line-clamp-3 text-[0.88rem] text-gris">{a.chapo}</span>}
                      <span className="mt-auto pt-3 text-[0.8rem] text-gris">
                        {a.minutesLecture > 0 ? `${a.minutesLecture} min de lecture` : ""}
                        {a.publieAt ? ` · ${formatLong.format(a.publieAt)}` : ""}
                      </span>
                    </Link>
                    </Eleve>
                    </Element>
                  ))}
                </Cascade>
              </section>
            )}
          </>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
