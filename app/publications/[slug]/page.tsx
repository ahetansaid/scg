import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Corps } from "@/components/Blocs";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { slugsPublications, trouverArticle } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

export const revalidate = 600;

export async function generateStaticParams() {
  const { articles } = await slugsPublications();
  return articles.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const a = await trouverArticle(slug);
  if (!a) return { title: "Publication introuvable" };
  return { title: a.titre, description: a.chapo };
}

export default async function Article(props: PageProps<"/publications/[slug]">) {
  const { slug } = await props.params;
  const a = await trouverArticle(slug);
  if (!a) notFound();

  const auteur = [a.auteurPrenom, a.auteurNom].filter(Boolean).join(" ");

  return (
    <>
      <div
        className="pb-10"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 72%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/publications" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">
            <Link href="/publications" className="text-laiton no-underline hover:underline">
              Publications
            </Link>{" "}
            · {a.categorie}
          </p>
          <h1 className="t-h2 mt-2 max-w-[24ch] text-white">{a.titre}</h1>
          {a.chapo && <p className="mt-3 max-w-[58ch] text-[#b9cddf]">{a.chapo}</p>}
          <p className="t-balise mt-4 flex flex-wrap gap-x-4 text-[0.58rem] text-[#7fa3c4]">
            {auteur && <span>{auteur}</span>}
            {a.publieAt && <span>{formatLong.format(a.publieAt)}</span>}
            {a.minutesLecture > 0 && <span>{a.minutesLecture} min de lecture</span>}
          </p>
        </div>
      </div>

      <main className="bg-papier">
        <article className="mx-auto max-w-[760px] px-4 py-10 sm:px-8 md:py-14">
          {a.blocs.length > 0 ? (
            <Corps blocs={a.blocs} />
          ) : (
            <p className="text-gris">Le texte de cette publication n&apos;est pas encore en ligne.</p>
          )}

          <p className="mt-12 border-t border-ligne pt-6 text-[0.88rem] text-gris">
            <Link href="/publications" className="font-semibold text-marine">
              ← Toutes les publications
            </Link>
          </p>
        </article>
      </main>

      <PiedDePage />
    </>
  );
}
