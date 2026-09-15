"use server";

import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { exigerUtilisateur } from "@/lib/auth";
import { db } from "@/lib/db";
import { favoris, inscriptions, journalAudit, profiles, programmes, sessions } from "@/lib/db/schema";
import { verifierDebit } from "@/lib/limitation";

const texte = (v: FormDataEntryValue | null, maxi: number) =>
  typeof v === "string" ? v.trim().slice(0, maxi) : "";

/* ============================================================================
   Actions de l'espace membre.
   ============================================================================ */

export async function sInscrireALaSession(donnees: FormData) {
  const reference = texte(donnees.get("reference"), 80);
  const utilisateur = await exigerUtilisateur(`/inscription/${reference}`);

  const echec = (raison: string) => redirect(`/inscription/${reference}?erreur=${raison}`);

  const verdict = await verifierDebit("inscription", { max: 10, fenetreMs: 30 * 60 * 1000 });
  if (!verdict.autorise) return echec("debit");

  /* Lecture et écriture dans une même transaction, avec verrou sur la ligne
     de session : sans lui, deux demandes simultanées lisent toutes deux « il
     reste une place » et l'écrivent toutes les deux. */
  const resultat = await db.transaction(async (tx) => {
    const lignes = await tx
      .select({
        id: sessions.id,
        capacite: sessions.capacite,
        cloture: sessions.clotureAt,
        statut: sessions.statut,
        programmeStatut: programmes.statut,
      })
      .from(sessions)
      .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
      .where(eq(sessions.reference, reference))
      .for("update", { of: sessions })
      .limit(1);

    const session = lignes[0];
    if (!session) return "introuvable";
    /* Un programme non publié ne se réserve pas, même si sa session est
       marquée ouverte. */
    if (session.programmeStatut !== "publie") return "introuvable";
    if (session.statut !== "ouverte") return "fermee";
    if (session.cloture.getTime() < Date.now()) return "close";

    const deja = await tx
      .select({ id: inscriptions.id })
      .from(inscriptions)
      .where(and(eq(inscriptions.userId, utilisateur.id), eq(inscriptions.sessionId, session.id)))
      .limit(1);
    if (deja.length > 0) return "deja";

    const [pris] = await tx
      .select({ n: count() })
      .from(inscriptions)
      .where(
        and(
          eq(inscriptions.sessionId, session.id),
          inArray(inscriptions.statut, ["confirmee", "terminee"]),
        ),
      );
    if (Number(pris?.n ?? 0) >= session.capacite) return "complet";

    /* La demande part « en attente » : c'est l'administration qui confirme,
       après échange sur les modalités de règlement. */
    await tx.insert(inscriptions).values({
      sessionId: session.id,
      userId: utilisateur.id,
      statut: "en_attente",
    });
    return "ok";
  });

  if (resultat !== "ok") return echec(resultat);

  revalidatePath("/espace");
  redirect("/espace/programmes?demande=1");
}

export async function annulerMonInscription(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();
  const inscriptionId = texte(donnees.get("inscription"), 60);

  /* La condition porte sur l'utilisateur : sans elle, un identifiant suffirait
     à annuler l'inscription de quelqu'un d'autre. */
  await db
    .update(inscriptions)
    .set({ statut: "annulee" })
    .where(and(eq(inscriptions.id, inscriptionId), eq(inscriptions.userId, utilisateur.id)));

  await db.insert(journalAudit).values({
    acteurUserId: utilisateur.id,
    action: "inscription.annulee_par_membre",
    cibleTable: "inscriptions",
    cibleId: inscriptionId,
  });

  /* Une place rendue redevient disponible publiquement : les pages qui
     affichent la cohorte doivent le refléter tout de suite. */
  revalidatePath("/espace/programmes");
  revalidatePath("/");
  revalidatePath("/programmes");

  redirect("/espace/programmes?annulee=1");
}

/* --- Favoris --------------------------------------------------------------- */

const NATURES_FAVORI = ["programme", "session", "mentor", "opportunite", "publication"] as const;
type NatureFavori = (typeof NATURES_FAVORI)[number];

export async function basculerFavori(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();
  const nature = texte(donnees.get("nature"), 30) as NatureFavori;
  const cibleId = texte(donnees.get("cible"), 60);
  const retour = texte(donnees.get("retour"), 300);

  if (!NATURES_FAVORI.includes(nature) || !cibleId) notFound();

  const existant = await db
    .select({ id: favoris.id })
    .from(favoris)
    .where(
      and(eq(favoris.userId, utilisateur.id), eq(favoris.nature, nature), eq(favoris.cibleId, cibleId)),
    )
    .limit(1);

  if (existant[0]) {
    await db.delete(favoris).where(eq(favoris.id, existant[0].id));
  } else {
    await db.insert(favoris).values({ userId: utilisateur.id, nature, cibleId });
  }

  const destination = retour.startsWith("/") && !retour.startsWith("//") ? retour : "/espace/favoris";
  revalidatePath(destination);
  redirect(destination);
}

/* --- Profil ---------------------------------------------------------------- */

export async function enregistrerMonProfil(donnees: FormData) {
  const utilisateur = await exigerUtilisateur();

  const prenom = texte(donnees.get("prenom"), 120);
  const nom = texte(donnees.get("nom"), 120);
  if (prenom.length < 2 || nom.length < 2) redirect("/espace/profil?erreur=identite");

  await db
    .update(profiles)
    .set({
      prenom,
      nom,
      telephone: texte(donnees.get("telephone"), 40),
      ville: texte(donnees.get("ville"), 120),
      structure: texte(donnees.get("structure"), 160),
      fonction: texte(donnees.get("fonction"), 160),
      bio: texte(donnees.get("bio"), 2000),
      majAt: new Date(),
    })
    .where(eq(profiles.userId, utilisateur.id));

  revalidatePath("/espace/profil");
  redirect("/espace/profil?enregistre=1");
}
