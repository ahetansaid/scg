import { and, asc, count, desc, eq, gte, inArray } from "drizzle-orm";

import { db } from "./db";
import {
  certificats,
  demandesMentorat,
  favoris,
  inscriptions,
  mentors,
  modules,
  presences,
  profiles,
  programmes,
  seances,
  sessions,
} from "./db/schema";
import type { Format, Nature } from "./vocabulaire";

/* ============================================================================
   Lecture de l'espace membre.
   La progression n'est pas un champ que l'on met à jour : elle se compte
   depuis les présences saisies. Un chiffre stocké se désynchronise dès la
   première correction de présence.
   ============================================================================ */

export type InscriptionVue = {
  id: string;
  statut: "en_attente" | "confirmee" | "annulee" | "terminee";
  inscritAt: Date;
  programme: {
    id: string;
    slug: string;
    titre: string;
    nature: Nature;
    format: Format;
    domaine: string;
  };
  session: {
    id: string;
    reference: string;
    lieu: string;
    debut: Date;
    fin: Date;
    prixFcfa: number;
  };
  seancesTotal: number;
  seancesFaites: number;
  progression: number;
};

export async function mesInscriptions(userId: string): Promise<InscriptionVue[]> {
  const lignes = await db
    .select({
      id: inscriptions.id,
      statut: inscriptions.statut,
      inscritAt: inscriptions.inscritAt,
      programmeId: programmes.id,
      slug: programmes.slug,
      titre: programmes.titre,
      nature: programmes.nature,
      format: programmes.format,
      domaine: programmes.domaine,
      sessionId: sessions.id,
      reference: sessions.reference,
      lieu: sessions.lieu,
      debut: sessions.debutAt,
      fin: sessions.finAt,
      prixFcfa: sessions.prixFcfa,
    })
    .from(inscriptions)
    .innerJoin(sessions, eq(sessions.id, inscriptions.sessionId))
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(eq(inscriptions.userId, userId))
    .orderBy(desc(sessions.debutAt));

  if (lignes.length === 0) return [];

  /* Deux requêtes groupées plutôt qu'une par inscription : le nombre de
     séances par programme, et les présences effectives par inscription. */
  const totaux = await db
    .select({ programmeId: modules.programmeId, n: count(seances.id) })
    .from(modules)
    .leftJoin(seances, eq(seances.moduleId, modules.id))
    .where(
      inArray(
        modules.programmeId,
        lignes.map((l) => l.programmeId),
      ),
    )
    .groupBy(modules.programmeId);

  const faites = await db
    .select({ inscriptionId: presences.inscriptionId, n: count() })
    .from(presences)
    .where(
      and(
        inArray(
          presences.inscriptionId,
          lignes.map((l) => l.id),
        ),
        inArray(presences.statut, ["present", "excuse"]),
      ),
    )
    .groupBy(presences.inscriptionId);

  const parProgramme = new Map(totaux.map((t) => [t.programmeId, Number(t.n)]));
  const parInscription = new Map(faites.map((f) => [f.inscriptionId, Number(f.n)]));

  return lignes.map((l) => {
    const total = parProgramme.get(l.programmeId) ?? 0;
    const fait = parInscription.get(l.id) ?? 0;
    return {
      id: l.id,
      statut: l.statut,
      inscritAt: l.inscritAt,
      programme: {
        id: l.programmeId,
        slug: l.slug,
        titre: l.titre,
        nature: l.nature as Nature,
        format: l.format as Format,
        domaine: l.domaine,
      },
      session: {
        id: l.sessionId,
        reference: l.reference,
        lieu: l.lieu,
        debut: l.debut,
        fin: l.fin,
        prixFcfa: l.prixFcfa,
      },
      seancesTotal: total,
      seancesFaites: fait,
      progression: total > 0 ? Math.round((fait / total) * 100) : 0,
    };
  });
}

/* Les étapes de l'arc de trajectoire, dans l'ordre chronologique : ce qui est
   terminé, ce qui est en cours, ce qui vient. */
export type Etape = { titre: string; etat: "termine" | "en_cours" | "a_venir" };

export function trajectoire(liste: InscriptionVue[]): Etape[] {
  return [...liste]
    .filter((i) => i.statut !== "annulee")
    .sort((a, b) => a.session.debut.getTime() - b.session.debut.getTime())
    .map((i) => ({
      titre: i.programme.titre,
      etat:
        i.statut === "terminee" || i.progression >= 100
          ? ("termine" as const)
          : i.session.debut.getTime() <= Date.now()
            ? ("en_cours" as const)
            : ("a_venir" as const),
    }));
}

/* --- Prochaines échéances -------------------------------------------------- */

export type Echeance = {
  nature: "seance" | "mentorat";
  titre: string;
  detail: string;
  quand: Date;
};

export async function mesEcheances(userId: string, liste: InscriptionVue[]): Promise<Echeance[]> {
  const echeances: Echeance[] = liste
    .filter((i) => i.statut === "confirmee" && i.session.fin.getTime() >= Date.now())
    .map((i) => ({
      nature: "seance" as const,
      titre: i.programme.titre,
      detail: i.session.lieu || "Lieu à préciser",
      quand: i.session.debut,
    }));

  const rendezVous = await db
    .select({
      objet: demandesMentorat.objet,
      titre: mentors.titre,
      prenom: profiles.prenom,
      nom: profiles.nom,
      creeAt: demandesMentorat.creeAt,
    })
    .from(demandesMentorat)
    .innerJoin(mentors, eq(mentors.id, demandesMentorat.mentorId))
    .leftJoin(profiles, eq(profiles.userId, mentors.userId))
    .where(
      and(eq(demandesMentorat.demandeurUserId, userId), eq(demandesMentorat.statut, "acceptee")),
    )
    .orderBy(desc(demandesMentorat.creeAt))
    .limit(5);

  for (const r of rendezVous) {
    echeances.push({
      nature: "mentorat",
      titre: `Mentorat – ${r.objet}`,
      detail: `avec ${[r.prenom, r.nom].filter(Boolean).join(" ") || r.titre}`,
      quand: r.creeAt,
    });
  }

  return echeances.sort((a, b) => a.quand.getTime() - b.quand.getTime()).slice(0, 6);
}

/* --- Certificats ----------------------------------------------------------- */

export async function mesCertificats(userId: string) {
  return db
    .select({
      numero: certificats.numero,
      emisAt: certificats.emisAt,
      titre: programmes.titre,
      slug: programmes.slug,
      reference: sessions.reference,
    })
    .from(certificats)
    .innerJoin(inscriptions, eq(inscriptions.id, certificats.inscriptionId))
    .innerJoin(sessions, eq(sessions.id, inscriptions.sessionId))
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(eq(inscriptions.userId, userId))
    .orderBy(desc(certificats.emisAt));
}

export async function verifierCertificat(numero: string) {
  const lignes = await db
    .select({
      numero: certificats.numero,
      emisAt: certificats.emisAt,
      programme: programmes.titre,
      nature: programmes.nature,
      dureeLibelle: programmes.dureeLibelle,
      prenom: profiles.prenom,
      nom: profiles.nom,
      finAt: sessions.finAt,
    })
    .from(certificats)
    .innerJoin(inscriptions, eq(inscriptions.id, certificats.inscriptionId))
    .innerJoin(sessions, eq(sessions.id, inscriptions.sessionId))
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .leftJoin(profiles, eq(profiles.userId, inscriptions.userId))
    .where(eq(certificats.numero, numero.trim().toUpperCase()))
    .limit(1);
  return lignes[0] ?? null;
}

/* --- Favoris ---------------------------------------------------------------
   Une seule table pour tout ce qu'on met de côté. Le suivi d'un mentor est un
   favori de nature « mentor » : pas besoin d'une table dédiée.              */

export async function mesFavoris(userId: string) {
  return db
    .select({ nature: favoris.nature, cibleId: favoris.cibleId, creeAt: favoris.creeAt })
    .from(favoris)
    .where(eq(favoris.userId, userId))
    .orderBy(desc(favoris.creeAt));
}

export async function estEnFavori(userId: string, nature: "programme" | "mentor" | "opportunite" | "publication" | "session", cibleId: string) {
  const l = await db
    .select({ id: favoris.id })
    .from(favoris)
    .where(and(eq(favoris.userId, userId), eq(favoris.nature, nature), eq(favoris.cibleId, cibleId)))
    .limit(1);
  return l.length > 0;
}

/* --- Sessions ouvertes à l'inscription ------------------------------------- */

export async function sessionOuverte(reference: string) {
  const lignes = await db
    .select({
      id: sessions.id,
      reference: sessions.reference,
      capacite: sessions.capacite,
      prixFcfa: sessions.prixFcfa,
      debut: sessions.debutAt,
      fin: sessions.finAt,
      clotureAt: sessions.clotureAt,
      lieu: sessions.lieu,
      statut: sessions.statut,
      programmeTitre: programmes.titre,
      programmeSlug: programmes.slug,
      dureeLibelle: programmes.dureeLibelle,
      format: programmes.format,
    })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    /* Le statut du programme parent compte autant que celui de la session :
       sans lui, une session ouverte rattachée à un brouillon reste
       réservable, et engage le cabinet sur une offre non validée. */
    .where(and(eq(sessions.reference, reference), eq(programmes.statut, "publie")))
    .limit(1);

  const s = lignes[0];
  if (!s) return null;

  const [pris] = await db
    .select({ n: count() })
    .from(inscriptions)
    .where(
      and(eq(inscriptions.sessionId, s.id), inArray(inscriptions.statut, ["confirmee", "terminee"])),
    );

  /* L'état se calcule ici et non dans la page : une comparaison à l'heure
     courante est impure, elle n'a rien à faire dans un rendu. */
  const confirmees = Number(pris?.n ?? 0);
  const restantes = Math.max(0, s.capacite - confirmees);
  const close = s.clotureAt.getTime() < Date.now();

  return {
    ...s,
    confirmees,
    restantes,
    close,
    ouverteAuxInscriptions: !close && restantes > 0 && s.statut === "ouverte",
  };
}

export async function dejaInscrit(userId: string, sessionId: string) {
  const l = await db
    .select({ id: inscriptions.id, statut: inscriptions.statut })
    .from(inscriptions)
    .where(and(eq(inscriptions.userId, userId), eq(inscriptions.sessionId, sessionId)))
    .limit(1);
  return l[0] ?? null;
}

/* --- Séances à venir d'une inscription ------------------------------------- */

export async function seancesDuProgramme(programmeId: string) {
  return db
    .select({
      id: seances.id,
      titre: seances.titre,
      dureeMinutes: seances.dureeMinutes,
      moduleTitre: modules.titre,
      ordreModule: modules.ordre,
      ordreSeance: seances.ordre,
    })
    .from(seances)
    .innerJoin(modules, eq(modules.id, seances.moduleId))
    .where(eq(modules.programmeId, programmeId))
    .orderBy(asc(modules.ordre), asc(seances.ordre));
}

export async function presencesDeLInscription(inscriptionId: string) {
  const lignes = await db
    .select({ seanceId: presences.seanceId, statut: presences.statut })
    .from(presences)
    .where(eq(presences.inscriptionId, inscriptionId));
  return new Map(lignes.map((l) => [l.seanceId, l.statut]));
}

/* --- Sessions à venir, pour proposer une inscription ----------------------- */

export async function prochainesSessions(limite = 6) {
  const lignes = await db
    .select({
      reference: sessions.reference,
      debut: sessions.debutAt,
      capacite: sessions.capacite,
      prixFcfa: sessions.prixFcfa,
      titre: programmes.titre,
      slug: programmes.slug,
    })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(
      and(
        eq(programmes.statut, "publie"),
        eq(sessions.statut, "ouverte"),
        gte(sessions.clotureAt, new Date()),
      ),
    )
    .orderBy(asc(sessions.debutAt))
    .limit(limite);
  return lignes;
}
