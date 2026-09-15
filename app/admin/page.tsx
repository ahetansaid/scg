import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, gte, inArray } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Cohorte, type EtatSiege } from "@/components/motifs/Cohorte";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  articles,
  demandesMentorat,
  inscriptions,
  journalAudit,
  mentors,
  opportunites,
  profiles,
  programmes,
  sessions,
  users,
} from "@/lib/db/schema";
import { formatDateHeure, formatLong, pluriel } from "@/lib/vocabulaire";

export const metadata: Metadata = { title: "Back-office" };

export default async function Admin() {
  const utilisateur = await exigerRole("admin", "formateur");

  const [prochaines, aTraiter, demandes, journal, volumes] = await Promise.all([
    db
      .select({
        id: sessions.id,
        reference: sessions.reference,
        debut: sessions.debutAt,
        capacite: sessions.capacite,
        titre: programmes.titre,
      })
      .from(sessions)
      .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
      .where(and(eq(sessions.statut, "ouverte"), gte(sessions.finAt, new Date())))
      .orderBy(asc(sessions.debutAt))
      .limit(6),

    db
      .select({
        id: inscriptions.id,
        sessionId: inscriptions.sessionId,
        inscritAt: inscriptions.inscritAt,
        prenom: profiles.prenom,
        nom: profiles.nom,
        email: users.email,
        titre: programmes.titre,
      })
      .from(inscriptions)
      .innerJoin(users, eq(users.id, inscriptions.userId))
      .leftJoin(profiles, eq(profiles.userId, inscriptions.userId))
      .innerJoin(sessions, eq(sessions.id, inscriptions.sessionId))
      .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
      .where(eq(inscriptions.statut, "en_attente"))
      .orderBy(asc(inscriptions.inscritAt))
      .limit(10),

    db
      .select({ n: count() })
      .from(demandesMentorat)
      .where(eq(demandesMentorat.statut, "envoyee")),

    db
      .select({
        id: journalAudit.id,
        action: journalAudit.action,
        creeAt: journalAudit.creeAt,
        prenom: profiles.prenom,
        nom: profiles.nom,
        email: users.email,
      })
      .from(journalAudit)
      .leftJoin(users, eq(users.id, journalAudit.acteurUserId))
      .leftJoin(profiles, eq(profiles.userId, journalAudit.acteurUserId))
      .orderBy(desc(journalAudit.creeAt))
      .limit(8),

    Promise.all([
      db.select({ n: count() }).from(programmes),
      db.select({ n: count() }).from(mentors),
      db.select({ n: count() }).from(articles),
      db.select({ n: count() }).from(opportunites),
      db.select({ n: count() }).from(users),
    ]),
  ]);

  /* Un seul comptage pour toutes les sessions affichées. */
  const parSession = new Map<string, { confirmees: number; attente: number }>();
  if (prochaines.length > 0) {
    const lignes = await db
      .select({ sessionId: inscriptions.sessionId, statut: inscriptions.statut, n: count() })
      .from(inscriptions)
      .where(
        inArray(
          inscriptions.sessionId,
          prochaines.map((s) => s.id),
        ),
      )
      .groupBy(inscriptions.sessionId, inscriptions.statut);

    for (const l of lignes) {
      const e = parSession.get(l.sessionId) ?? { confirmees: 0, attente: 0 };
      if (l.statut === "confirmee" || l.statut === "terminee") e.confirmees += Number(l.n);
      if (l.statut === "en_attente") e.attente += Number(l.n);
      parSession.set(l.sessionId, e);
    }
  }

  const [nbProgrammes, nbMentors, nbArticles, nbOpportunites, nbMembres] = volumes.map((v) =>
    Number(v[0]?.n ?? 0),
  );

  const vide = nbProgrammes === 0 && nbMentors === 0 && nbArticles === 0;

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin">
      <TitrePage
        surtitre="Back-office"
        titre="Vue"
        accent="d'ensemble"
        sous={`${nbProgrammes} ${pluriel(nbProgrammes, "programme")} · ${nbMentors} ${pluriel(nbMentors, "mentor")} · ${nbArticles} ${pluriel(nbArticles, "publication")} · ${nbOpportunites} ${pluriel(nbOpportunites, "opportunité")} · ${nbMembres} ${pluriel(nbMembres, "compte")}`}
      />

      {vide && (
        <Vide>
          La base est vide. Commencez par{" "}
          <Link href="/admin/programmes/nouveau" className="font-semibold text-marine">
            créer un programme
          </Link>
          , puis ajoutez-lui une session : le site public se remplit tout seul à partir de là.
        </Vide>
      )}

      <div className="grid gap-3.5 lg:grid-cols-[1.3fr_1fr]">
        <Panneau
          titre="Demandes d'inscription à traiter"
          extra={`${aTraiter.length} en attente`}
        >
          {aTraiter.length === 0 ? (
            <Vide>Aucune demande en attente.</Vide>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 pl-0">
              {aTraiter.map((i) => (
                <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-3">
                  <span>
                    <b className="text-[0.9rem] font-semibold">
                      {[i.prenom, i.nom].filter(Boolean).join(" ") || i.email}
                    </b>
                    <span className="mt-0.5 block text-[0.8rem] text-gris">{i.titre}</span>
                  </span>
                  <Link
                    href={`/admin/sessions/${i.sessionId}`}
                    className="text-[0.8rem] font-semibold text-marine"
                  >
                    Traiter →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panneau>

        <Panneau titre="Mentorat" extra="demandes ouvertes">
          <p className="t-chiffres m-0 text-[2rem] leading-none font-extrabold tracking-[-0.04em] text-marine">
            {Number(demandes[0]?.n ?? 0)}
          </p>
          <p className="mt-2 text-[0.86rem] text-gris">
            en attente de réponse d&apos;un mentor.
          </p>
          <Link
            href="/admin/demandes"
            className="mt-3 inline-block text-[0.82rem] font-semibold text-marine"
          >
            Voir les demandes →
          </Link>
        </Panneau>
      </div>

      <Panneau titre="Sessions ouvertes" extra={`${prochaines.length} à venir`} className="mt-3.5">
        {prochaines.length === 0 ? (
          <Vide>
            Aucune session ouverte.{" "}
            <Link href="/admin/sessions/nouvelle" className="font-semibold text-marine">
              En créer une
            </Link>
            .
          </Vide>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3.5 pl-0">
            {prochaines.map((s) => {
              const e = parSession.get(s.id) ?? { confirmees: 0, attente: 0 };
              /* La rangée montre les trois états d'un coup : confirmé,
                 en attente, libre. */
              const sieges: EtatSiege[] = [
                ...Array<EtatSiege>(Math.min(e.confirmees, s.capacite)).fill("solde"),
                ...Array<EtatSiege>(
                  Math.max(0, Math.min(e.attente, s.capacite - e.confirmees)),
                ).fill("acompte"),
              ];
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <Link
                      href={`/admin/sessions/${s.id}`}
                      className="text-[0.92rem] font-semibold text-encre no-underline hover:text-marine"
                    >
                      {s.titre}
                    </Link>
                    <span className="t-balise mt-0.5 block text-[0.56rem] text-gris">
                      {s.reference} · {formatLong.format(s.debut)}
                    </span>
                  </span>
                  <Cohorte capacite={s.capacite} sieges={sieges} compteur />
                </li>
              );
            })}
          </ul>
        )}
        <p className="t-balise mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-ligne-douce pt-3 text-[0.56rem] text-gris">
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2 rounded-[2px] bg-vert" />
            confirmé
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2 rounded-[2px] bg-laiton" />
            en attente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="block size-2 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(6,24,47,.28)]" />
            libre
          </span>
        </p>
      </Panneau>

      <Panneau titre="Journal d'audit" extra="8 dernières actions" className="mt-3.5">
        {journal.length === 0 ? (
          <Vide>Aucune action enregistrée.</Vide>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 pl-0 text-[0.84rem]">
            {journal.map((j) => (
              <li key={j.id} className="flex flex-wrap justify-between gap-3">
                <span className="font-mono text-[0.78rem]">{j.action}</span>
                <span className="text-gris">
                  {[j.prenom, j.nom].filter(Boolean).join(" ") || j.email || "système"} ·{" "}
                  {formatDateHeure.format(j.creeAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panneau>
    </Application>
  );
}
