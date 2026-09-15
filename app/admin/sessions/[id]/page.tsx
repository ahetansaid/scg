import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, ne } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Cohorte, type EtatSiege } from "@/components/motifs/Cohorte";
import { FormulaireSession } from "@/components/FormulaireSession";
import { Bouton, BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificats, inscriptions, profiles, programmes, sessions, users } from "@/lib/db/schema";
import { formatDateHeure, formatLong, montant, pluriel } from "@/lib/vocabulaire";

import { changerStatutInscription, emettreCertificat, enregistrerSession } from "../../actions";

export const metadata: Metadata = { title: "Session · back-office" };

const ETAT = {
  en_attente: { etat: "bientot", texte: "En attente" },
  confirmee: { etat: "ouvert", texte: "Confirmée" },
  terminee: { etat: "certifiante", texte: "Terminée" },
  annulee: { etat: "complet", texte: "Annulée" },
} as const;

export default async function AdminSession(props: PageProps<"/admin/sessions/[id]">) {
  const utilisateur = await exigerRole("admin", "formateur");
  const { id } = await props.params;

  const lignes = await db
    .select({ session: sessions, programmeTitre: programmes.titre, programmeId: programmes.id })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(eq(sessions.id, id))
    .limit(1);

  const ligne = lignes[0];
  if (!ligne) notFound();
  const s = ligne.session;

  const [inscrits, listeProgrammes] = await Promise.all([
    db
      .select({
        id: inscriptions.id,
        statut: inscriptions.statut,
        inscritAt: inscriptions.inscritAt,
        email: users.email,
        prenom: profiles.prenom,
        nom: profiles.nom,
        structure: profiles.structure,
        telephone: profiles.telephone,
        certificat: certificats.numero,
      })
      .from(inscriptions)
      .innerJoin(users, eq(users.id, inscriptions.userId))
      .leftJoin(profiles, eq(profiles.userId, inscriptions.userId))
      .leftJoin(certificats, eq(certificats.inscriptionId, inscriptions.id))
      .where(eq(inscriptions.sessionId, id))
      .orderBy(asc(inscriptions.inscritAt)),
    db
      .select({ id: programmes.id, titre: programmes.titre })
      .from(programmes)
      .where(ne(programmes.statut, "archive"))
      .orderBy(asc(programmes.titre)),
  ]);

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  const confirmees = inscrits.filter((i) => i.statut === "confirmee" || i.statut === "terminee");
  const attente = inscrits.filter((i) => i.statut === "en_attente");

  const sieges: EtatSiege[] = [
    ...Array<EtatSiege>(Math.min(confirmees.length, s.capacite)).fill("solde"),
    ...Array<EtatSiege>(
      Math.max(0, Math.min(attente.length, s.capacite - confirmees.length)),
    ).fill("acompte"),
  ];

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/sessions">
      <TitrePage
        surtitre={`Session · ${s.reference}`}
        titre="Où en est"
        accent="la cohorte"
        sous={
          <>
            {ligne.programmeTitre} · du {formatLong.format(s.debutAt)} au{" "}
            {formatLong.format(s.finAt)} · clôture le {formatLong.format(s.clotureAt)}
          </>
        }
        actions={
          <BoutonLien href={`/admin/programmes/${ligne.programmeId}`} variante="fantomeClair" taille="sm">
            Le programme
          </BoutonLien>
        }
      />

      {lire("certificat") === "1" && <Alerte nature="succes">Certificat émis.</Alerte>}
      {lire("erreur") === "complet" && (
        <Alerte nature="erreur">
          La session est déjà pleine : impossible de confirmer une place de plus. Augmentez la
          capacité si c&apos;est voulu.
        </Alerte>
      )}
      {lire("erreur") === "certificat_existe" && (
        <Alerte nature="erreur">Un certificat a déjà été émis pour cette inscription.</Alerte>
      )}

      <Panneau titre={`Les ${s.capacite} places`} extra={`clôture le ${formatLong.format(s.clotureAt)}`}>
        <Cohorte capacite={s.capacite} sieges={sieges} taille="md" />
        <div className="t-balise mt-3.5 flex flex-wrap gap-x-5 gap-y-2 text-[0.56rem] text-gris">
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2.5 rounded-[2px] bg-vert" />
            {confirmees.length} {pluriel(confirmees.length, "confirmée")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2.5 rounded-[2px] bg-laiton" />
            {attente.length} en attente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2.5 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(6,24,47,.28)]" />
            {Math.max(0, s.capacite - confirmees.length - attente.length)} libres
          </span>
          <span>Participation {montant(s.prixFcfa)} FCFA</span>
        </div>
      </Panneau>

      <Panneau titre="Inscriptions" extra={`${inscrits.length} lignes`} className="mt-3.5">
        {inscrits.length === 0 ? (
          <Vide>Aucune inscription pour l&apos;instant.</Vide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.84rem]">
              <thead>
                <tr>
                  {["Participant", "Structure", "Demandée le", "Statut", "Actions"].map((t) => (
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
                {inscrits.map((i) => (
                  <tr key={i.id}>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <b className="font-semibold">
                        {[i.prenom, i.nom].filter(Boolean).join(" ") || "–"}
                      </b>
                      <span className="block font-mono text-[0.72rem] text-gris">{i.email}</span>
                      {i.telephone && (
                        <span className="block font-mono text-[0.72rem] text-gris">
                          {i.telephone}
                        </span>
                      )}
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">{i.structure || "–"}</td>
                    <td className="border-b border-ligne-douce px-3 py-2.5 whitespace-nowrap">
                      {formatDateHeure.format(i.inscritAt)}
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <Etiquette etat={ETAT[i.statut].etat}>{ETAT[i.statut].texte}</Etiquette>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {i.statut === "en_attente" && (
                          <form action={changerStatutInscription}>
                            <input type="hidden" name="inscription" value={i.id} />
                            <input type="hidden" name="session" value={s.id} />
                            <input type="hidden" name="statut" value="confirmee" />
                            <Bouton type="submit" variante="marine" taille="sm">
                              Confirmer
                            </Bouton>
                          </form>
                        )}
                        {i.statut !== "annulee" && (
                          <form action={changerStatutInscription}>
                            <input type="hidden" name="inscription" value={i.id} />
                            <input type="hidden" name="session" value={s.id} />
                            <input type="hidden" name="statut" value="annulee" />
                            <Bouton type="submit" variante="fantomeClair" taille="sm">
                              Annuler
                            </Bouton>
                          </form>
                        )}
                        {i.statut === "confirmee" && utilisateur.role === "admin" && !i.certificat && (
                          <form action={emettreCertificat}>
                            <input type="hidden" name="inscription" value={i.id} />
                            <input type="hidden" name="session" value={s.id} />
                            <Bouton type="submit" variante="fantomeClair" taille="sm">
                              Émettre le certificat
                            </Bouton>
                          </form>
                        )}
                        {i.certificat && (
                          <Link
                            href={`/certificats/${i.certificat}`}
                            className="self-center font-mono text-[0.75rem] font-semibold text-marine"
                          >
                            {i.certificat}
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panneau>

      <Panneau titre="Modifier la session" className="mt-3.5">
        <FormulaireSession
          action={enregistrerSession}
          programmes={listeProgrammes}
          valeurs={{
            id: s.id,
            programmeId: s.programmeId,
            reference: s.reference,
            lieu: s.lieu,
            ville: s.ville,
            debutAt: s.debutAt,
            finAt: s.finAt,
            clotureAt: s.clotureAt,
            capacite: s.capacite,
            prixFcfa: s.prixFcfa,
            statut: s.statut,
          }}
        />
      </Panneau>
    </Application>
  );
}
