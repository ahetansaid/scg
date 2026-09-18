import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveler } from "@/components/Animations";
import { Corps } from "@/components/Blocs";
import { EnTete } from "@/components/EnTete";
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
      <EnTete
        sombre
        actif="/publications"
        fil={[{ href: "/publications", libelle: "Publications" }]}
        sur={a.categorie}
        titre={a.titre}
        sous={
          <>
            {a.chapo && <p>{a.chapo}</p>}
            <p className="mt-3 text-[0.85rem]">
              {[auteur, a.publieAt ? formatLong.format(a.publieAt) : "", a.minutesLecture > 0 ? `${a.minutesLecture} min de lecture` : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </>
        }
      />

      <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 md:py-14">
        <Reveler>
        {a.blocs.length > 0 ? (
          <Corps blocs={a.blocs} />
        ) : (
          <p className="text-gris">Le texte de cette publication n&apos;est pas encore en ligne.</p>
        )}
        <p className="mt-12 border-t border-ligne pt-6 text-[0.9rem]">
          <Link href="/publications" className="font-semibold text-canard">
            ← Toutes les publications
          </Link>
        </p>
        </Reveler>
      </main>

      <PiedDePage />
    </>
  );
}
