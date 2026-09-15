import type { Metadata } from "next";
import Link from "next/link";
import { inArray } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { exigerUtilisateur } from "@/lib/auth";
import { db } from "@/lib/db";
import { mentors, opportunites, programmes } from "@/lib/db/schema";
import { mesFavoris } from "@/lib/espace";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function Favoris() {
  const utilisateur = await exigerUtilisateur();
  const liste = await mesFavoris(utilisateur.id);

  const idsPar = (nature: string) =>
    liste.filter((f) => f.nature === nature).map((f) => f.cibleId);

  const [progs, opps, ments] = await Promise.all([
    idsPar("programme").length
      ? db
          .select({ id: programmes.id, slug: programmes.slug, titre: programmes.titre })
          .from(programmes)
          .where(inArray(programmes.id, idsPar("programme")))
      : Promise.resolve([]),
    idsPar("opportunite").length
      ? db
          .select({ id: opportunites.id, slug: opportunites.slug, titre: opportunites.titre })
          .from(opportunites)
          .where(inArray(opportunites.id, idsPar("opportunite")))
      : Promise.resolve([]),
    idsPar("mentor").length
      ? db
          .select({ id: mentors.id, slug: mentors.slug, titre: mentors.titre })
          .from(mentors)
          .where(inArray(mentors.id, idsPar("mentor")))
      : Promise.resolve([]),
  ]);

  const sections = [
    { titre: "Programmes", base: "/programmes", items: progs },
    { titre: "Opportunités", base: "/opportunites", items: opps },
    { titre: "Mentors", base: "/mentorat", items: ments },
  ].filter((s) => s.items.length > 0);

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/favoris">
      <TitrePage
        surtitre="Ressources"
        titre="Mes"
        accent="favoris"
        sous="Tout ce que vous avez mis de côté, au même endroit."
      />

      {sections.length === 0 ? (
        <Vide>
          Vous n&apos;avez rien mis de côté.{" "}
          <Link href="/opportunites" className="font-semibold text-marine">
            Parcourez les opportunités
          </Link>{" "}
          ou{" "}
          <Link href="/programmes" className="font-semibold text-marine">
            le catalogue
          </Link>
          .
        </Vide>
      ) : (
        <div className="flex flex-col gap-3.5">
          {sections.map((s) => (
            <Panneau key={s.titre} titre={s.titre} extra={`${s.items.length}`}>
              <ul className="m-0 flex list-none flex-col gap-2 pl-0">
                {s.items.map((i) => (
                  <li key={i.id}>
                    <Link
                      href={`${s.base}/${i.slug}`}
                      className="text-[0.94rem] font-semibold text-encre no-underline hover:text-marine"
                    >
                      {i.titre}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panneau>
          ))}
        </div>
      )}
    </Application>
  );
}
