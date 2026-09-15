import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampListe, ChampTexte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { opportunites } from "@/lib/db/schema";
import { DOMAINES, formatLong } from "@/lib/vocabulaire";

import { enregistrerOpportunite } from "../actions";

export const metadata: Metadata = { title: "Opportunités · back-office" };

const STATUT = {
  brouillon: { etat: "bientot", texte: "Brouillon" },
  publie: { etat: "ouvert", texte: "Publiée" },
  archive: { etat: "complet", texte: "Archivée" },
} as const;

function pourChampDate(d: Date | null) {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function AdminOpportunites(props: PageProps<"/admin/opportunites">) {
  const utilisateur = await exigerRole("admin", "formateur");

  const liste = await db.select().from(opportunites).orderBy(asc(opportunites.dateLimite));

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/opportunites">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="opportunités"
        sous="Une opportunité dont la date limite est passée disparaît d'elle-même de la liste publique, sans être supprimée."
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Opportunité enregistrée.</Alerte>}
      {lire("erreur") === "titre" && (
        <Alerte nature="erreur">Donnez un titre d&apos;au moins trois caractères.</Alerte>
      )}
      {lire("erreur") === "date" && <Alerte nature="erreur">La date limite n&apos;est pas valide.</Alerte>}
      {lire("erreur") === "doublon" && (
        <Alerte nature="erreur">
          Une opportunité utilise déjà cette adresse. Modifiez le titre ou le slug.
        </Alerte>
      )}

      <Panneau titre="Nouvelle opportunité">
        <form action={enregistrerOpportunite} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Champ id="titre" name="titre" label="Titre" required maxLength={250} />
            <Champ id="organisation" name="organisation" label="Organisation" maxLength={200} />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Champ id="nature" name="nature" label="Nature" maxLength={80} placeholder="Appel à candidatures" />
            <ChampListe id="domaine" name="domaine" label="Domaine" defaultValue={DOMAINES[0]}>
              {DOMAINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </ChampListe>
            <Champ id="lieu" name="lieu" label="Lieu" maxLength={160} />
            <Champ id="limite" name="limite" type="date" label="Date limite" />
          </div>
          <ChampTexte id="description" name="description" label="Description" rows={5} maxLength={6000} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChampTexte id="missions" name="missions" label="Missions" rows={4} aide="Une par ligne." />
            <ChampTexte id="profil" name="profil" label="Profil recherché" rows={4} aide="Un par ligne." />
          </div>
          <ChampListe id="statut" name="statut" label="Statut" defaultValue="brouillon">
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publiée</option>
            <option value="archive">Archivée</option>
          </ChampListe>
          <Bouton type="submit" variante="marine" className="self-start">
            Enregistrer
          </Bouton>
        </form>
      </Panneau>

      <Panneau titre="Opportunités existantes" extra={`${liste.length}`} className="mt-3.5">
        {liste.length === 0 ? (
          <Vide>Aucune opportunité.</Vide>
        ) : (
          <div className="flex flex-col gap-4">
            {liste.map((o) => (
              <details key={o.id} className="rounded-carte border border-ligne-douce p-4">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span>
                    <b className="text-[0.95rem] font-semibold">{o.titre}</b>
                    <span className="mt-0.5 block text-[0.82rem] text-gris">
                      {o.organisation} · {o.domaine}
                      {o.dateLimite ? ` · jusqu'au ${formatLong.format(o.dateLimite)}` : ""}
                      {o.statut === "publie" && (
                        <>
                          {" · "}
                          <Link href={`/opportunites/${o.slug}`} className="font-semibold text-marine">
                            voir
                          </Link>
                        </>
                      )}
                    </span>
                  </span>
                  <Etiquette etat={STATUT[o.statut].etat}>{STATUT[o.statut].texte}</Etiquette>
                </summary>

                <form action={enregistrerOpportunite} className="mt-4 flex flex-col gap-4 border-t border-ligne-douce pt-4">
                  <input type="hidden" name="id" value={o.id} />
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <Champ id={`t-${o.id}`} name="titre" label="Titre" required maxLength={250} defaultValue={o.titre} />
                    <Champ id={`org-${o.id}`} name="organisation" label="Organisation" maxLength={200} defaultValue={o.organisation} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Champ id={`n-${o.id}`} name="nature" label="Nature" maxLength={80} defaultValue={o.nature} />
                    <ChampListe id={`d-${o.id}`} name="domaine" label="Domaine" defaultValue={o.domaine}>
                      {DOMAINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </ChampListe>
                    <Champ id={`l-${o.id}`} name="lieu" label="Lieu" maxLength={160} defaultValue={o.lieu} />
                    <Champ id={`lim-${o.id}`} name="limite" type="date" label="Date limite" defaultValue={pourChampDate(o.dateLimite)} />
                  </div>
                  <Champ id={`s-${o.id}`} name="slug" label="Adresse (slug)" maxLength={90} defaultValue={o.slug} />
                  <ChampTexte id={`desc-${o.id}`} name="description" label="Description" rows={5} maxLength={6000} defaultValue={o.description} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ChampTexte id={`mis-${o.id}`} name="missions" label="Missions" rows={4} defaultValue={o.missions.join("\n")} />
                    <ChampTexte id={`pro-${o.id}`} name="profil" label="Profil recherché" rows={4} defaultValue={o.profil.join("\n")} />
                  </div>
                  <ChampListe id={`st-${o.id}`} name="statut" label="Statut" defaultValue={o.statut}>
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publiée</option>
                    <option value="archive">Archivée</option>
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
