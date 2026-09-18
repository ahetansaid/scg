"use server";

import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigerRole, type Role } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  articles,
  certificats,
  demandesMentorat,
  inscriptions,
  journalAudit,
  mentors,
  modules,
  opportunites,
  presences,
  programmes,
  seances,
  sessions,
  users,
} from "@/lib/db/schema";
import type { Format, Nature, StatutPublication } from "@/lib/vocabulaire";

/* ============================================================================
   Back-office.
   Chaque action commence par `exigerRole` : c'est le seul endroit qui compte.
   Le proxy ne voit pas les actions serveur, et une action s'appelle
   directement – masquer un bouton ne protège rien.
   ============================================================================ */

const texte = (v: FormDataEntryValue | null, maxi: number) =>
  typeof v === "string" ? v.trim().slice(0, maxi) : "";

const nombre = (v: FormDataEntryValue | null, defaut = 0) => {
  const n = Number(texte(v, 20));
  return Number.isFinite(n) ? n : defaut;
};

/* Une liste saisie une ligne par élément. Plus simple à remplir qu'un champ
   à virgules, et sans ambiguïté sur les virgules du texte lui-même. */
const lignes = (v: FormDataEntryValue | null, maxi = 4000) =>
  texte(v, maxi)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function slugifier(brut: string) {
  return brut
    .normalize("NFD")
    // Retire les diacritiques que NFD vient de détacher.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function tracer(acteurUserId: string, action: string, cibleTable: string, cibleId?: string) {
  await db.insert(journalAudit).values({ acteurUserId, action, cibleTable, cibleId: cibleId ?? null });
}

/* Postgres signale une violation d'unicité par le code 23505. Sans ce
   traitement, deux programmes au même titre produisent une erreur 500
   incompréhensible au lieu d'un message qui dit quoi corriger. */
const CODE_DOUBLON = "23505";

function estDoublon(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e && e.code === CODE_DOUBLON;
}

async function sansDoublon<T>(travail: () => Promise<T>, surDoublon: string): Promise<T> {
  try {
    return await travail();
  } catch (e) {
    if (estDoublon(e)) redirect(surDoublon);
    throw e;
  }
}

/* --- Programmes ------------------------------------------------------------ */

export async function enregistrerProgramme(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");

  const id = texte(donnees.get("id"), 60);
  const titre = texte(donnees.get("titre"), 200);
  if (titre.length < 3) redirect("/admin/programmes?erreur=titre");

  const valeurs = {
    slug: texte(donnees.get("slug"), 90) || slugifier(titre),
    nature: texte(donnees.get("nature"), 20) as Nature,
    domaine: texte(donnees.get("domaine"), 80),
    format: texte(donnees.get("format"), 20) as Format,
    titre,
    accroche: texte(donnees.get("accroche"), 400),
    description: texte(donnees.get("description"), 6000),
    dureeLibelle: texte(donnees.get("dureeLibelle"), 80),
    imageUrl: texte(donnees.get("imageUrl"), 500) || null,
    objectifs: lignes(donnees.get("objectifs")),
    prerequis: lignes(donnees.get("prerequis")),
    statut: texte(donnees.get("statut"), 20) as StatutPublication,
  };

  if (id) {
    await sansDoublon(
      () => db.update(programmes).set(valeurs).where(eq(programmes.id, id)),
      `/admin/programmes/${id}?erreur=doublon`,
    );
    await tracer(admin.id, "programme.modifie", "programmes", id);
    revalidatePath("/programmes");
    revalidatePath(`/programmes/${valeurs.slug}`);
    redirect(`/admin/programmes/${id}?enregistre=1`);
  }

  const [cree] = await sansDoublon(
    () => db.insert(programmes).values(valeurs).returning({ id: programmes.id }),
    "/admin/programmes?erreur=doublon",
  );
  await tracer(admin.id, "programme.cree", "programmes", cree?.id);
  revalidatePath("/programmes");
  redirect(`/admin/programmes/${cree?.id}?cree=1`);
}

export async function supprimerProgramme(donnees: FormData) {
  const admin = await exigerRole("admin");
  const id = texte(donnees.get("id"), 60);

  /* On refuse de supprimer un programme qui porte des inscriptions : ce sont
     des engagements pris avec des gens. On l'archive à la place. */
  const [pris] = await db
    .select({ n: count() })
    .from(inscriptions)
    .innerJoin(sessions, eq(sessions.id, inscriptions.sessionId))
    .where(eq(sessions.programmeId, id));

  if (Number(pris?.n ?? 0) > 0) {
    await db.update(programmes).set({ statut: "archive" }).where(eq(programmes.id, id));
    await tracer(admin.id, "programme.archive", "programmes", id);
    revalidatePath("/programmes");
    redirect("/admin/programmes?archive=1");
  }

  await db.delete(programmes).where(eq(programmes.id, id));
  await tracer(admin.id, "programme.supprime", "programmes", id);
  revalidatePath("/programmes");
  redirect("/admin/programmes?supprime=1");
}

/* --- Modules et séances ---------------------------------------------------- */

export async function ajouterModule(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");
  const programmeId = texte(donnees.get("programme"), 60);
  const titre = texte(donnees.get("titre"), 200);
  if (titre.length < 2) redirect(`/admin/programmes/${programmeId}?erreur=module`);

  const [dernier] = await db
    .select({ n: count() })
    .from(modules)
    .where(eq(modules.programmeId, programmeId));

  await db.insert(modules).values({
    programmeId,
    ordre: Number(dernier?.n ?? 0),
    titre,
    resume: texte(donnees.get("resume"), 600),
  });

  await tracer(admin.id, "module.ajoute", "modules", programmeId);
  revalidatePath(`/admin/programmes/${programmeId}`);
  redirect(`/admin/programmes/${programmeId}`);
}

export async function ajouterSeance(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");
  const moduleId = texte(donnees.get("module"), 60);
  const programmeId = texte(donnees.get("programme"), 60);
  const titre = texte(donnees.get("titre"), 200);
  if (titre.length < 2) redirect(`/admin/programmes/${programmeId}?erreur=seance`);

  const [dernier] = await db.select({ n: count() }).from(seances).where(eq(seances.moduleId, moduleId));

  await db.insert(seances).values({
    moduleId,
    ordre: Number(dernier?.n ?? 0),
    titre,
    dureeMinutes: Math.max(0, nombre(donnees.get("duree"), 120)),
  });

  await tracer(admin.id, "seance.ajoutee", "seances", moduleId);
  revalidatePath(`/admin/programmes/${programmeId}`);
  redirect(`/admin/programmes/${programmeId}`);
}

export async function supprimerModule(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");
  const id = texte(donnees.get("id"), 60);
  const programmeId = texte(donnees.get("programme"), 60);
  await db.delete(modules).where(eq(modules.id, id));
  await tracer(admin.id, "module.supprime", "modules", id);
  revalidatePath(`/admin/programmes/${programmeId}`);
  redirect(`/admin/programmes/${programmeId}`);
}

/* --- Sessions -------------------------------------------------------------- */

export async function enregistrerSession(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");

  const id = texte(donnees.get("id"), 60);
  const programmeId = texte(donnees.get("programme"), 60);
  const debut = new Date(texte(donnees.get("debut"), 40));
  const fin = new Date(texte(donnees.get("fin"), 40));
  const cloture = new Date(texte(donnees.get("cloture"), 40));

  const echec = (raison: string) => redirect(`/admin/sessions?erreur=${raison}`);

  if ([debut, fin, cloture].some((d) => Number.isNaN(d.getTime()))) return echec("dates");
  /* Une session qui finit avant de commencer, ou dont les inscriptions
     ferment après la fin, produit des états incohérents partout ailleurs. */
  if (fin < debut) return echec("ordre");
  if (cloture > fin) return echec("cloture");

  const capacite = Math.max(1, nombre(donnees.get("capacite"), 20));

  if (id) {
    /* On ne peut pas réduire la capacité en dessous des places déjà prises. */
    const [pris] = await db
      .select({ n: count() })
      .from(inscriptions)
      .where(and(eq(inscriptions.sessionId, id), inArray(inscriptions.statut, ["confirmee", "terminee"])));
    if (capacite < Number(pris?.n ?? 0)) return echec("capacite");
  }

  const valeurs = {
    programmeId,
    reference: texte(donnees.get("reference"), 80).toUpperCase(),
    lieu: texte(donnees.get("lieu"), 200),
    ville: texte(donnees.get("ville"), 120) || "Cotonou",
    debutAt: debut,
    finAt: fin,
    clotureAt: cloture,
    capacite,
    prixFcfa: Math.max(0, nombre(donnees.get("prix"), 0)),
    statut: texte(donnees.get("statut"), 20) as "brouillon" | "ouverte" | "complete" | "close" | "annulee",
  };

  if (id) {
    await sansDoublon(
      () => db.update(sessions).set(valeurs).where(eq(sessions.id, id)),
      "/admin/sessions?erreur=reference",
    );
    await tracer(admin.id, "session.modifiee", "sessions", id);
  } else {
    const [cree] = await sansDoublon(
      () => db.insert(sessions).values(valeurs).returning({ id: sessions.id }),
      "/admin/sessions?erreur=reference",
    );
    await tracer(admin.id, "session.creee", "sessions", cree?.id);
  }

  revalidatePath("/programmes");
  revalidatePath("/");
  redirect("/admin/sessions?enregistre=1");
}

/* --- Inscriptions ---------------------------------------------------------- */

export async function changerStatutInscription(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");
  const id = texte(donnees.get("inscription"), 60);
  const sessionId = texte(donnees.get("session"), 60);
  const statut = texte(donnees.get("statut"), 20) as
    | "en_attente"
    | "confirmee"
    | "annulee"
    | "terminee";

  /* Compter puis écrire hors transaction laisse passer deux confirmations
     simultanées – deux onglets, un double-clic, deux administrateurs sur la
     même file – et dépasse la capacité. Le verrou sur la ligne de session
     sérialise les candidats. */
  const complet = await db.transaction(async (tx) => {
    if (statut !== "confirmee") {
      await tx.update(inscriptions).set({ statut }).where(eq(inscriptions.id, id));
      return false;
    }

    const [session] = await tx
      .select({ capacite: sessions.capacite })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .for("update")
      .limit(1);

    const [pris] = await tx
      .select({ n: count() })
      .from(inscriptions)
      .where(
        and(eq(inscriptions.sessionId, sessionId), inArray(inscriptions.statut, ["confirmee", "terminee"])),
      );

    if (Number(pris?.n ?? 0) >= (session?.capacite ?? 0)) return true;

    await tx.update(inscriptions).set({ statut }).where(eq(inscriptions.id, id));
    return false;
  });

  if (complet) redirect(`/admin/sessions/${sessionId}?erreur=complet`);

  await tracer(admin.id, `inscription.${statut}`, "inscriptions", id);

  /* Le nombre de places prises se lit sur la fiche publique et sur l'accueil.
     Sans cette invalidation, un visiteur verrait une disponibilité périmée
     jusqu'à dix minutes – et tenterait de réserver une session pleine. */
  const [programme] = await db
    .select({ slug: programmes.slug })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  revalidatePath(`/admin/sessions/${sessionId}`);
  revalidatePath("/");
  revalidatePath("/programmes");
  if (programme) revalidatePath(`/programmes/${programme.slug}`);

  redirect(`/admin/sessions/${sessionId}`);
}

/* --- Présences ------------------------------------------------------------- */

export async function saisirPresence(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");
  const inscriptionId = texte(donnees.get("inscription"), 60);
  const seanceId = texte(donnees.get("seance"), 60);
  const sessionId = texte(donnees.get("session"), 60);
  const statut = texte(donnees.get("statut"), 20) as "present" | "absent" | "excuse";

  const existante = await db
    .select({ id: presences.id })
    .from(presences)
    .where(and(eq(presences.inscriptionId, inscriptionId), eq(presences.seanceId, seanceId)))
    .limit(1);

  if (existante[0]) {
    await db
      .update(presences)
      .set({ statut, saisiParUserId: admin.id, saisiAt: new Date() })
      .where(eq(presences.id, existante[0].id));
  } else {
    await db
      .insert(presences)
      .values({ inscriptionId, seanceId, statut, saisiParUserId: admin.id });
  }

  await tracer(admin.id, "presence.saisie", "presences", inscriptionId);
  revalidatePath(`/admin/sessions/${sessionId}`);
  redirect(`/admin/sessions/${sessionId}/presences`);
}

/* --- Certificats ----------------------------------------------------------- */

export async function emettreCertificat(donnees: FormData) {
  const admin = await exigerRole("admin");
  const inscriptionId = texte(donnees.get("inscription"), 60);
  const sessionId = texte(donnees.get("session"), 60);

  const deja = await db
    .select({ id: certificats.id })
    .from(certificats)
    .where(eq(certificats.inscriptionId, inscriptionId))
    .limit(1);
  if (deja[0]) redirect(`/admin/sessions/${sessionId}?erreur=certificat_existe`);

  /* Le numéro est aléatoire, pas séquentiel : un numéro qui s'incrémente se
     devine, et un certificat qui se devine ne prouve rien. */
  const aleatoire = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const numero = `SCG-${new Date().getFullYear()}-${aleatoire}`;

  await db.insert(certificats).values({ inscriptionId, numero });
  await db.update(inscriptions).set({ statut: "terminee" }).where(eq(inscriptions.id, inscriptionId));
  await tracer(admin.id, "certificat.emis", "certificats", inscriptionId);

  revalidatePath(`/admin/sessions/${sessionId}`);
  redirect(`/admin/sessions/${sessionId}?certificat=1`);
}

/* --- Mentors --------------------------------------------------------------- */

export async function enregistrerMentor(donnees: FormData) {
  const admin = await exigerRole("admin");

  const id = texte(donnees.get("id"), 60);
  const userId = texte(donnees.get("utilisateur"), 60);
  const titre = texte(donnees.get("titre"), 200);
  if (titre.length < 3) redirect("/admin/mentors?erreur=titre");

  const valeurs = {
    titre,
    slug: texte(donnees.get("slug"), 90) || slugifier(titre),
    organisation: texte(donnees.get("organisation"), 200),
    domaines: lignes(donnees.get("domaines"), 600),
    presentation: texte(donnees.get("presentation"), 4000),
    quotaMensuel: Math.max(1, nombre(donnees.get("quota"), 3)),
    statut: texte(donnees.get("statut"), 20) as StatutPublication,
  };

  if (id) {
    const [fiche] = await db
      .select({ userId: mentors.userId, statut: mentors.statut })
      .from(mentors)
      .where(eq(mentors.id, id))
      .limit(1);

    await sansDoublon(
      () => db.update(mentors).set(valeurs).where(eq(mentors.id, id)),
      "/admin/mentors?erreur=doublon",
    );

    /* Archiver la fiche rend le rôle : sinon un ancien mentor conserve
       indéfiniment l'accès aux demandes reçues. On ne touche qu'au rôle
       `mentor` – un administrateur reste administrateur. */
    if (fiche && valeurs.statut === "archive" && fiche.statut !== "archive") {
      await db
        .update(users)
        .set({ role: "membre" })
        .where(and(eq(users.id, fiche.userId), eq(users.role, "mentor")));
    }
    await tracer(admin.id, "mentor.modifie", "mentors", id);
  } else {
    if (!userId) redirect("/admin/mentors?erreur=utilisateur");
    const [cree] = await sansDoublon(
      () => db.insert(mentors).values({ ...valeurs, userId }).returning({ id: mentors.id }),
      "/admin/mentors?erreur=doublon",
    );

    /* Le rôle `mentor` sert à voir ses demandes reçues. On n'élève que les
       comptes ordinaires : écraser le rôle sans regarder l'existant
       rétrograderait un administrateur et le verrouillerait hors du
       back-office, sans aucun moyen de revenir par l'interface. */
    await db
      .update(users)
      .set({ role: "mentor" })
      .where(and(eq(users.id, userId), inArray(users.role, ["visiteur", "membre"])));

    await tracer(admin.id, "mentor.cree", "mentors", cree?.id);
  }

  revalidatePath("/mentorat");
  redirect("/admin/mentors?enregistre=1");
}

/* --- Membres --------------------------------------------------------------- */

export async function changerRole(donnees: FormData) {
  const admin = await exigerRole("admin");
  const userId = texte(donnees.get("utilisateur"), 60);
  const role = texte(donnees.get("role"), 20) as Role;

  /* Un administrateur ne peut pas se retirer ses propres droits : c'est le
     moyen le plus simple de se verrouiller hors du back-office. */
  if (userId === admin.id) redirect("/admin/membres?erreur=soi-meme");

  await db.update(users).set({ role }).where(eq(users.id, userId));
  await tracer(admin.id, `membre.role.${role}`, "users", userId);
  revalidatePath("/admin/membres");
  redirect("/admin/membres?enregistre=1");
}

/* --- Publications ---------------------------------------------------------- */

export async function enregistrerArticle(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");

  const id = texte(donnees.get("id"), 60);
  const titre = texte(donnees.get("titre"), 250);
  if (titre.length < 3) redirect("/admin/publications?erreur=titre");

  /* Le corps est saisi en paragraphes séparés par une ligne vide, et stocké
     en blocs typés : pas de HTML libre en base. */
  const corps = texte(donnees.get("corps"), 40000)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p.startsWith("## ")
        ? { type: "intertitre" as const, texte: p.slice(3).trim() }
        : { type: "paragraphe" as const, texte: p },
    );

  const statut = texte(donnees.get("statut"), 20) as StatutPublication;
  const valeurs = {
    slug: texte(donnees.get("slug"), 90) || slugifier(titre),
    categorie: texte(donnees.get("categorie"), 80) || "Note",
    titre,
    chapo: texte(donnees.get("chapo"), 600),
    corps,
    minutesLecture: Math.max(0, nombre(donnees.get("minutes"), 0)),
    statut,
    auteurUserId: admin.id,
    publieAt: statut === "publie" ? new Date() : null,
  };

  if (id) {
    await sansDoublon(
      () => db.update(articles).set(valeurs).where(eq(articles.id, id)),
      "/admin/publications?erreur=doublon",
    );
    await tracer(admin.id, "article.modifie", "articles", id);
  } else {
    const [cree] = await sansDoublon(
      () => db.insert(articles).values(valeurs).returning({ id: articles.id }),
      "/admin/publications?erreur=doublon",
    );
    await tracer(admin.id, "article.cree", "articles", cree?.id);
  }

  revalidatePath("/publications");
  redirect("/admin/publications?enregistre=1");
}

/* --- Opportunités ---------------------------------------------------------- */

export async function enregistrerOpportunite(donnees: FormData) {
  const admin = await exigerRole("admin", "formateur");

  const id = texte(donnees.get("id"), 60);
  const titre = texte(donnees.get("titre"), 250);
  if (titre.length < 3) redirect("/admin/opportunites?erreur=titre");

  const limite = texte(donnees.get("limite"), 40);
  const dateLimite = limite ? new Date(limite) : null;
  if (dateLimite && Number.isNaN(dateLimite.getTime())) {
    redirect("/admin/opportunites?erreur=date");
  }

  const valeurs = {
    slug: texte(donnees.get("slug"), 90) || slugifier(titre),
    nature: texte(donnees.get("nature"), 80) || "Appel à candidatures",
    domaine: texte(donnees.get("domaine"), 80),
    organisation: texte(donnees.get("organisation"), 200),
    lieu: texte(donnees.get("lieu"), 160),
    titre,
    description: texte(donnees.get("description"), 6000),
    missions: lignes(donnees.get("missions")),
    profil: lignes(donnees.get("profil")),
    dateLimite,
    statut: texte(donnees.get("statut"), 20) as StatutPublication,
  };

  if (id) {
    await sansDoublon(
      () => db.update(opportunites).set(valeurs).where(eq(opportunites.id, id)),
      "/admin/opportunites?erreur=doublon",
    );
    await tracer(admin.id, "opportunite.modifiee", "opportunites", id);
  } else {
    const [cree] = await sansDoublon(
      () => db.insert(opportunites).values(valeurs).returning({ id: opportunites.id }),
      "/admin/opportunites?erreur=doublon",
    );
    await tracer(admin.id, "opportunite.creee", "opportunites", cree?.id);
  }

  revalidatePath("/opportunites");
  redirect("/admin/opportunites?enregistre=1");
}

/* --- Demandes de mentorat (vue administration) ----------------------------- */

export async function clorreDemande(donnees: FormData) {
  const admin = await exigerRole("admin");
  const id = texte(donnees.get("demande"), 60);
  await db.update(demandesMentorat).set({ statut: "close" }).where(eq(demandesMentorat.id, id));
  await tracer(admin.id, "demande.close_par_admin", "demandes_mentorat", id);
  revalidatePath("/admin/demandes");
  redirect("/admin/demandes");
}
