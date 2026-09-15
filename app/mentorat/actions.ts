"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { exigerUtilisateur } from "@/lib/auth";
import { db } from "@/lib/db";
import { creneaux, demandesMentorat, journalAudit, messagesMentorat } from "@/lib/db/schema";
import { verifierDebit } from "@/lib/limitation";
import {
  creneauDisponible,
  demandesOuvertes,
  DEMANDES_OUVERTES_MAX,
  estMentor,
  quotaAtteint,
  trouverDemande,
  trouverMentor,
} from "@/lib/mentorat";

const texte = (v: FormDataEntryValue | null, maxi: number) =>
  typeof v === "string" ? v.trim().slice(0, maxi) : "";

/* ============================================================================
   Demandes de mentorat.
   Toutes les règles – quota du mentor, plafond du demandeur, disponibilité du
   créneau – sont vérifiées ICI, à l'écriture. Les afficher dans la page ne
   protège rien : une action serveur s'appelle sans passer par la page.
   ============================================================================ */

export async function envoyerDemande(donnees: FormData) {
  const slug = texte(donnees.get("mentor"), 200);
  const utilisateur = await exigerUtilisateur(`/mentorat/${slug}`);

  const objet = texte(donnees.get("objet"), 160);
  const message = texte(donnees.get("message"), 4000);
  const format = texte(donnees.get("format"), 20);
  const creneauId = texte(donnees.get("creneau"), 60);

  const echec = (raison: string) => redirect(`/mentorat/${slug}?erreur=${raison}`);

  if (objet.length < 5) return echec("objet");
  if (message.length < 40) return echec("message");

  const mentor = await trouverMentor(slug);
  if (!mentor) return echec("introuvable");

  /* Un mentor ne peut pas se solliciter lui-même : ce n'est pas un cas
     théorique, c'est le premier test que tout le monde fait. */
  if (mentor.userId === utilisateur.id) return echec("soi-meme");

  const verdict = await verifierDebit("demande-mentorat", { max: 5, fenetreMs: 60 * 60 * 1000 });
  if (!verdict.autorise) return echec("debit");

  if ((await demandesOuvertes(utilisateur.id)) >= DEMANDES_OUVERTES_MAX) return echec("plafond");
  if (await quotaAtteint(mentor.id, mentor.quotaMensuel)) return echec("quota");

  if (creneauId && !(await creneauDisponible(creneauId, mentor.id))) return echec("creneau");

  await db.insert(demandesMentorat).values({
    mentorId: mentor.id,
    demandeurUserId: utilisateur.id,
    creneauId: creneauId || null,
    objet,
    message,
    format: format === "presentiel" || format === "hybride" ? format : "en_ligne",
  });

  revalidatePath(`/mentorat/${slug}`);
  redirect("/espace/mentorat?envoyee=1");
}

/* --- Réponse du mentor ----------------------------------------------------- */

async function verifierMentorDeLaDemande(demandeId: string) {
  const utilisateur = await exigerUtilisateur();
  const demande = await trouverDemande(demandeId);
  if (!demande) notFound();
  /* Seul le mentor destinataire décide. L'administration peut clore, pas
     accepter à sa place. */
  if (demande.mentorUserId !== utilisateur.id) notFound();
  return { utilisateur, demande };
}

export async function repondreDemande(donnees: FormData) {
  const demandeId = texte(donnees.get("demande"), 60);
  const decision = texte(donnees.get("decision"), 20);
  const { utilisateur, demande } = await verifierMentorDeLaDemande(demandeId);

  if (decision !== "acceptee" && decision !== "declinee" && decision !== "close") {
    redirect("/espace/mentorat?erreur=decision");
  }

  await db
    .update(demandesMentorat)
    .set({ statut: decision })
    .where(eq(demandesMentorat.id, demandeId));

  /* Un créneau accepté est retiré des disponibilités ; un refus le rend. */
  if (demande.creneauAt) {
    const ligne = await db
      .select({ id: demandesMentorat.creneauId })
      .from(demandesMentorat)
      .where(eq(demandesMentorat.id, demandeId))
      .limit(1);
    const creneauId = ligne[0]?.id;
    if (creneauId) {
      await db
        .update(creneaux)
        .set({ pris: decision === "acceptee" })
        .where(eq(creneaux.id, creneauId));
    }
  }

  await db.insert(journalAudit).values({
    acteurUserId: utilisateur.id,
    action: `mentorat.${decision}`,
    cibleTable: "demandes_mentorat",
    cibleId: demandeId,
  });

  revalidatePath("/espace/mentorat");
  redirect(`/espace/mentorat/${demandeId}`);
}

/* --- Fil d'échange --------------------------------------------------------- */

export async function ecrireDansLeFil(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();
  const demandeId = texte(donnees.get("demande"), 60);
  const corps = texte(donnees.get("corps"), 4000);

  if (corps.length < 2) redirect(`/espace/mentorat/${demandeId}?erreur=vide`);

  const demande = await trouverDemande(demandeId);
  if (!demande) notFound();

  /* Seuls les deux intéressés écrivent dans le fil. */
  if (demande.mentorUserId !== utilisateur.id && demande.demandeurUserId !== utilisateur.id) {
    notFound();
  }

  const verdict = await verifierDebit("message-mentorat", { max: 20, fenetreMs: 10 * 60 * 1000 });
  if (!verdict.autorise) redirect(`/espace/mentorat/${demandeId}?erreur=debit`);

  await db.insert(messagesMentorat).values({
    demandeId,
    auteurUserId: utilisateur.id,
    corps,
  });

  revalidatePath(`/espace/mentorat/${demandeId}`);
  redirect(`/espace/mentorat/${demandeId}`);
}

/* --- Créneaux du mentor ---------------------------------------------------- */

export async function ouvrirCreneau(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();
  const quand = texte(donnees.get("quand"), 40);
  const duree = Number(texte(donnees.get("duree"), 5)) || 45;
  const format = texte(donnees.get("format"), 20);

  const debut = new Date(quand);
  if (Number.isNaN(debut.getTime()) || debut.getTime() < Date.now()) {
    redirect("/espace/mentorat?erreur=creneau_date");
  }

  const mien = await estMentor(utilisateur.id);
  if (!mien) notFound();

  await db.insert(creneaux).values({
    mentorId: mien.id,
    debutAt: debut,
    dureeMinutes: Math.min(240, Math.max(15, duree)),
    format: format === "presentiel" || format === "hybride" ? format : "en_ligne",
  });

  revalidatePath("/espace/mentorat");
  redirect("/espace/mentorat?creneau=1");
}

export async function retirerCreneau(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();
  const creneauId = texte(donnees.get("creneau"), 60);

  const mien = await estMentor(utilisateur.id);
  if (!mien) notFound();

  /* La condition porte aussi sur le mentor : sans elle, l'identifiant d'un
     créneau suffirait à supprimer celui d'un autre. */
  await db
    .delete(creneaux)
    .where(and(eq(creneaux.id, creneauId), eq(creneaux.mentorId, mien.id), eq(creneaux.pris, false)));

  revalidatePath("/espace/mentorat");
  redirect("/espace/mentorat");
}
