"use server";

import { redirect } from "next/navigation";

import { verifierDebit } from "@/lib/limitation";

/* ============================================================================
   Envoi du formulaire de contact.
   Pas de JavaScript requis : l'action redirige avec le résultat dans l'URL,
   donc la page reste utilisable si le script ne part pas.
   ============================================================================ */

const MAX = { nom: 120, email: 180, structure: 160, sujet: 160, message: 4000 } as const;

function propre(valeur: FormDataEntryValue | null, maxi: number) {
  return typeof valeur === "string" ? valeur.trim().slice(0, maxi) : "";
}

/* Validation volontairement permissive sur la forme de l'adresse : la seule
   preuve qu'une adresse existe est un message qui arrive. On écarte ce qui
   ne peut manifestement pas en être une. */
function emailPlausible(valeur: string) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(valeur);
}

export async function envoyerMessage(donnees: FormData) {
  const retour = (params: Record<string, string>) =>
    redirect(`/contact?${new URLSearchParams(params).toString()}`);

  /* Piège à robots : un champ que seul un automate remplit. On répond comme
     si tout s'était bien passé – inutile de lui apprendre qu'il est repéré. */
  if (propre(donnees.get("site"), 50) !== "") retour({ envoye: "1" });

  const nom = propre(donnees.get("nom"), MAX.nom);
  const email = propre(donnees.get("email"), MAX.email);
  const structure = propre(donnees.get("structure"), MAX.structure);
  const sujet = propre(donnees.get("sujet"), MAX.sujet);
  const message = propre(donnees.get("message"), MAX.message);

  if (nom.length < 2) retour({ erreur: "nom", sujet });
  if (!emailPlausible(email)) retour({ erreur: "email", sujet });
  if (message.length < 20) retour({ erreur: "message", sujet });

  const verdict = await verifierDebit("contact", { max: 3, fenetreMs: 15 * 60 * 1000 });
  if (!verdict.autorise) {
    retour({ erreur: "debit", minutes: String(Math.ceil(verdict.secondesAvant / 60)), sujet });
  }

  /* L'envoi effectif arrive à l'étape 3, avec le SMTP du domaine SCG et sa
     file d'attente. D'ici là le message est journalisé côté serveur : rien
     n'est perdu, et la limitation de débit est déjà en place. */
  console.info("[contact] nouveau message", { nom, email, structure, sujet, taille: message.length });

  retour({ envoye: "1" });
}
