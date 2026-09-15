import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampListe, ChampTexte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { mentors, profiles, users } from "@/lib/db/schema";

import { enregistrerMentor } from "../actions";

export const metadata: Metadata = { title: "Mentors · back-office" };

const STATUT = {
  brouillon: { etat: "bientot", texte: "Brouillon" },
  publie: { etat: "ouvert", texte: "Publié" },
  archive: { etat: "complet", texte: "Archivé" },
} as const;

const ERREURS: Record<string, string> = {
  titre: "Donnez un titre d'au moins trois caractères.",
  utilisateur: "Choisissez le compte auquel rattacher cette fiche.",
  doublon: "Une fiche utilise déjà cette adresse, ou ce compte a déjà la sienne.",
};

export default async function AdminMentors(props: PageProps<"/admin/mentors">) {
  const utilisateur = await exigerRole("admin");

  const liste = await db
    .select({
      id: mentors.id,
      slug: mentors.slug,
      titre: mentors.titre,
      organisation: mentors.organisation,
      domaines: mentors.domaines,
      presentation: mentors.presentation,
      quotaMensuel: mentors.quotaMensuel,
      statut: mentors.statut,
      email: users.email,
      prenom: profiles.prenom,
      nom: profiles.nom,
    })
    .from(mentors)
    .innerJoin(users, eq(users.id, mentors.userId))
    .leftJoin(profiles, eq(profiles.userId, mentors.userId))
    .orderBy(asc(mentors.titre));

  /* On ne propose que les comptes qui n'ont pas déjà de fiche : la table
     impose l'unicité, autant ne pas laisser l'erreur arriver jusqu'à Postgres.
     Le nombre de comptes reste modeste, le filtrage se fait en mémoire. */
  const [dejaMentors, candidats] = await Promise.all([
    db.select({ userId: mentors.userId }).from(mentors),
    db
      .select({ id: users.id, email: users.email, prenom: profiles.prenom, nom: profiles.nom })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .orderBy(asc(users.email)),
  ]);

  const exclus = new Set(dejaMentors.map((m) => m.userId));
  const libres = candidats.filter((c) => !exclus.has(c.id));

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };
  const erreur = lire("erreur");

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/mentors">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="mentors"
        sous={`${liste.length} fiches. Publier une fiche la fait apparaître dans l'annuaire public.`}
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Fiche enregistrée.</Alerte>}
      {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "L'enregistrement a échoué."}</Alerte>}

      <Panneau titre="Nouvelle fiche">
        {libres.length === 0 ? (
          <Vide>
            Tous les comptes existants ont déjà une fiche. Une fiche mentor se rattache à un compte :
            créez-en un depuis{" "}
            <Link href="/admin/membres" className="font-semibold text-marine">
              les membres
            </Link>
            , ou demandez à la personne de s&apos;inscrire.
          </Vide>
        ) : (
          <form action={enregistrerMentor} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ChampListe id="utilisateur" name="utilisateur" label="Compte rattaché" required defaultValue="">
                <option value="" disabled>
                  Choisir…
                </option>
                {libres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {[c.prenom, c.nom].filter(Boolean).join(" ") || c.email} – {c.email}
                  </option>
                ))}
              </ChampListe>
              <Champ id="titre" name="titre" label="Titre" required maxLength={200} placeholder="DAF · groupe agro-industriel" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Champ id="organisation" name="organisation" label="Organisation" maxLength={200} />
              <Champ id="quota" name="quota" type="number" label="Quota mensuel" defaultValue={3} min={1} max={20} />
              <ChampListe id="statut" name="statut" label="Statut" defaultValue="brouillon">
                <option value="brouillon">Brouillon</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </ChampListe>
            </div>

            <ChampTexte id="domaines" name="domaines" label="Domaines" rows={3} aide="Un par ligne. Ils servent de filtres dans l'annuaire." />
            <ChampTexte id="presentation" name="presentation" label="Présentation" rows={5} maxLength={4000} />

            <Bouton type="submit" variante="marine" className="self-start">
              Créer la fiche
            </Bouton>
          </form>
        )}
      </Panneau>

      <Panneau titre="Fiches existantes" extra={`${liste.length}`} className="mt-3.5">
        {liste.length === 0 ? (
          <Vide>Aucune fiche mentor. L&apos;annuaire public est vide tant qu&apos;il n&apos;y en a pas.</Vide>
        ) : (
          <div className="flex flex-col gap-4">
            {liste.map((m) => (
              <details key={m.id} className="rounded-carte border border-ligne-douce p-4">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span>
                    <b className="text-[0.95rem] font-semibold">
                      {[m.prenom, m.nom].filter(Boolean).join(" ") || m.email}
                    </b>
                    <span className="mt-0.5 block text-[0.82rem] text-gris">
                      {m.titre}
                      {m.organisation ? ` · ${m.organisation}` : ""} · quota {m.quotaMensuel}/mois
                    </span>
                  </span>
                  <Etiquette etat={STATUT[m.statut].etat}>{STATUT[m.statut].texte}</Etiquette>
                </summary>

                <form action={enregistrerMentor} className="mt-4 flex flex-col gap-4 border-t border-ligne-douce pt-4">
                  <input type="hidden" name="id" value={m.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Champ id={`titre-${m.id}`} name="titre" label="Titre" required maxLength={200} defaultValue={m.titre} />
                    <Champ id={`slug-${m.id}`} name="slug" label="Adresse (slug)" maxLength={90} defaultValue={m.slug} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Champ id={`org-${m.id}`} name="organisation" label="Organisation" maxLength={200} defaultValue={m.organisation} />
                    <Champ id={`quota-${m.id}`} name="quota" type="number" label="Quota mensuel" defaultValue={m.quotaMensuel} min={1} max={20} />
                    <ChampListe id={`statut-${m.id}`} name="statut" label="Statut" defaultValue={m.statut}>
                      <option value="brouillon">Brouillon</option>
                      <option value="publie">Publié</option>
                      <option value="archive">Archivé</option>
                    </ChampListe>
                  </div>
                  <ChampTexte id={`dom-${m.id}`} name="domaines" label="Domaines" rows={3} defaultValue={m.domaines.join("\n")} aide="Un par ligne." />
                  <ChampTexte id={`pres-${m.id}`} name="presentation" label="Présentation" rows={5} maxLength={4000} defaultValue={m.presentation} />
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
