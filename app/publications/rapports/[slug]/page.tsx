import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Corps, Figure } from "@/components/Blocs";
import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { slugsPublications, trouverRapport } from "@/lib/publications";
import { formatLong, pluriel } from "@/lib/vocabulaire";

export const revalidate = 600;

export async function generateStaticParams() {
  const { rapports } = await slugsPublications();
  return rapports.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/publications/rapports/[slug]">): Promise<Metadata> {
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
      <EnTete
        actif="/publications"
        fil={[{ href: "/publications", libelle: "Publications" }]}
        sur="Rapport"
        titre={r.titre}
        sous={
          <>
            {r.sousTitre && <p>{r.sousTitre}</p>}
            {r.publieAt && <p className="mt-2 text-[0.85rem]">{formatLong.format(r.publieAt)}</p>}
          </>
        }
      />

      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
        {r.resume && (
          <p className="mb-10 max-w-[64ch] rounded-carte bg-pastel-ciel p-6 text-[1.05rem] leading-relaxed text-marine">
            {r.resume}
          </p>
        )}

        {r.chapitres.length === 0 ? (
          <p className="text-gris">Les chapitres de ce rapport ne sont pas encore en ligne.</p>
        ) : (
          <div className="grid gap-10 md:grid-cols-[260px_1fr]">
            <nav aria-label="Sommaire" className="md:sticky md:top-6 md:self-start">
              <p className="mb-3 text-[0.78rem] font-semibold text-canard">Sommaire</p>
              <ol className="m-0 flex list-none flex-col gap-1 pl-0">
                {r.chapitres.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#chapitre-${c.numero}`}
                      className="flex items-baseline gap-3 rounded-puce px-3 py-2 text-[0.9rem] no-underline hover:bg-brume"
                    >
                      <span className="w-6 shrink-0 text-[0.78rem] font-bold text-gris">{c.numero}</span>
                      <span className="text-marine">{c.titre}</span>
                    </a>
                    {c.figures.length > 0 && (
                      <span className="block pl-12 text-[0.74rem] text-gris">
                        {c.figures.length} {pluriel(c.figures.length, "figure")}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="max-w-[760px]">
              {r.chapitres.map((c) => (
                <section key={c.id} id={`chapitre-${c.numero}`} className="mb-14 scroll-mt-8">
                  <p className="text-[0.78rem] font-semibold text-canard">Chapitre {c.numero}</p>
                  <h2 className="t-h2 mt-1 mb-6">{c.titre}</h2>
                  <Corps blocs={c.blocs} />
                  {c.figures.map((f) => (
                    <Figure key={f.id} titre={f.titre} legende={f.legende} serie={f.serie} source={f.sourceLibelle} />
                  ))}
                </section>
              ))}
              <p className="border-t border-ligne pt-6 text-[0.9rem]">
                <Link href="/publications" className="font-semibold text-canard">
                  ← Toutes les publications
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
