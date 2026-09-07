import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/* ============================================================================
   SCG — schéma initial
   PostgreSQL 16 · Drizzle
   Reprend le socle d'AfriMentor (mentors, demandes, publications,
   opportunités, favoris) et l'étend aux programmes, aux sessions et aux
   paiements. Les montants sont en francs CFA, entiers : la monnaie n'a pas
   de subdivision en usage, un décimal n'apporterait que des erreurs d'arrondi.
   ============================================================================ */

const tableauTexte = () => text().array().notNull().default(sql`'{}'::text[]`);

/* --- Énumérations ---------------------------------------------------------
   Elles vivent en base plutôt qu'en TypeScript seul : une valeur hors liste
   est rejetée par Postgres même si elle passe par une autre porte que l'API. */

export const roleEnum = pgEnum("role", [
  "visiteur",
  "membre",
  "mentor",
  "formateur",
  "admin",
]);

export const natureProgrammeEnum = pgEnum("nature_programme", [
  "masterclass",
  "formation",
  "certification",
]);

export const formatEnum = pgEnum("format", ["presentiel", "hybride", "en_ligne"]);

export const statutSessionEnum = pgEnum("statut_session", [
  "brouillon",
  "ouverte",
  "complete",
  "close",
  "annulee",
]);

export const statutInscriptionEnum = pgEnum("statut_inscription", [
  "en_attente",
  "confirmee",
  "annulee",
  "terminee",
]);

export const statutPaiementEnum = pgEnum("statut_paiement", [
  "en_attente",
  "acompte",
  "solde",
  "rembourse",
  "echoue",
]);

export const canalPaiementEnum = pgEnum("canal_paiement", [
  "mtn_momo",
  "moov_money",
  "carte",
  "virement",
  "especes",
  "bon_de_commande",
]);

export const presenceEnum = pgEnum("presence", ["present", "absent", "excuse"]);

export const statutDemandeEnum = pgEnum("statut_demande", [
  "envoyee",
  "acceptee",
  "declinee",
  "close",
]);

export const statutPublicationEnum = pgEnum("statut_publication", [
  "brouillon",
  "publie",
  "archive",
]);

export const natureFavoriEnum = pgEnum("nature_favori", [
  "programme",
  "session",
  "mentor",
  "opportunite",
  "publication",
]);

/* ============================================================================
   1. COMPTES
   ============================================================================ */

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    motDePasseHash: text("mot_de_passe_hash").notNull(),
    emailVerifieAt: timestamp("email_verifie_at", { withTimezone: true }),
    role: roleEnum().notNull().default("membre"),
    actif: boolean().notNull().default(true),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_role_idx").on(t.role)],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  prenom: text().notNull().default(""),
  nom: text().notNull().default(""),
  telephone: text().notNull().default(""),
  ville: text().notNull().default(""),
  structure: text().notNull().default(""),
  fonction: text().notNull().default(""),
  bio: text().notNull().default(""),
  avatarUrl: text("avatar_url"),
  majAt: timestamp("maj_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================================
   2. OFFRE PÉDAGOGIQUE
   ============================================================================ */

export const programmes = pgTable(
  "programmes",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    nature: natureProgrammeEnum().notNull(),
    domaine: text().notNull(),
    format: formatEnum().notNull(),
    titre: text().notNull(),
    accroche: text().notNull().default(""),
    description: text().notNull().default(""),
    objectifs: tableauTexte(),
    prerequis: tableauTexte(),
    dureeLibelle: text("duree_libelle").notNull().default(""),
    statut: statutPublicationEnum().notNull().default("brouillon"),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("programmes_domaine_idx").on(t.domaine),
    index("programmes_nature_idx").on(t.nature),
  ],
);

/* Une occurrence datée d'un programme. C'est elle que dessine le motif de la
   cohorte : `capacite` donne le nombre de carrés, les inscriptions
   confirmées donnent ceux qui sont pleins. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid().primaryKey().defaultRandom(),
    programmeId: uuid("programme_id")
      .notNull()
      .references(() => programmes.id, { onDelete: "cascade" }),
    reference: text().notNull().unique(),
    lieu: text().notNull().default(""),
    ville: text().notNull().default("Cotonou"),
    debutAt: timestamp("debut_at", { withTimezone: true }).notNull(),
    finAt: timestamp("fin_at", { withTimezone: true }).notNull(),
    clotureAt: timestamp("cloture_at", { withTimezone: true }).notNull(),
    capacite: integer().notNull(),
    prixFcfa: integer("prix_fcfa").notNull(),
    acomptePourcent: integer("acompte_pourcent").notNull().default(50),
    statut: statutSessionEnum().notNull().default("brouillon"),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sessions_programme_idx").on(t.programmeId),
    index("sessions_debut_idx").on(t.debutAt),
  ],
);

export const modules = pgTable(
  "modules",
  {
    id: uuid().primaryKey().defaultRandom(),
    programmeId: uuid("programme_id")
      .notNull()
      .references(() => programmes.id, { onDelete: "cascade" }),
    ordre: integer().notNull().default(0),
    titre: text().notNull(),
    resume: text().notNull().default(""),
  },
  (t) => [unique("modules_ordre_unique").on(t.programmeId, t.ordre)],
);

/* Une séance. Alimente à la fois le déroulé public du programme et l'arc
   de trajectoire de l'espace membre. */
export const seances = pgTable(
  "seances",
  {
    id: uuid().primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    ordre: integer().notNull().default(0),
    titre: text().notNull(),
    dureeMinutes: integer("duree_minutes").notNull().default(0),
    supportCle: text("support_cle"),
  },
  (t) => [index("seances_module_idx").on(t.moduleId)],
);

/* ============================================================================
   3. PARCOURS DU PARTICIPANT
   ============================================================================ */

export const inscriptions = pgTable(
  "inscriptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    statut: statutInscriptionEnum().notNull().default("en_attente"),
    progression: integer().notNull().default(0),
    inscritAt: timestamp("inscrit_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("inscriptions_unique").on(t.sessionId, t.userId),
    index("inscriptions_user_idx").on(t.userId),
  ],
);

/* Le statut de paiement colore chaque siège de la cohorte en back-office :
   vert soldé, laiton acompte, terre relance. */
export const paiements = pgTable(
  "paiements",
  {
    id: uuid().primaryKey().defaultRandom(),
    inscriptionId: uuid("inscription_id")
      .notNull()
      .references(() => inscriptions.id, { onDelete: "cascade" }),
    canal: canalPaiementEnum().notNull(),
    montantFcfa: integer("montant_fcfa").notNull(),
    statut: statutPaiementEnum().notNull().default("en_attente"),
    referenceOperateur: text("reference_operateur"),
    relances: integer().notNull().default(0),
    echeanceAt: timestamp("echeance_at", { withTimezone: true }),
    payeAt: timestamp("paye_at", { withTimezone: true }),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("paiements_inscription_idx").on(t.inscriptionId),
    index("paiements_statut_idx").on(t.statut),
  ],
);

export const presences = pgTable(
  "presences",
  {
    id: uuid().primaryKey().defaultRandom(),
    inscriptionId: uuid("inscription_id")
      .notNull()
      .references(() => inscriptions.id, { onDelete: "cascade" }),
    seanceId: uuid("seance_id")
      .notNull()
      .references(() => seances.id, { onDelete: "cascade" }),
    statut: presenceEnum().notNull(),
    saisiParUserId: uuid("saisi_par_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    saisiAt: timestamp("saisi_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("presences_unique").on(t.inscriptionId, t.seanceId)],
);

/* `numero` est ce qui apparaît sur le PDF et sur la page publique de
   vérification. Unique, non devinable, jamais réattribué. */
export const certificats = pgTable("certificats", {
  id: uuid().primaryKey().defaultRandom(),
  inscriptionId: uuid("inscription_id")
    .notNull()
    .unique()
    .references(() => inscriptions.id, { onDelete: "cascade" }),
  numero: text().notNull().unique(),
  emisAt: timestamp("emis_at", { withTimezone: true }).notNull().defaultNow(),
  pdfCle: text("pdf_cle"),
});

/* ============================================================================
   4. MENTORAT — repris d'AfriMentor
   ============================================================================ */

export const mentors = pgTable(
  "mentors",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text().notNull().unique(),
    titre: text().notNull(),
    organisation: text().notNull().default(""),
    domaines: tableauTexte(),
    presentation: text().notNull().default(""),
    quotaMensuel: integer("quota_mensuel").notNull().default(3),
    statut: statutPublicationEnum().notNull().default("brouillon"),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("mentors_statut_idx").on(t.statut)],
);

export const creneaux = pgTable(
  "creneaux",
  {
    id: uuid().primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    debutAt: timestamp("debut_at", { withTimezone: true }).notNull(),
    dureeMinutes: integer("duree_minutes").notNull().default(45),
    format: formatEnum().notNull().default("en_ligne"),
    pris: boolean().notNull().default(false),
  },
  (t) => [index("creneaux_mentor_idx").on(t.mentorId, t.debutAt)],
);

export const demandesMentorat = pgTable(
  "demandes_mentorat",
  {
    id: uuid().primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    demandeurUserId: uuid("demandeur_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creneauId: uuid("creneau_id").references(() => creneaux.id, {
      onDelete: "set null",
    }),
    objet: text().notNull(),
    message: text().notNull(),
    format: formatEnum().notNull().default("en_ligne"),
    statut: statutDemandeEnum().notNull().default("envoyee"),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("demandes_mentor_idx").on(t.mentorId),
    index("demandes_demandeur_idx").on(t.demandeurUserId, t.statut),
  ],
);

export const messagesMentorat = pgTable(
  "messages_mentorat",
  {
    id: uuid().primaryKey().defaultRandom(),
    demandeId: uuid("demande_id")
      .notNull()
      .references(() => demandesMentorat.id, { onDelete: "cascade" }),
    auteurUserId: uuid("auteur_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    corps: text().notNull(),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_demande_idx").on(t.demandeId, t.creeAt)],
);

/* ============================================================================
   5. PUBLICATIONS — moteur éditorial repris de Bénin Numérique 2050
   ============================================================================ */

export const articles = pgTable(
  "articles",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    auteurUserId: uuid("auteur_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    categorie: text().notNull(),
    titre: text().notNull(),
    chapo: text().notNull().default(""),
    corps: jsonb().notNull().default(sql`'[]'::jsonb`),
    minutesLecture: integer("minutes_lecture").notNull().default(0),
    statut: statutPublicationEnum().notNull().default("brouillon"),
    publieAt: timestamp("publie_at", { withTimezone: true }),
  },
  (t) => [index("articles_statut_idx").on(t.statut, t.publieAt)],
);

export const rapports = pgTable("rapports", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  titre: text().notNull(),
  sousTitre: text("sous_titre").notNull().default(""),
  resume: text().notNull().default(""),
  statut: statutPublicationEnum().notNull().default("brouillon"),
  publieAt: timestamp("publie_at", { withTimezone: true }),
});

export const chapitres = pgTable(
  "chapitres",
  {
    id: uuid().primaryKey().defaultRandom(),
    rapportId: uuid("rapport_id")
      .notNull()
      .references(() => rapports.id, { onDelete: "cascade" }),
    ordre: integer().notNull().default(0),
    numero: text().notNull(),
    titre: text().notNull(),
    corps: jsonb().notNull().default(sql`'[]'::jsonb`),
  },
  (t) => [unique("chapitres_ordre_unique").on(t.rapportId, t.ordre)],
);

/* `donnees` porte la série telle qu'elle est tracée, et `sourceLibelle` d'où
   elle vient. Les deux ensemble rendent la figure téléchargeable et citable —
   c'est ce qui distingue une publication de cabinet d'un billet de blog. */
export const figures = pgTable(
  "figures",
  {
    id: uuid().primaryKey().defaultRandom(),
    chapitreId: uuid("chapitre_id")
      .notNull()
      .references(() => chapitres.id, { onDelete: "cascade" }),
    ordre: integer().notNull().default(0),
    nature: text().notNull(),
    titre: text().notNull(),
    legende: text().notNull().default(""),
    donnees: jsonb().notNull().default(sql`'[]'::jsonb`),
    sourceLibelle: text("source_libelle").notNull().default(""),
  },
  (t) => [index("figures_chapitre_idx").on(t.chapitreId, t.ordre)],
);

/* ============================================================================
   6. OPPORTUNITÉS ET FAVORIS — repris d'AfriMentor
   ============================================================================ */

export const opportunites = pgTable(
  "opportunites",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    nature: text().notNull(),
    domaine: text().notNull(),
    organisation: text().notNull(),
    lieu: text().notNull().default(""),
    titre: text().notNull(),
    description: text().notNull().default(""),
    missions: tableauTexte(),
    profil: tableauTexte(),
    dateLimite: timestamp("date_limite", { withTimezone: true }),
    statut: statutPublicationEnum().notNull().default("brouillon"),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("opportunites_domaine_idx").on(t.domaine, t.statut)],
);

/* Une seule table de favoris pour tout ce qu'on peut mettre de côté —
   programme, mentor, opportunité, publication. Le suivi d'un mentor est un
   favori de nature « mentor » : inutile d'une table dédiée. */
export const favoris = pgTable(
  "favoris",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nature: natureFavoriEnum().notNull(),
    cibleId: uuid("cible_id").notNull(),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("favoris_unique").on(t.userId, t.nature, t.cibleId)],
);

/* ============================================================================
   7. EXPLOITATION
   ============================================================================ */

/* Toute action d'administration laisse une trace. Sans ça, un litige sur un
   paiement ou une place attribuée est impossible à trancher. */
export const journalAudit = pgTable(
  "journal_audit",
  {
    id: uuid().primaryKey().defaultRandom(),
    acteurUserId: uuid("acteur_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text().notNull(),
    cibleTable: text("cible_table").notNull(),
    cibleId: uuid("cible_id"),
    details: jsonb().notNull().default(sql`'{}'::jsonb`),
    ip: text(),
    creeAt: timestamp("cree_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("journal_acteur_idx").on(t.acteurUserId, t.creeAt)],
);

export const jetons = pgTable(
  "jetons",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nature: text().notNull(),
    empreinte: text().notNull().unique(),
    expireAt: timestamp("expire_at", { withTimezone: true }).notNull(),
    consommeAt: timestamp("consomme_at", { withTimezone: true }),
  },
  (t) => [index("jetons_user_idx").on(t.userId, t.nature)],
);
