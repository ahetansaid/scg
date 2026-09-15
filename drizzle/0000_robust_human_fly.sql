CREATE TYPE "public"."canal_paiement" AS ENUM('mtn_momo', 'moov_money', 'carte', 'virement', 'especes', 'bon_de_commande');--> statement-breakpoint
CREATE TYPE "public"."format" AS ENUM('presentiel', 'hybride', 'en_ligne');--> statement-breakpoint
CREATE TYPE "public"."nature_favori" AS ENUM('programme', 'session', 'mentor', 'opportunite', 'publication');--> statement-breakpoint
CREATE TYPE "public"."nature_programme" AS ENUM('masterclass', 'formation', 'certification');--> statement-breakpoint
CREATE TYPE "public"."presence" AS ENUM('present', 'absent', 'excuse');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('visiteur', 'membre', 'mentor', 'formateur', 'admin');--> statement-breakpoint
CREATE TYPE "public"."statut_demande" AS ENUM('envoyee', 'acceptee', 'declinee', 'close');--> statement-breakpoint
CREATE TYPE "public"."statut_inscription" AS ENUM('en_attente', 'confirmee', 'annulee', 'terminee');--> statement-breakpoint
CREATE TYPE "public"."statut_paiement" AS ENUM('en_attente', 'acompte', 'solde', 'rembourse', 'echoue');--> statement-breakpoint
CREATE TYPE "public"."statut_publication" AS ENUM('brouillon', 'publie', 'archive');--> statement-breakpoint
CREATE TYPE "public"."statut_session" AS ENUM('brouillon', 'ouverte', 'complete', 'close', 'annulee');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"auteur_user_id" uuid,
	"categorie" text NOT NULL,
	"titre" text NOT NULL,
	"chapo" text DEFAULT '' NOT NULL,
	"corps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"minutes_lecture" integer DEFAULT 0 NOT NULL,
	"statut" "statut_publication" DEFAULT 'brouillon' NOT NULL,
	"publie_at" timestamp with time zone,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "certificats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"emis_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pdf_cle" text,
	CONSTRAINT "certificats_inscription_id_unique" UNIQUE("inscription_id"),
	CONSTRAINT "certificats_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "chapitres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rapport_id" uuid NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"numero" text NOT NULL,
	"titre" text NOT NULL,
	"corps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "chapitres_ordre_unique" UNIQUE("rapport_id","ordre")
);
--> statement-breakpoint
CREATE TABLE "creneaux" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"debut_at" timestamp with time zone NOT NULL,
	"duree_minutes" integer DEFAULT 45 NOT NULL,
	"format" "format" DEFAULT 'en_ligne' NOT NULL,
	"pris" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandes_mentorat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"demandeur_user_id" uuid NOT NULL,
	"creneau_id" uuid,
	"objet" text NOT NULL,
	"message" text NOT NULL,
	"format" "format" DEFAULT 'en_ligne' NOT NULL,
	"statut" "statut_demande" DEFAULT 'envoyee' NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favoris" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nature" "nature_favori" NOT NULL,
	"cible_id" uuid NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favoris_unique" UNIQUE("user_id","nature","cible_id")
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapitre_id" uuid NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"nature" text NOT NULL,
	"titre" text NOT NULL,
	"legende" text DEFAULT '' NOT NULL,
	"donnees" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_libelle" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"statut" "statut_inscription" DEFAULT 'en_attente' NOT NULL,
	"progression" integer DEFAULT 0 NOT NULL,
	"inscrit_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inscriptions_unique" UNIQUE("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "jetons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nature" text NOT NULL,
	"empreinte" text NOT NULL,
	"expire_at" timestamp with time zone NOT NULL,
	"consomme_at" timestamp with time zone,
	CONSTRAINT "jetons_empreinte_unique" UNIQUE("empreinte")
);
--> statement-breakpoint
CREATE TABLE "journal_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acteur_user_id" uuid,
	"action" text NOT NULL,
	"cible_table" text NOT NULL,
	"cible_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip" text,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"organisation" text DEFAULT '' NOT NULL,
	"domaines" text[] DEFAULT '{}'::text[] NOT NULL,
	"presentation" text DEFAULT '' NOT NULL,
	"quota_mensuel" integer DEFAULT 3 NOT NULL,
	"statut" "statut_publication" DEFAULT 'brouillon' NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentors_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "mentors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "messages_mentorat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" uuid NOT NULL,
	"auteur_user_id" uuid NOT NULL,
	"corps" text NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"titre" text NOT NULL,
	"resume" text DEFAULT '' NOT NULL,
	CONSTRAINT "modules_ordre_unique" UNIQUE("programme_id","ordre")
);
--> statement-breakpoint
CREATE TABLE "opportunites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nature" text NOT NULL,
	"domaine" text NOT NULL,
	"organisation" text NOT NULL,
	"lieu" text DEFAULT '' NOT NULL,
	"titre" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"missions" text[] DEFAULT '{}'::text[] NOT NULL,
	"profil" text[] DEFAULT '{}'::text[] NOT NULL,
	"date_limite" timestamp with time zone,
	"statut" "statut_publication" DEFAULT 'brouillon' NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"canal" "canal_paiement" NOT NULL,
	"montant_fcfa" integer NOT NULL,
	"statut" "statut_paiement" DEFAULT 'en_attente' NOT NULL,
	"reference_operateur" text,
	"relances" integer DEFAULT 0 NOT NULL,
	"echeance_at" timestamp with time zone,
	"paye_at" timestamp with time zone,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"seance_id" uuid NOT NULL,
	"statut" "presence" NOT NULL,
	"saisi_par_user_id" uuid,
	"saisi_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "presences_unique" UNIQUE("inscription_id","seance_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"prenom" text DEFAULT '' NOT NULL,
	"nom" text DEFAULT '' NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"ville" text DEFAULT '' NOT NULL,
	"structure" text DEFAULT '' NOT NULL,
	"fonction" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"maj_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nature" "nature_programme" NOT NULL,
	"domaine" text NOT NULL,
	"format" "format" NOT NULL,
	"titre" text NOT NULL,
	"accroche" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"objectifs" text[] DEFAULT '{}'::text[] NOT NULL,
	"prerequis" text[] DEFAULT '{}'::text[] NOT NULL,
	"duree_libelle" text DEFAULT '' NOT NULL,
	"statut" "statut_publication" DEFAULT 'brouillon' NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programmes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rapports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"sous_titre" text DEFAULT '' NOT NULL,
	"resume" text DEFAULT '' NOT NULL,
	"statut" "statut_publication" DEFAULT 'brouillon' NOT NULL,
	"publie_at" timestamp with time zone,
	CONSTRAINT "rapports_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "seances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"titre" text NOT NULL,
	"duree_minutes" integer DEFAULT 0 NOT NULL,
	"support_cle" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"lieu" text DEFAULT '' NOT NULL,
	"ville" text DEFAULT 'Cotonou' NOT NULL,
	"debut_at" timestamp with time zone NOT NULL,
	"fin_at" timestamp with time zone NOT NULL,
	"cloture_at" timestamp with time zone NOT NULL,
	"capacite" integer NOT NULL,
	"prix_fcfa" integer NOT NULL,
	"acompte_pourcent" integer DEFAULT 50 NOT NULL,
	"statut" "statut_session" DEFAULT 'brouillon' NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"mot_de_passe_hash" text NOT NULL,
	"email_verifie_at" timestamp with time zone,
	"role" "role" DEFAULT 'membre' NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"cree_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_auteur_user_id_users_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificats" ADD CONSTRAINT "certificats_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapitres" ADD CONSTRAINT "chapitres_rapport_id_rapports_id_fk" FOREIGN KEY ("rapport_id") REFERENCES "public"."rapports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creneaux" ADD CONSTRAINT "creneaux_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_mentorat" ADD CONSTRAINT "demandes_mentorat_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_mentorat" ADD CONSTRAINT "demandes_mentorat_demandeur_user_id_users_id_fk" FOREIGN KEY ("demandeur_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_mentorat" ADD CONSTRAINT "demandes_mentorat_creneau_id_creneaux_id_fk" FOREIGN KEY ("creneau_id") REFERENCES "public"."creneaux"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figures" ADD CONSTRAINT "figures_chapitre_id_chapitres_id_fk" FOREIGN KEY ("chapitre_id") REFERENCES "public"."chapitres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jetons" ADD CONSTRAINT "jetons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_acteur_user_id_users_id_fk" FOREIGN KEY ("acteur_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_mentorat" ADD CONSTRAINT "messages_mentorat_demande_id_demandes_mentorat_id_fk" FOREIGN KEY ("demande_id") REFERENCES "public"."demandes_mentorat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_mentorat" ADD CONSTRAINT "messages_mentorat_auteur_user_id_users_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presences" ADD CONSTRAINT "presences_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presences" ADD CONSTRAINT "presences_seance_id_seances_id_fk" FOREIGN KEY ("seance_id") REFERENCES "public"."seances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presences" ADD CONSTRAINT "presences_saisi_par_user_id_users_id_fk" FOREIGN KEY ("saisi_par_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seances" ADD CONSTRAINT "seances_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_statut_idx" ON "articles" USING btree ("statut","publie_at");--> statement-breakpoint
CREATE INDEX "creneaux_mentor_idx" ON "creneaux" USING btree ("mentor_id","debut_at");--> statement-breakpoint
CREATE INDEX "demandes_mentor_idx" ON "demandes_mentorat" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "demandes_demandeur_idx" ON "demandes_mentorat" USING btree ("demandeur_user_id","statut");--> statement-breakpoint
CREATE INDEX "figures_chapitre_idx" ON "figures" USING btree ("chapitre_id","ordre");--> statement-breakpoint
CREATE INDEX "inscriptions_user_idx" ON "inscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jetons_user_idx" ON "jetons" USING btree ("user_id","nature");--> statement-breakpoint
CREATE INDEX "journal_acteur_idx" ON "journal_audit" USING btree ("acteur_user_id","cree_at");--> statement-breakpoint
CREATE INDEX "mentors_statut_idx" ON "mentors" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "messages_demande_idx" ON "messages_mentorat" USING btree ("demande_id","cree_at");--> statement-breakpoint
CREATE INDEX "opportunites_domaine_idx" ON "opportunites" USING btree ("domaine","statut");--> statement-breakpoint
CREATE INDEX "paiements_inscription_idx" ON "paiements" USING btree ("inscription_id");--> statement-breakpoint
CREATE INDEX "paiements_statut_idx" ON "paiements" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "programmes_domaine_idx" ON "programmes" USING btree ("domaine");--> statement-breakpoint
CREATE INDEX "programmes_nature_idx" ON "programmes" USING btree ("nature");--> statement-breakpoint
CREATE INDEX "seances_module_idx" ON "seances" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "sessions_programme_idx" ON "sessions" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "sessions_debut_idx" ON "sessions" USING btree ("debut_at");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");