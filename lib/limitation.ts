import { eq, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "./db";
import { limitationsDebit } from "./db/schema";

/* ============================================================================
   Limitation de débit des formulaires publics.

   Sans elle, un formulaire de contact suffit à brûler le quota d'envoi du
   domaine en une nuit – et à faire classer le domaine comme émetteur de
   spam, ce qui se répare en semaines.

   Le seau vit en base, pas en mémoire : en serverless, deux requêtes
   successives peuvent tomber sur deux instances qui ne partagent rien. Le
   verrou de ligne sérialise les appels concurrents sur une même clé.
   ============================================================================ */

export async function adresseAppelante(): Promise<string> {
  const h = await headers();
  /* Derrière un mandataire, la vraie adresse est en tête de x-forwarded-for.
     On ne prend que le premier segment : le reste est fourni par le client et
     ne vaut rien. */
  const transmis = h.get("x-forwarded-for");
  if (transmis) return transmis.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "inconnue";
}

export type Verdict = { autorise: true } | { autorise: false; secondesAvant: number };

export async function verifierDebit(
  portee: string,
  { max = 3, fenetreMs = 15 * 60 * 1000 } = {},
): Promise<Verdict> {
  const cle = `${portee}:${await adresseAppelante()}`;

  return db.transaction(async (tx) => {
    /* Création silencieuse si la clé n'existe pas encore, puis lecture sous
       verrou : deux premiers appels simultanés ne créent pas deux lignes. */
    await tx
      .insert(limitationsDebit)
      .values({ cle, jetons: max, dernierAt: new Date() })
      .onConflictDoNothing();

    const [seau] = await tx
      .select()
      .from(limitationsDebit)
      .where(eq(limitationsDebit.cle, cle))
      .for("update")
      .limit(1);

    const maintenant = Date.now();
    /* Recharge continue plutôt que par paliers : après la moitié de la
       fenêtre, la moitié des jetons est revenue. Un utilisateur légitime qui
       se trompe une fois n'attend pas la fenêtre entière. */
    const ecoule = seau ? maintenant - seau.dernierAt.getTime() : 0;
    const recharge = Math.min(max, (seau?.jetons ?? max) + (ecoule / fenetreMs) * max);
    const autorise = recharge >= 1;
    const restant = autorise ? recharge - 1 : recharge;

    await tx
      .update(limitationsDebit)
      .set({ jetons: restant, dernierAt: new Date(maintenant) })
      .where(eq(limitationsDebit.cle, cle));

    /* Purge opportuniste des seaux morts, une fois sur cent : sans elle la
       table grossit indéfiniment avec les adresses de passage. */
    if (Math.random() < 0.01) {
      await tx
        .delete(limitationsDebit)
        .where(lt(limitationsDebit.dernierAt, sql`now() - interval '1 day'`));
    }

    if (autorise) return { autorise: true };
    return { autorise: false, secondesAvant: Math.ceil(((1 - recharge) * fenetreMs) / 1000) };
  });
}
