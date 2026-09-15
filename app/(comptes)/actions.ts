"use server";

import { redirect } from "next/navigation";

import { authentifier, creerCompte, fermerSession, ouvrirSession } from "@/lib/auth";
import { verifierDebit } from "@/lib/limitation";

const texte = (v: FormDataEntryValue | null, maxi: number) =>
  typeof v === "string" ? v.trim().slice(0, maxi) : "";

/* Une destination venant du client ne doit jamais pouvoir envoyer ailleurs
   que sur ce site. On n'accepte qu'un chemin absolu simple : pas de `//hote`,
   pas de schéma. */
function destinationSure(brut: string): string {
  if (!brut.startsWith("/") || brut.startsWith("//")) return "/espace";
  return brut;
}

export async function seConnecter(donnees: FormData) {
  const email = texte(donnees.get("email"), 180);
  const motDePasse = texte(donnees.get("motDePasse"), 200);
  const suite = destinationSure(texte(donnees.get("suite"), 300));

  /* `return echec(...)` plutôt qu'un simple appel : c'est ce qui rend la
     sortie visible pour le compilateur comme pour le lecteur. */
  const echec = (raison: string) =>
    redirect(`/connexion?erreur=${raison}&suite=${encodeURIComponent(suite)}`);

  if (!email || !motDePasse) return echec("champs");

  /* La limitation porte sur l'adresse appelante, pas sur le compte visé :
     sinon un attaquant verrouille le compte d'autrui en échouant exprès. */
  const verdict = await verifierDebit("connexion", { max: 10, fenetreMs: 10 * 60 * 1000 });
  if (!verdict.autorise) return echec("debit");

  const resultat = await authentifier(email, motDePasse);
  /* Un seul message pour « adresse inconnue » et « mot de passe faux » :
     distinguer les deux transforme le formulaire en annuaire de comptes. */
  if (!resultat.ok) return echec("identifiants");

  await ouvrirSession(resultat.userId);
  redirect(suite);
}

export async function creerMonCompte(donnees: FormData) {
  const email = texte(donnees.get("email"), 180);
  const motDePasse = texte(donnees.get("motDePasse"), 200);
  const prenom = texte(donnees.get("prenom"), 120);
  const nom = texte(donnees.get("nom"), 120);
  const telephone = texte(donnees.get("telephone"), 40);
  const structure = texte(donnees.get("structure"), 160);
  const fonction = texte(donnees.get("fonction"), 160);

  const echec = (raison: string) => redirect(`/creer-un-compte?erreur=${raison}`);

  /* Piège à robots : on répond comme si tout s'était bien passé. */
  if (texte(donnees.get("site"), 50) !== "") redirect("/espace");

  if (prenom.length < 2 || nom.length < 2) return echec("identite");
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return echec("email");
  if (motDePasse.length < 12) return echec("motdepasse");

  const verdict = await verifierDebit("creation-compte", { max: 3, fenetreMs: 30 * 60 * 1000 });
  if (!verdict.autorise) return echec("debit");

  const resultat = await creerCompte({
    email,
    motDePasse,
    prenom,
    nom,
    telephone,
    structure,
    fonction,
  });
  if (!resultat.ok) return echec("email_pris");

  await ouvrirSession(resultat.userId);
  redirect("/espace");
}

export async function seDeconnecter() {
  await fermerSession();
  redirect("/");
}
