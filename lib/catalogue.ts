import { and, asc, count, eq, gte, inArray, lt } from "drizzle-orm";

import { db } from "./db";
import { inscriptions, modules, programmes, seances, sessions } from "./db/schema";
import { dateCourte, type Format, type Nature } from "./vocabulaire";

/* ============================================================================
   Lecture du catalogue.
   Tout vient de Postgres. Le nombre de places prises n'est stocké nulle part :
   il se compte depuis `inscriptions`, sinon il dérive dès la première
   annulation.
   ============================================================================ */

export type EtatSession = "ouverte" | "dernieres" | "complete" | "close";

export type SessionVue = {
  id: string;
  reference: string;
  lieu: string;
  ville: string;
  debut: Date;
  fin: Date;
  cloture: Date;
  capacite: number;
  prixFcfa: number;
  confirmees: number;
  restantes: number;
  etat: EtatSession;
  debutCourt: string;
};

export type ProgrammeVue = {
  id: string;
  slug: string;
  nature: Nature;
  domaine: string;
  format: Format;
  titre: string;
  accroche: string;
  description: string;
  dureeLibelle: string;
  objectifs: string[];
  prerequis: string[];
  sessions: SessionVue[];
  prochaine: SessionVue | null;
};

export type ModuleVue = {
  id: string;
  titre: string;
  resume: string;
  /** Numéro de la première séance du module dans le déroulé complet. */
  debut: number;
  seances: { id: string; titre: string; dureeMinutes: number }[];
};

/* Le seuil de « dernières places » est proportionnel : trois places libres sur
   vingt-cinq ne veut pas dire la même chose que trois sur cinq. */
function etatSession(capacite: number, confirmees: number, cloture: Date): EtatSession {
  if (confirmees >= capacite) return "complete";
  if (cloture.getTime() < Date.now()) return "close";
  const restantes = capacite - confirmees;
  return restantes <= Math.ceil(capacite * 0.2) ? "dernieres" : "ouverte";
}

type LigneSession = {
  id: string;
  reference: string;
  lieu: string;
  ville: string;
  debutAt: Date;
  finAt: Date;
  clotureAt: Date;
  capacite: number;
  prixFcfa: number;
  programmeId: string;
};

function vueSession(s: LigneSession, confirmees: number): SessionVue {
  return {
    id: s.id,
    reference: s.reference,
    lieu: s.lieu,
    ville: s.ville,
    debut: s.debutAt,
    fin: s.finAt,
    cloture: s.clotureAt,
    capacite: s.capacite,
    prixFcfa: s.prixFcfa,
    confirmees,
    restantes: Math.max(0, s.capacite - confirmees),
    etat: etatSession(s.capacite, confirmees, s.clotureAt),
    debutCourt: dateCourte(s.debutAt),
  };
}

/* Une seule requête pour compter les places prises de toutes les sessions
   affichées : compter session par session ferait une requête par ligne. */
async function compterConfirmees(sessionIds: string[]): Promise<Map<string, number>> {
  if (sessionIds.length === 0) return new Map();
  const lignes = await db
    .select({ sessionId: inscriptions.sessionId, n: count() })
    .from(inscriptions)
    .where(
      and(
        inArray(inscriptions.sessionId, sessionIds),
        inArray(inscriptions.statut, ["confirmee", "terminee"]),
      ),
    )
    .groupBy(inscriptions.sessionId);
  return new Map(lignes.map((l) => [l.sessionId, Number(l.n)]));
}

async function assembler(lignes: (typeof programmes.$inferSelect)[]): Promise<ProgrammeVue[]> {
  if (lignes.length === 0) return [];

  const toutesSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        inArray(
          sessions.programmeId,
          lignes.map((p) => p.id),
        ),
        inArray(sessions.statut, ["ouverte", "complete", "close"]),
      ),
    )
    .orderBy(asc(sessions.debutAt));

  const confirmees = await compterConfirmees(toutesSessions.map((s) => s.id));

  return lignes.map((p) => {
    const vues = toutesSessions
      .filter((s) => s.programmeId === p.id)
      .map((s) => vueSession(s, confirmees.get(s.id) ?? 0));

    return {
      id: p.id,
      slug: p.slug,
      nature: p.nature as Nature,
      domaine: p.domaine,
      format: p.format as Format,
      titre: p.titre,
      accroche: p.accroche,
      description: p.description,
      dureeLibelle: p.dureeLibelle,
      objectifs: p.objectifs,
      prerequis: p.prerequis,
      sessions: vues,
      prochaine: vues.find((s) => s.etat === "ouverte" || s.etat === "dernieres") ?? vues[0] ?? null,
    };
  });
}

export type Filtres = {
  domaine?: string;
  nature?: string;
  format?: string;
  ouvertes?: boolean;
};

export async function listerProgrammes(filtres: Filtres = {}): Promise<ProgrammeVue[]> {
  const conditions = [eq(programmes.statut, "publie")];
  if (filtres.domaine) conditions.push(eq(programmes.domaine, filtres.domaine));
  if (filtres.nature) conditions.push(eq(programmes.nature, filtres.nature as Nature));
  if (filtres.format) conditions.push(eq(programmes.format, filtres.format as Format));

  const lignes = await db
    .select()
    .from(programmes)
    .where(and(...conditions))
    .orderBy(asc(programmes.titre));

  const vues = await assembler(lignes);

  return vues
    .filter((p) => !filtres.ouvertes || p.prochaine?.etat === "ouverte" || p.prochaine?.etat === "dernieres")
    .sort((a, b) => {
      /* Les programmes sans session à venir passent en fin de liste plutôt
         que de remonter par hasard en tête. */
      const da = a.prochaine?.debut.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dbb = b.prochaine?.debut.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - dbb;
    });
}

/* Le statut se vérifie ici, pas seulement dans les listes : sans ce filtre,
   un programme en brouillon – tarifs non arrêtés, contenus provisoires – est
   servi à qui connaît son adresse, alors qu'il est absent du catalogue. */
export async function trouverProgramme(slug: string): Promise<ProgrammeVue | null> {
  const lignes = await db
    .select()
    .from(programmes)
    .where(and(eq(programmes.slug, slug), eq(programmes.statut, "publie")))
    .limit(1);
  const [vue] = await assembler(lignes);
  return vue ?? null;
}

export async function slugsProgrammes(): Promise<string[]> {
  const lignes = await db
    .select({ slug: programmes.slug })
    .from(programmes)
    .where(eq(programmes.statut, "publie"));
  return lignes.map((l) => l.slug);
}

/** Le déroulé pédagogique, numéroté en continu d'un module à l'autre. */
export async function derouleProgramme(programmeId: string): Promise<ModuleVue[]> {
  const lignes = await db
    .select({
      moduleId: modules.id,
      moduleTitre: modules.titre,
      moduleResume: modules.resume,
      moduleOrdre: modules.ordre,
      seanceId: seances.id,
      seanceTitre: seances.titre,
      seanceOrdre: seances.ordre,
      dureeMinutes: seances.dureeMinutes,
    })
    .from(modules)
    .leftJoin(seances, eq(seances.moduleId, modules.id))
    .where(eq(modules.programmeId, programmeId))
    .orderBy(asc(modules.ordre), asc(seances.ordre));

  const parModule = new Map<string, ModuleVue>();
  for (const l of lignes) {
    let m = parModule.get(l.moduleId);
    if (!m) {
      m = { id: l.moduleId, titre: l.moduleTitre, resume: l.moduleResume, debut: 0, seances: [] };
      parModule.set(l.moduleId, m);
    }
    if (l.seanceId) {
      m.seances.push({
        id: l.seanceId,
        titre: l.seanceTitre ?? "",
        dureeMinutes: l.dureeMinutes ?? 0,
      });
    }
  }

  let decalage = 0;
  return [...parModule.values()].map((m) => {
    const avec = { ...m, debut: decalage };
    decalage += m.seances.length;
    return avec;
  });
}

/* Les sessions du trimestre en cours, pour le ruban de l'accueil. */
export async function sessionsDuTrimestre(depuis = new Date()): Promise<
  (SessionVue & { programmeTitre: string; programmeSlug: string })[]
> {
  const fin = new Date(depuis);
  fin.setMonth(fin.getMonth() + 3);

  const lignes = await db
    .select({
      session: sessions,
      titre: programmes.titre,
      slug: programmes.slug,
    })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(
      and(
        eq(programmes.statut, "publie"),
        inArray(sessions.statut, ["ouverte", "complete"]),
        /* Opérateurs Drizzle plutôt qu'un `sql` brut : une Date interpolée
           dans un gabarit `sql` arrive telle quelle au pilote, qui attend une
           chaîne – et la requête échoue à l'exécution. */
        lt(sessions.debutAt, fin),
        gte(sessions.finAt, depuis),
      ),
    )
    .orderBy(asc(sessions.debutAt));

  const confirmees = await compterConfirmees(lignes.map((l) => l.session.id));

  return lignes.map((l) => ({
    ...vueSession(l.session, confirmees.get(l.session.id) ?? 0),
    programmeTitre: l.titre,
    programmeSlug: l.slug,
  }));
}

export { montant, formatLong } from "./vocabulaire";
