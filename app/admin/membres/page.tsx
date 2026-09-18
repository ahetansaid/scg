import type { Metadata } from "next";
import { asc, count, eq } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { classeChamp } from "@/components/ui/Champ";
import { exigerRole, ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { inscriptions, profiles, users } from "@/lib/db/schema";
import { formatLong, LIBELLE_ROLE } from "@/lib/vocabulaire";

import { changerRole } from "../actions";

export const metadata: Metadata = { title: "Membres · back-office" };

export default async function AdminMembres(props: PageProps<"/admin/membres">) {
  const utilisateur = await exigerRole("admin");

  const liste = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      creeAt: users.creeAt,
      prenom: profiles.prenom,
      nom: profiles.nom,
      structure: profiles.structure,
      telephone: profiles.telephone,
      inscriptions: count(inscriptions.id),
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(inscriptions, eq(inscriptions.userId, users.id))
    .groupBy(users.id, profiles.userId)
    .orderBy(asc(users.creeAt));

  const params = await props.searchParams;
  const v = params.erreur;
  const erreur = Array.isArray(v) ? v[0] : v;
  const ok = params.enregistre === "1";

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/membres">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="membres"
        sous={`${liste.length} comptes. Le rôle « mentor » se donne en créant une fiche mentor, pas ici.`}
      />

      {ok && <Alerte nature="succes">Rôle mis à jour.</Alerte>}
      {erreur === "soi-meme" && (
        <Alerte nature="erreur">
          Vous ne pouvez pas modifier votre propre rôle : ce serait le moyen le plus simple de vous
          verrouiller hors du back-office. Demandez à un autre administrateur.
        </Alerte>
      )}

      <Panneau>
        {liste.length === 0 ? (
          <Vide>Aucun compte.</Vide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.84rem]">
              <thead>
                <tr>
                  {["Compte", "Structure", "Inscrit le", "Programmes", "Rôle"].map((t) => (
                    <th
                      key={t}
                      className="t-etiquette border-b border-ligne px-3 pb-2.5 text-left text-[0.56rem] font-medium whitespace-nowrap text-gris"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liste.map((m) => (
                  <tr key={m.id}>
                    <td className="border-b border-ligne px-3 py-2.5">
                      <b className="font-semibold">
                        {[m.prenom, m.nom].filter(Boolean).join(" ") || "–"}
                      </b>
                      <span className="block font-mono text-[0.72rem] text-gris">{m.email}</span>
                      {m.telephone && (
                        <span className="block font-mono text-[0.72rem] text-gris">{m.telephone}</span>
                      )}
                    </td>
                    <td className="border-b border-ligne px-3 py-2.5">{m.structure || "–"}</td>
                    <td className="border-b border-ligne px-3 py-2.5 whitespace-nowrap">
                      {formatLong.format(m.creeAt)}
                    </td>
                    <td className="t-chiffres border-b border-ligne px-3 py-2.5 text-right font-semibold">
                      {Number(m.inscriptions)}
                    </td>
                    <td className="border-b border-ligne px-3 py-2.5">
                      {m.id === utilisateur.id ? (
                        <span className="text-gris">{LIBELLE_ROLE[m.role]} (vous)</span>
                      ) : (
                        <form action={changerRole} className="flex items-center gap-2">
                          <input type="hidden" name="utilisateur" value={m.id} />
                          <select
                            name="role"
                            defaultValue={m.role}
                            aria-label={`Rôle de ${m.email}`}
                            className={`${classeChamp} w-auto py-1.5 text-[0.82rem]`}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {LIBELLE_ROLE[r]}
                              </option>
                            ))}
                          </select>
                          <Bouton type="submit" variante="contourMarine" taille="sm">
                            Appliquer
                          </Bouton>
                        </form>
                      )}
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
