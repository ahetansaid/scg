import { eq } from "drizzle-orm";

import { creerCompte } from "../lib/auth";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { ROLES, type Role } from "../lib/auth";

/* ============================================================================
   Création d'un compte en ligne de commande.

   Sert à créer le tout premier administrateur – il n'y a pas d'autre porte
   d'entrée, et c'est voulu : aucune route publique ne doit pouvoir fabriquer
   un compte privilégié. Ensuite, l'administration se fait depuis le
   back-office.

   Les valeurs passent par l'environnement plutôt que par des drapeaux : un
   mot de passe en ligne de commande atterrit dans l'historique du shell et
   reste visible dans la liste des processus.

   Usage (PowerShell) :
     $env:SCG_EMAIL="a@b.bj"; $env:SCG_MOT_DE_PASSE="…"; $env:SCG_ROLE="admin"
     npm run compte:creer
   ============================================================================ */

process.loadEnvFile(".env.local");

/* Les drapeaux restent acceptés en secours, mais l'environnement l'emporte. */
function argument(nom: string): string | undefined {
  const prefixe = `--${nom}=`;
  return process.argv.find((a) => a.startsWith(prefixe))?.slice(prefixe.length);
}

async function principal() {
  const email = process.env.SCG_EMAIL ?? argument("email");
  const motDePasse = process.env.SCG_MOT_DE_PASSE ?? argument("mot-de-passe");
  const role = (process.env.SCG_ROLE ?? argument("role") ?? "admin") as Role;
  const prenom = process.env.SCG_PRENOM ?? argument("prenom") ?? "";
  const nom = process.env.SCG_NOM ?? argument("nom") ?? "";

  if (!email || !motDePasse) {
    throw new Error(
      "Renseignez SCG_EMAIL et SCG_MOT_DE_PASSE dans l'environnement, puis relancez " +
        "`npm run compte:creer`. SCG_ROLE, SCG_PRENOM et SCG_NOM sont facultatifs.",
    );
  }
  if (motDePasse.length < 12) {
    throw new Error("Le mot de passe fait moins de douze caractères. Choisissez-en un plus long.");
  }
  if (!ROLES.includes(role)) {
    throw new Error(`Rôle inconnu : ${role}. Attendu : ${ROLES.join(", ")}.`);
  }

  const resultat = await creerCompte({ email, motDePasse, prenom, nom });
  if (!resultat.ok) {
    throw new Error(`Un compte existe déjà pour ${email}.`);
  }

  /* `creerCompte` crée toujours un membre : c'est la seule chose qu'une
     inscription publique doit pouvoir produire. L'élévation se fait ici. */
  if (role !== "membre") {
    await db.update(users).set({ role }).where(eq(users.id, resultat.userId));
  }

  console.info(`Compte créé : ${email} (${role}).`);
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
