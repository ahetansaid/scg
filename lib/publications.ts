import { and, asc, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";

import { db } from "./db";
import { articles, chapitres, figures, opportunites, profiles, rapports } from "./db/schema";

/* ============================================================================
   Publications, rapports et opportunités.
   Le corps d'un article et les données d'une figure sont en JSONB : c'est du
   contenu structuré, pas des colonnes. Une figure porte toujours sa série ET
   sa source – c'est ce qui la rend citable, et ce qui distingue une
   publication de cabinet d'un billet d'opinion.
   ============================================================================ */

export type BlocTexte = { type: "paragraphe" | "intertitre" | "citation"; texte: string };
export type BlocListe = { type: "liste"; items: string[] };
export type Bloc = BlocTexte | BlocListe;

export type SerieFigure = { libelle: string; valeur: number };

export function blocs(brut: unknown): Bloc[] {
  if (!Array.isArray(brut)) return [];
  return brut.filter((b): b is Bloc => {
    if (typeof b !== "object" || b === null || !("type" in b)) return false;
    const t = (b as { type: unknown }).type;
    if (t === "liste") return Array.isArray((b as { items?: unknown }).items);
    return (
      (t === "paragraphe" || t === "intertitre" || t === "citation") &&
      typeof (b as { texte?: unknown }).texte === "string"
    );
  });
}

export function serie(brut: unknown): SerieFigure[] {
  if (!Array.isArray(brut)) return [];
  return brut.filter(
    (d): d is SerieFigure =>
      typeof d === "object" &&
      d !== null &&
      typeof (d as { libelle?: unknown }).libelle === "string" &&
      typeof (d as { valeur?: unknown }).valeur === "number",
  );
}

/* --- Articles -------------------------------------------------------------- */

export async function listerArticles(categorie?: string) {
  return db
    .select({
      slug: articles.slug,
      categorie: articles.categorie,
      titre: articles.titre,
      chapo: articles.chapo,
      minutesLecture: articles.minutesLecture,
      publieAt: articles.publieAt,
    })
    .from(articles)
    .where(
      categorie
        ? and(eq(articles.statut, "publie"), eq(articles.categorie, categorie))
        : eq(articles.statut, "publie"),
    )
    .orderBy(desc(articles.publieAt));
}

export async function categoriesArticles(): Promise<string[]> {
  const lignes = await db
    .select({ categorie: articles.categorie })
    .from(articles)
    .where(eq(articles.statut, "publie"))
    .groupBy(articles.categorie)
    .orderBy(asc(articles.categorie));
  return lignes.map((l) => l.categorie);
}

export async function trouverArticle(slug: string) {
  const lignes = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      categorie: articles.categorie,
      titre: articles.titre,
      chapo: articles.chapo,
      corps: articles.corps,
      minutesLecture: articles.minutesLecture,
      publieAt: articles.publieAt,
      auteurPrenom: profiles.prenom,
      auteurNom: profiles.nom,
    })
    .from(articles)
    .leftJoin(profiles, eq(profiles.userId, articles.auteurUserId))
    .where(and(eq(articles.slug, slug), eq(articles.statut, "publie")))
    .limit(1);

  const a = lignes[0];
  return a ? { ...a, blocs: blocs(a.corps) } : null;
}

/* --- Rapports chapitrés ---------------------------------------------------- */

export async function listerRapports() {
  return db
    .select({
      slug: rapports.slug,
      titre: rapports.titre,
      sousTitre: rapports.sousTitre,
      resume: rapports.resume,
      publieAt: rapports.publieAt,
    })
    .from(rapports)
    .where(eq(rapports.statut, "publie"))
    .orderBy(desc(rapports.publieAt));
}

export async function trouverRapport(slug: string) {
  const lignes = await db
    .select()
    .from(rapports)
    .where(and(eq(rapports.slug, slug), eq(rapports.statut, "publie")))
    .limit(1);

  const r = lignes[0];
  if (!r) return null;

  const chapitresBruts = await db
    .select()
    .from(chapitres)
    .where(eq(chapitres.rapportId, r.id))
    .orderBy(asc(chapitres.ordre));

  const figuresBrutes =
    chapitresBruts.length > 0
      ? await db
          .select()
          .from(figures)
          .where(
            inArray(
              figures.chapitreId,
              chapitresBruts.map((c) => c.id),
            ),
          )
          .orderBy(asc(figures.ordre))
      : [];

  return {
    ...r,
    chapitres: chapitresBruts.map((c) => ({
      ...c,
      blocs: blocs(c.corps),
      figures: figuresBrutes
        .filter((f) => f.chapitreId === c.id)
        .map((f) => ({ ...f, serie: serie(f.donnees) })),
    })),
  };
}

export async function slugsPublications() {
  const [a, r] = await Promise.all([
    db.select({ slug: articles.slug }).from(articles).where(eq(articles.statut, "publie")),
    db.select({ slug: rapports.slug }).from(rapports).where(eq(rapports.statut, "publie")),
  ]);
  return { articles: a.map((x) => x.slug), rapports: r.map((x) => x.slug) };
}

/* --- Opportunités ---------------------------------------------------------- */

export async function listerOpportunites(domaine?: string) {
  return db
    .select()
    .from(opportunites)
    .where(
      and(
        eq(opportunites.statut, "publie"),
        /* Une opportunité dont la date limite est passée n'est plus une
           opportunité : on la sort de la liste sans la supprimer. */
        or(isNull(opportunites.dateLimite), gte(opportunites.dateLimite, new Date())),
        ...(domaine ? [eq(opportunites.domaine, domaine)] : []),
      ),
    )
    .orderBy(asc(opportunites.dateLimite));
}

export async function domainesOpportunites(): Promise<string[]> {
  const lignes = await db
    .select({ domaine: opportunites.domaine })
    .from(opportunites)
    .where(eq(opportunites.statut, "publie"))
    .groupBy(opportunites.domaine)
    .orderBy(asc(opportunites.domaine));
  return lignes.map((l) => l.domaine);
}

export async function trouverOpportunite(slug: string) {
  const lignes = await db
    .select()
    .from(opportunites)
    .where(and(eq(opportunites.slug, slug), eq(opportunites.statut, "publie")))
    .limit(1);

  const o = lignes[0];
  if (!o) return null;

  /* L'échéance se compare ici, pas dans la page : une comparaison à l'heure
     courante est impure et n'a rien à faire dans un rendu. */
  return { ...o, expiree: o.dateLimite ? o.dateLimite.getTime() < Date.now() : false };
}

export async function slugsOpportunites() {
  const lignes = await db
    .select({ slug: opportunites.slug })
    .from(opportunites)
    .where(eq(opportunites.statut, "publie"));
  return lignes.map((l) => l.slug);
}
