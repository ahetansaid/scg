import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";

import { db } from "./db";
import {
  creneaux,
  demandesMentorat,
  mentors,
  messagesMentorat,
  profiles,
  users,
} from "./db/schema";
import type { Format } from "./vocabulaire";

/* ============================================================================
   Mentorat.
   Le quota mensuel n'est pas une décoration : un mentor disponible pour tout
   le monde n'est disponible pour personne. Il est vérifié à l'écriture, pas
   seulement affiché.
   ============================================================================ */

export const DEMANDES_OUVERTES_MAX = 3;

export type MentorVue = {
  id: string;
  slug: string;
  nomComplet: string;
  initiales: string;
  titre: string;
  organisation: string;
  domaines: string[];
  presentation: string;
  quotaMensuel: number;
  creneauxLibres: number;
  avatarUrl: string | null;
};

function initiales(prenom: string, nom: string, repli: string) {
  const lettres = [prenom, nom]
    .filter(Boolean)
    .map((m) => m.trim()[0]?.toUpperCase() ?? "")
    .join("");
  return lettres || repli.slice(0, 2).toUpperCase();
}

const CHAMPS = {
  id: mentors.id,
  slug: mentors.slug,
  titre: mentors.titre,
  organisation: mentors.organisation,
  domaines: mentors.domaines,
  presentation: mentors.presentation,
  quotaMensuel: mentors.quotaMensuel,
  userId: mentors.userId,
  prenom: profiles.prenom,
  nom: profiles.nom,
  avatarUrl: profiles.avatarUrl,
  email: users.email,
};

/* Un seul comptage groupé des créneaux libres : compter mentor par mentor
   ferait une requête par ligne de l'annuaire. */
async function creneauxParMentor(): Promise<Map<string, number>> {
  const lignes = await db
    .select({ mentorId: creneaux.mentorId, n: count() })
    .from(creneaux)
    .where(and(eq(creneaux.pris, false), gt(creneaux.debutAt, new Date())))
    .groupBy(creneaux.mentorId);
  return new Map(lignes.map((l) => [l.mentorId, Number(l.n)]));
}

function assembler(
  l: {
    id: string;
    slug: string;
    titre: string;
    organisation: string;
    domaines: string[];
    presentation: string;
    quotaMensuel: number;
    prenom: string | null;
    nom: string | null;
    avatarUrl: string | null;
    email: string;
  },
  libres: number,
): MentorVue {
  const prenom = l.prenom ?? "";
  const nom = l.nom ?? "";
  return {
    id: l.id,
    slug: l.slug,
    nomComplet: [prenom, nom].filter(Boolean).join(" ") || l.email,
    initiales: initiales(prenom, nom, l.email),
    titre: l.titre,
    organisation: l.organisation,
    domaines: l.domaines,
    presentation: l.presentation,
    quotaMensuel: l.quotaMensuel,
    creneauxLibres: libres,
    avatarUrl: l.avatarUrl,
  };
}

export async function listerMentors(domaine?: string): Promise<MentorVue[]> {
  const lignes = await db
    .select(CHAMPS)
    .from(mentors)
    .innerJoin(users, eq(users.id, mentors.userId))
    .leftJoin(profiles, eq(profiles.userId, mentors.userId))
    .where(
      domaine
        ? and(eq(mentors.statut, "publie"), sql`${domaine} = any(${mentors.domaines})`)
        : eq(mentors.statut, "publie"),
    )
    .orderBy(asc(mentors.titre));

  const libres = await creneauxParMentor();
  return lignes.map((l) => assembler(l, libres.get(l.id) ?? 0));
}

export async function domainesDeMentorat(): Promise<string[]> {
  const lignes = await db
    .select({ domaine: sql<string>`unnest(${mentors.domaines})` })
    .from(mentors)
    .where(eq(mentors.statut, "publie"));
  return [...new Set(lignes.map((l) => l.domaine))].sort();
}

/* Même règle que pour les programmes : une fiche en brouillon expose une
   personne qui n'a pas encore validé sa présentation. Le filtre appartient
   à l'accès direct, pas seulement à l'annuaire. */
export async function trouverMentor(slug: string) {
  const lignes = await db
    .select(CHAMPS)
    .from(mentors)
    .innerJoin(users, eq(users.id, mentors.userId))
    .leftJoin(profiles, eq(profiles.userId, mentors.userId))
    .where(and(eq(mentors.slug, slug), eq(mentors.statut, "publie")))
    .limit(1);

  const l = lignes[0];
  if (!l) return null;

  const libres = await db
    .select({
      id: creneaux.id,
      debutAt: creneaux.debutAt,
      dureeMinutes: creneaux.dureeMinutes,
      format: creneaux.format,
    })
    .from(creneaux)
    .where(and(eq(creneaux.mentorId, l.id), eq(creneaux.pris, false), gt(creneaux.debutAt, new Date())))
    .orderBy(asc(creneaux.debutAt))
    .limit(12);

  return {
    ...assembler(l, libres.length),
    userId: l.userId,
    creneaux: libres as { id: string; debutAt: Date; dureeMinutes: number; format: Format }[],
  };
}

export async function slugsMentors(): Promise<string[]> {
  const lignes = await db
    .select({ slug: mentors.slug })
    .from(mentors)
    .where(eq(mentors.statut, "publie"));
  return lignes.map((l) => l.slug);
}

/* --- Demandes -------------------------------------------------------------- */

export type DemandeVue = {
  id: string;
  objet: string;
  message: string;
  statut: "envoyee" | "acceptee" | "declinee" | "close";
  format: Format;
  creeAt: Date;
  creneauAt: Date | null;
  mentorSlug: string;
  mentorNom: string;
  mentorTitre: string;
  demandeurNom: string;
  demandeurEmail: string;
  demandeurUserId: string;
  mentorUserId: string;
};

const CHAMPS_DEMANDE = {
  id: demandesMentorat.id,
  objet: demandesMentorat.objet,
  message: demandesMentorat.message,
  statut: demandesMentorat.statut,
  format: demandesMentorat.format,
  creeAt: demandesMentorat.creeAt,
  creneauAt: creneaux.debutAt,
  mentorSlug: mentors.slug,
  mentorTitre: mentors.titre,
  mentorUserId: mentors.userId,
  demandeurUserId: demandesMentorat.demandeurUserId,
  demandeurEmail: users.email,
  demandeurPrenom: profiles.prenom,
  demandeurNom: profiles.nom,
};

function vueDemande(l: {
  id: string;
  objet: string;
  message: string;
  statut: "envoyee" | "acceptee" | "declinee" | "close";
  format: Format;
  creeAt: Date;
  creneauAt: Date | null;
  mentorSlug: string;
  mentorTitre: string;
  mentorUserId: string;
  demandeurUserId: string;
  demandeurEmail: string;
  demandeurPrenom: string | null;
  demandeurNom: string | null;
}): DemandeVue {
  return {
    id: l.id,
    objet: l.objet,
    message: l.message,
    statut: l.statut,
    format: l.format,
    creeAt: l.creeAt,
    creneauAt: l.creneauAt,
    mentorSlug: l.mentorSlug,
    mentorNom: l.mentorTitre,
    mentorTitre: l.mentorTitre,
    demandeurNom:
      [l.demandeurPrenom, l.demandeurNom].filter(Boolean).join(" ") || l.demandeurEmail,
    demandeurEmail: l.demandeurEmail,
    demandeurUserId: l.demandeurUserId,
    mentorUserId: l.mentorUserId,
  };
}

/* Volontairement non asynchrone : on renvoie le constructeur de requête pour
   que chaque appelant y ajoute son `where`, et non le résultat déjà exécuté. */
function requeteDemandes() {
  return db
    .select(CHAMPS_DEMANDE)
    .from(demandesMentorat)
    .innerJoin(mentors, eq(mentors.id, demandesMentorat.mentorId))
    .innerJoin(users, eq(users.id, demandesMentorat.demandeurUserId))
    .leftJoin(profiles, eq(profiles.userId, demandesMentorat.demandeurUserId))
    .leftJoin(creneaux, eq(creneaux.id, demandesMentorat.creneauId));
}

export async function mesDemandes(userId: string): Promise<DemandeVue[]> {
  const lignes = await requeteDemandes()
    .where(eq(demandesMentorat.demandeurUserId, userId))
    .orderBy(desc(demandesMentorat.creeAt));
  return lignes.map(vueDemande);
}

export async function demandesRecues(mentorUserId: string): Promise<DemandeVue[]> {
  const lignes = await requeteDemandes()
    .where(eq(mentors.userId, mentorUserId))
    .orderBy(desc(demandesMentorat.creeAt));
  return lignes.map(vueDemande);
}

export async function toutesLesDemandes(): Promise<DemandeVue[]> {
  const lignes = await requeteDemandes().orderBy(desc(demandesMentorat.creeAt)).limit(200);
  return lignes.map(vueDemande);
}

export async function trouverDemande(id: string): Promise<DemandeVue | null> {
  const lignes = await requeteDemandes().where(eq(demandesMentorat.id, id)).limit(1);
  const l = lignes[0];
  return l ? vueDemande(l) : null;
}

export async function filDeLaDemande(demandeId: string) {
  return db
    .select({
      id: messagesMentorat.id,
      corps: messagesMentorat.corps,
      creeAt: messagesMentorat.creeAt,
      auteurUserId: messagesMentorat.auteurUserId,
      prenom: profiles.prenom,
      nom: profiles.nom,
      email: users.email,
    })
    .from(messagesMentorat)
    .innerJoin(users, eq(users.id, messagesMentorat.auteurUserId))
    .leftJoin(profiles, eq(profiles.userId, messagesMentorat.auteurUserId))
    .where(eq(messagesMentorat.demandeId, demandeId))
    .orderBy(asc(messagesMentorat.creeAt));
}

/** Combien de demandes encore ouvertes ce membre a-t-il ? */
export async function demandesOuvertes(userId: string): Promise<number> {
  const [l] = await db
    .select({ n: count() })
    .from(demandesMentorat)
    .where(
      and(
        eq(demandesMentorat.demandeurUserId, userId),
        eq(demandesMentorat.statut, "envoyee"),
      ),
    );
  return Number(l?.n ?? 0);
}

/** Le quota mensuel du mentor est-il déjà atteint ? */
export async function quotaAtteint(mentorId: string, quotaMensuel: number): Promise<boolean> {
  const debutDuMois = new Date();
  debutDuMois.setDate(1);
  debutDuMois.setHours(0, 0, 0, 0);

  const [l] = await db
    .select({ n: count() })
    .from(demandesMentorat)
    .where(
      and(
        eq(demandesMentorat.mentorId, mentorId),
        eq(demandesMentorat.statut, "acceptee"),
        gt(demandesMentorat.creeAt, debutDuMois),
      ),
    );
  return Number(l?.n ?? 0) >= quotaMensuel;
}

export async function creneauDisponible(creneauId: string, mentorId: string) {
  const l = await db
    .select({ id: creneaux.id })
    .from(creneaux)
    .where(and(eq(creneaux.id, creneauId), eq(creneaux.mentorId, mentorId), eq(creneaux.pris, false)))
    .limit(1);
  return l.length > 0;
}

export async function estMentor(userId: string) {
  const l = await db
    .select({ id: mentors.id, slug: mentors.slug })
    .from(mentors)
    .where(eq(mentors.userId, userId))
    .limit(1);
  return l[0] ?? null;
}

/* Créneaux à venir d'un mentor, pris ou non, pour son propre espace.
   Le filtrage sur « à venir » se fait ici et non dans la page : comparer à
   l'heure courante pendant un rendu est impur. */
export async function creneauxDuMentor(mentorId: string) {
  return db
    .select({
      id: creneaux.id,
      debutAt: creneaux.debutAt,
      dureeMinutes: creneaux.dureeMinutes,
      format: creneaux.format,
      pris: creneaux.pris,
    })
    .from(creneaux)
    .where(and(eq(creneaux.mentorId, mentorId), gt(creneaux.debutAt, new Date())))
    .orderBy(asc(creneaux.debutAt));
}
