import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampListe, ChampTexte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { blocs } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

import { enregistrerArticle } from "../actions";

export const metadata: Metadata = { title: "Publications · back-office" };

const STATUT = {
  brouillon: { etat: "bientot", texte: "Brouillon" },
  publie: { etat: "ouvert", texte: "Publié" },
  archive: { etat: "complet", texte: "Archivé" },
} as const;

/* Les blocs typés se reconvertissent en texte pour la réédition : les
   intertitres reprennent leur préfixe « ## ». */
function versTexte(corps: unknown) {
  return blocs(corps)
    .map((b) => {
      if (b.type === "intertitre") return `## ${b.texte}`;
      if (b.type === "liste") return b.items.join("\n");
      return b.texte;
    })
    .join("\n\n");
}

export default async function AdminPublications(props: PageProps<"/admin/publications">) {
  const utilisateur = await exigerRole("admin", "formateur");

  const liste = await db.select().from(articles).orderBy(desc(articles.publieAt));

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/publications">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="publications"
        sous="Notes et tribunes. Séparez les paragraphes par une ligne vide ; un intertitre commence par « ## »."
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Publication enregistrée.</Alerte>}
      {lire("erreur") === "titre" && (
        <Alerte nature="erreur">Donnez un titre d&apos;au moins trois caractères.</Alerte>
      )}
      {lire("erreur") === "doublon" && (
        <Alerte nature="erreur">
          Une publication utilise déjà cette adresse. Modifiez le titre ou le slug.
        </Alerte>
      )}

      <Panneau titre="Nouvelle publication">
        <form action={enregistrerArticle} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_120px]">
            <Champ id="titre" name="titre" label="Titre" required maxLength={250} />
            <Champ id="categorie" name="categorie" label="Catégorie" maxLength={80} placeholder="Note" />
            <Champ id="minutes" name="minutes" type="number" label="Minutes" min={0} max={120} defaultValue={5} />
          </div>
          <Champ id="chapo" name="chapo" label="Chapô" maxLength={600} />
          <ChampTexte id="corps" name="corps" label="Corps" rows={12} maxLength={40000} />
          <ChampListe id="statut" name="statut" label="Statut" defaultValue="brouillon">
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </ChampListe>
          <Bouton type="submit" variante="marine" className="self-start">
            Enregistrer
          </Bouton>
        </form>
      </Panneau>

      <Panneau titre="Publications existantes" extra={`${liste.length}`} className="mt-3.5">
        {liste.length === 0 ? (
          <Vide>Aucune publication. La page publique reste vide tant qu&apos;il n&apos;y en a pas.</Vide>
        ) : (
          <div className="flex flex-col gap-4">
            {liste.map((a) => (
              <details key={a.id} className="rounded-carte border border-ligne-douce p-4">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span>
                    <b className="text-[0.95rem] font-semibold">{a.titre}</b>
                    <span className="mt-0.5 block text-[0.82rem] text-gris">
                      {a.categorie}
                      {a.publieAt ? ` · ${formatLong.format(a.publieAt)}` : ""}
                      {a.statut === "publie" && (
                        <>
                          {" · "}
                          <Link href={`/publications/${a.slug}`} className="font-semibold text-marine">
                            voir
                          </Link>
                        </>
                      )}
                    </span>
                  </span>
                  <Etiquette etat={STATUT[a.statut].etat}>{STATUT[a.statut].texte}</Etiquette>
                </summary>

                <form action={enregistrerArticle} className="mt-4 flex flex-col gap-4 border-t border-ligne-douce pt-4">
                  <input type="hidden" name="id" value={a.id} />
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr_120px]">
                    <Champ id={`t-${a.id}`} name="titre" label="Titre" required maxLength={250} defaultValue={a.titre} />
                    <Champ id={`c-${a.id}`} name="categorie" label="Catégorie" maxLength={80} defaultValue={a.categorie} />
                    <Champ id={`m-${a.id}`} name="minutes" type="number" label="Minutes" min={0} max={120} defaultValue={a.minutesLecture} />
                  </div>
                  <Champ id={`s-${a.id}`} name="slug" label="Adresse (slug)" maxLength={90} defaultValue={a.slug} />
                  <Champ id={`ch-${a.id}`} name="chapo" label="Chapô" maxLength={600} defaultValue={a.chapo} />
                  <ChampTexte id={`co-${a.id}`} name="corps" label="Corps" rows={12} maxLength={40000} defaultValue={versTexte(a.corps)} />
                  <ChampListe id={`st-${a.id}`} name="statut" label="Statut" defaultValue={a.statut}>
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                    <option value="archive">Archivé</option>
                  </ChampListe>
                  <Bouton type="submit" variante="marine" taille="sm" className="self-start">
                    Enregistrer
                  </Bouton>
                </form>
              </details>
            ))}
          </div>
        )}
      </Panneau>
    </Application>
  );
}
