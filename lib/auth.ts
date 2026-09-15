import { randomBytes, createHash, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "./db";
import { jetons, profiles, users } from "./db/schema";

/* ============================================================================
   Comptes et sessions.

   Pas de dépendance externe : scrypt est dans le cœur de Node, et une session
   par jeton opaque en base est plus simple à auditer qu'un JWT qu'on ne peut
   pas révoquer. Le jeton n'est jamais stocké en clair – seule son empreinte
   SHA-256 est en base, donc une fuite de la table ne donne aucune session.
   ============================================================================ */

const scrypt = promisify(scryptCb) as (
  motDePasse: string,
  sel: Buffer,
  longueur: number,
) => Promise<Buffer>;

const COOKIE = "scg_session";
const DUREE_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const LONGUEUR_CLE = 64;

export const ROLES = ["visiteur", "membre", "mentor", "formateur", "admin"] as const;
export type Role = (typeof ROLES)[number];

/* --- Mots de passe -------------------------------------------------------- */

export async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const cle = await scrypt(motDePasse, sel, LONGUEUR_CLE);
  return `scrypt$${sel.toString("base64")}$${cle.toString("base64")}`;
}

export async function verifierMotDePasse(motDePasse: string, stocke: string): Promise<boolean> {
  const [algo, selB64, cleB64] = stocke.split("$");
  if (algo !== "scrypt" || !selB64 || !cleB64) return false;

  const attendue = Buffer.from(cleB64, "base64");
  const calculee = await scrypt(motDePasse, Buffer.from(selB64, "base64"), attendue.length);

  /* Comparaison à temps constant : une comparaison naïve laisse fuiter le
     nombre d'octets corrects par la durée de la réponse. */
  return attendue.length === calculee.length && timingSafeEqual(attendue, calculee);
}

/* --- Sessions ------------------------------------------------------------- */

const empreinte = (jeton: string) => createHash("sha256").update(jeton).digest("hex");

export async function ouvrirSession(userId: string) {
  const jeton = randomBytes(32).toString("base64url");
  const expire = new Date(Date.now() + DUREE_SESSION_MS);

  await db.insert(jetons).values({
    userId,
    nature: "session",
    empreinte: empreinte(jeton),
    expireAt: expire,
  });

  const boite = await cookies();
  boite.set(COOKIE, jeton, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expire,
  });
}

export async function fermerSession() {
  const boite = await cookies();
  const jeton = boite.get(COOKIE)?.value;
  if (jeton) {
    /* On consomme au lieu de supprimer : la ligne reste pour l'audit, mais
       le jeton ne vaut plus rien. */
    await db
      .update(jetons)
      .set({ consommeAt: new Date() })
      .where(eq(jetons.empreinte, empreinte(jeton)));
  }
  boite.delete(COOKIE);
}

export type Utilisateur = {
  id: string;
  email: string;
  role: Role;
  prenom: string;
  nom: string;
  structure: string;
};

/* Lit la session courante. Renvoie null plutôt que de lever : la plupart des
   pages doivent savoir « personne » sans que ce soit une erreur. */
export async function utilisateurCourant(): Promise<Utilisateur | null> {
  const jeton = (await cookies()).get(COOKIE)?.value;
  if (!jeton) return null;

  const lignes = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      actif: users.actif,
      prenom: profiles.prenom,
      nom: profiles.nom,
      structure: profiles.structure,
    })
    .from(jetons)
    .innerJoin(users, eq(users.id, jetons.userId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(jetons.empreinte, empreinte(jeton)),
        eq(jetons.nature, "session"),
        isNull(jetons.consommeAt),
        gt(jetons.expireAt, new Date()),
      ),
    )
    .limit(1);

  const u = lignes[0];
  if (!u || !u.actif) return null;

  return {
    id: u.id,
    email: u.email,
    role: u.role,
    prenom: u.prenom ?? "",
    nom: u.nom ?? "",
    structure: u.structure ?? "",
  };
}

/* --- Autorisation ---------------------------------------------------------
   L'autorisation se contrôle ici, côté serveur, à chaque accès. Le `proxy`
   ne fait que rediriger tôt pour le confort : il ne protège rien à lui seul,
   parce qu'il ne voit pas les Server Actions.                              */

/* Un refus d'accès n'est pas une panne : le laisser remonter en exception
   produirait une erreur 500, qui noierait les vraies pannes dans le journal
   et afficherait une page d'erreur au visiteur. On sort par les mécanismes
   que Next comprend. */

export async function exigerUtilisateur(suite?: string): Promise<Utilisateur> {
  const u = await utilisateurCourant();
  if (!u) {
    redirect(suite ? `/connexion?suite=${encodeURIComponent(suite)}` : "/connexion");
  }
  return u;
}

export async function exigerRole(...roles: Role[]): Promise<Utilisateur> {
  const u = await exigerUtilisateur();
  /* Un rôle insuffisant donne un 404, pas un 403 : inutile de confirmer à
     quelqu'un qui n'y a pas droit que la page existe. */
  if (!roles.includes(u.role)) notFound();
  return u;
}

export const estAdministration = (role: Role) => role === "admin" || role === "formateur";

/* --- Création de compte --------------------------------------------------- */

export async function creerCompte(donnees: {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone?: string;
  structure?: string;
  fonction?: string;
}): Promise<{ ok: true; userId: string } | { ok: false; raison: "email_pris" }> {
  const email = donnees.email.trim().toLowerCase();

  const existant = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existant.length > 0) return { ok: false, raison: "email_pris" };

  const [cree] = await db
    .insert(users)
    .values({ email, motDePasseHash: await hacher(donnees.motDePasse), role: "membre" })
    .returning({ id: users.id });

  if (!cree) throw new Error("Création du compte sans retour d'identifiant.");

  await db.insert(profiles).values({
    userId: cree.id,
    prenom: donnees.prenom.trim(),
    nom: donnees.nom.trim(),
    telephone: donnees.telephone?.trim() ?? "",
    structure: donnees.structure?.trim() ?? "",
    fonction: donnees.fonction?.trim() ?? "",
  });

  return { ok: true, userId: cree.id };
}

export async function authentifier(
  email: string,
  motDePasse: string,
): Promise<{ ok: true; userId: string } | { ok: false }> {
  const lignes = await db
    .select({ id: users.id, hash: users.motDePasseHash, actif: users.actif })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  const u = lignes[0];

  /* Même chemin de calcul que l'utilisateur existe ou non : sans ce hachage
     à vide, la durée de la réponse révèle quelles adresses ont un compte. */
  if (!u) {
    await hacher(motDePasse);
    return { ok: false };
  }

  if (!u.actif) return { ok: false };
  return (await verifierMotDePasse(motDePasse, u.hash)) ? { ok: true, userId: u.id } : { ok: false };
}
