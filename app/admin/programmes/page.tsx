import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { programmes, sessions } from "@/lib/db/schema";
import { LIBELLE_NATURE, type Nature } from "@/lib/vocabulaire";

export const metadata: Metadata = { title: "Programmes · back-office" };

const STATUT = {
  brouillon: { etat: "bientot", texte: "Brouillon" },
  publie: { etat: "ouvert", texte: "Publié" },
  archive: { etat: "complet", texte: "Archivé" },
} as const;

export default async function AdminProgrammes(props: PageProps<"/admin/programmes">) {
  const utilisateur = await exigerRole("admin", "formateur");

  const liste = await db
    .select({
      id: programmes.id,
      slug: programmes.slug,
      titre: programmes.titre,
      nature: programmes.nature,
      domaine: programmes.domaine,
      statut: programmes.statut,
      sessions: count(sessions.id),
    })
    .from(programmes)
    .leftJoin(sessions, eq(sessions.programmeId, programmes.id))
    .groupBy(programmes.id)
    .orderBy(asc(programmes.titre));

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/programmes">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="programmes"
        sous={`${liste.length} au catalogue.`}
        actions={
          <BoutonLien href="/admin/programmes/nouveau" variante="marine" taille="sm">
            Nouveau programme
          </BoutonLien>
        }
      />

      {lire("archive") === "1" && (
        <Alerte nature="succes">
          Ce programme porte des inscriptions : il a été archivé plutôt que supprimé.
        </Alerte>
      )}
      {lire("supprime") === "1" && <Alerte nature="succes">Programme supprimé.</Alerte>}
      {lire("erreur") === "titre" && (
        <Alerte nature="erreur">Donnez un titre d&apos;au moins trois caractères.</Alerte>
      )}
      {lire("erreur") === "doublon" && (
        <Alerte nature="erreur">
          Un programme utilise déjà cette adresse. Modifiez le titre, ou renseignez un slug
          différent dans le formulaire.
        </Alerte>
      )}

      <Panneau>
        {liste.length === 0 ? (
          <Vide>
            Aucun programme.{" "}
            <Link href="/admin/programmes/nouveau" className="font-semibold text-marine">
              Créez le premier
            </Link>{" "}
            – le catalogue public s&apos;alimente à partir d&apos;ici.
          </Vide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.86rem]">
              <thead>
                <tr>
                  {["Titre", "Nature", "Domaine", "Sessions", "Statut", ""].map((t) => (
                    <th
                      key={t}
                      className="t-balise border-b border-ligne px-3 pb-2.5 text-left text-[0.56rem] font-medium whitespace-nowrap text-gris"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liste.map((p) => (
                  <tr key={p.id}>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <Link
                        href={`/admin/programmes/${p.id}`}
                        className="font-semibold text-encre no-underline hover:text-marine"
                      >
                        {p.titre}
                      </Link>
                      <span className="block font-mono text-[0.72rem] text-gris">{p.slug}</span>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      {LIBELLE_NATURE[p.nature as Nature]}
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">{p.domaine}</td>
                    <td className="t-chiffres border-b border-ligne-douce px-3 py-2.5 text-right font-semibold">
                      {Number(p.sessions)}
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <Etiquette etat={STATUT[p.statut].etat}>{STATUT[p.statut].texte}</Etiquette>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/programmes/${p.id}`}
                        className="text-[0.8rem] font-semibold text-marine"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panneau>
    </Application>
  );
}
