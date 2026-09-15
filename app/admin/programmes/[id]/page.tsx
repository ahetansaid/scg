import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { FormulaireProgramme } from "@/components/FormulaireProgramme";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte, Champ } from "@/components/ui/Champ";
import { exigerRole } from "@/lib/auth";
import { derouleProgramme } from "@/lib/catalogue";
import { db } from "@/lib/db";
import { programmes, sessions } from "@/lib/db/schema";
import { formatLong, montant } from "@/lib/vocabulaire";

import {
  ajouterModule,
  ajouterSeance,
  enregistrerProgramme,
  supprimerModule,
  supprimerProgramme,
} from "../../actions";

export const metadata: Metadata = { title: "Modifier un programme" };

export default async function ModifierProgramme(props: PageProps<"/admin/programmes/[id]">) {
  const utilisateur = await exigerRole("admin", "formateur");
  const { id } = await props.params;

  const lignes = await db.select().from(programmes).where(eq(programmes.id, id)).limit(1);
  const p = lignes[0];
  if (!p) notFound();

  const [modules, sessionsDuProgramme] = await Promise.all([
    derouleProgramme(p.id),
    db.select().from(sessions).where(eq(sessions.programmeId, p.id)).orderBy(sessions.debutAt),
  ]);

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/programmes">
      <TitrePage
        surtitre="Back-office · programme"
        titre={p.titre}
        sous={
          <>
            {p.statut === "publie" ? (
              <Link href={`/programmes/${p.slug}`} className="font-semibold text-marine">
                Voir la page publique →
              </Link>
            ) : (
              "En brouillon – invisible du public."
            )}
          </>
        }
        actions={
          <BoutonLien href="/admin/programmes" variante="fantomeClair" taille="sm">
            Retour à la liste
          </BoutonLien>
        }
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Programme enregistré.</Alerte>}
      {lire("cree") === "1" && (
        <Alerte nature="succes">
          Programme créé. Ajoutez maintenant son déroulé et au moins une session.
        </Alerte>
      )}
      {lire("erreur") === "module" && (
        <Alerte nature="erreur">Donnez un titre au module, au moins deux caractères.</Alerte>
      )}
      {lire("erreur") === "seance" && (
        <Alerte nature="erreur">Donnez un titre à la séance, au moins deux caractères.</Alerte>
      )}

      <Panneau titre="Fiche">
        <FormulaireProgramme
          action={enregistrerProgramme}
          valeurs={{
            id: p.id,
            slug: p.slug,
            titre: p.titre,
            nature: p.nature,
            domaine: p.domaine,
            format: p.format,
            accroche: p.accroche,
            description: p.description,
            dureeLibelle: p.dureeLibelle,
            objectifs: p.objectifs,
            prerequis: p.prerequis,
            statut: p.statut,
          }}
        />
      </Panneau>

      <Panneau titre="Le déroulé" extra={`${modules.length} modules`} className="mt-3.5">
        {modules.length === 0 ? (
          <Vide>Aucun module. Le déroulé apparaît sur la page publique du programme.</Vide>
        ) : (
          <div className="mb-5 flex flex-col gap-4">
            {modules.map((m) => (
              <div key={m.id} className="rounded-carte border border-ligne-douce p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-[0.95rem] font-bold tracking-[-0.02em]">{m.titre}</h3>
                  <form action={supprimerModule}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="programme" value={p.id} />
                    <Bouton type="submit" variante="fantomeClair" taille="sm">
                      Supprimer le module
                    </Bouton>
                  </form>
                </div>

                {m.seances.length > 0 && (
                  <ol className="mt-3 flex list-none flex-col gap-1.5 pl-0 text-[0.88rem]">
                    {m.seances.map((s, i) => (
                      <li key={s.id} className="grid grid-cols-[26px_1fr_auto] gap-3">
                        <span className="t-balise text-[0.58rem] text-laiton-fonce">
                          {String(m.debut + i + 1).padStart(2, "0")}
                        </span>
                        <span>{s.titre}</span>
                        <span className="t-balise text-[0.56rem] text-gris">
                          {s.dureeMinutes} min
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                <form
                  action={ajouterSeance}
                  className="mt-3 grid items-end gap-2 border-t border-ligne-douce pt-3 sm:grid-cols-[1fr_110px_auto]"
                >
                  <input type="hidden" name="module" value={m.id} />
                  <input type="hidden" name="programme" value={p.id} />
                  <Champ id={`seance-${m.id}`} name="titre" label="Nouvelle séance" maxLength={200} />
                  <Champ
                    id={`duree-${m.id}`}
                    name="duree"
                    type="number"
                    label="Minutes"
                    defaultValue={120}
                    min={0}
                    max={600}
                  />
                  <Bouton type="submit" variante="marine" taille="sm">
                    Ajouter
                  </Bouton>
                </form>
              </div>
            ))}
          </div>
        )}

        <form
          action={ajouterModule}
          className="grid items-end gap-3 border-t border-ligne-douce pt-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input type="hidden" name="programme" value={p.id} />
          <Champ id="module-titre" name="titre" label="Nouveau module" maxLength={200} required />
          <Champ id="module-resume" name="resume" label="Résumé" maxLength={600} />
          <Bouton type="submit" variante="marine" taille="sm">
            Ajouter le module
          </Bouton>
        </form>
      </Panneau>

      <Panneau
        titre="Sessions"
        extra={`${sessionsDuProgramme.length}`}
        className="mt-3.5"
      >
        {sessionsDuProgramme.length === 0 ? (
          <Vide>
            Aucune session. Sans session datée, le programme n&apos;apparaît pas dans le calendrier.{" "}
            <Link href="/admin/sessions/nouvelle" className="font-semibold text-marine">
              En créer une
            </Link>
            .
          </Vide>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 pl-0 text-[0.88rem]">
            {sessionsDuProgramme.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-3">
                <span>
                  <Link
                    href={`/admin/sessions/${s.id}`}
                    className="font-semibold text-encre no-underline hover:text-marine"
                  >
                    {s.reference}
                  </Link>
                  <span className="ml-2 text-gris">
                    {formatLong.format(s.debutAt)} · {s.capacite} places ·{" "}
                    {montant(s.prixFcfa)} FCFA · {s.statut}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panneau>

      {utilisateur.role === "admin" && (
        <Panneau titre="Zone dangereuse" className="mt-3.5">
          <form action={supprimerProgramme} className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 max-w-[54ch] text-[0.86rem] text-gris">
              Supprimer le programme efface aussi ses modules, séances et sessions. S&apos;il porte
              des inscriptions, il sera archivé au lieu d&apos;être supprimé – ce sont des
              engagements pris avec des gens.
            </p>
            <input type="hidden" name="id" value={p.id} />
            <Bouton type="submit" variante="fantomeClair" taille="sm">
              Supprimer
            </Bouton>
          </form>
        </Panneau>
      )}
    </Application>
  );
}
