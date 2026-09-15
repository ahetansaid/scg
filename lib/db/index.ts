import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Base = ReturnType<typeof drizzle<typeof schema>>;

/* Un seul pool par processus, quel que soit l'environnement.

   En développement, Next recharge ce module à chaque modification : le cache
   vit sur globalThis pour survivre au rechargement. En production il vit ici,
   au niveau du module – ce qui persiste entre deux invocations d'une même
   instance serverless. Ne rien mettre en cache en production ouvrirait un
   pool à chaque requête et épuiserait Postgres. */
const global_ = globalThis as unknown as { __scgDb?: Base };
let cache: Base | undefined;

function connecter(): Base {
  const existant = process.env.NODE_ENV === "production" ? cache : global_.__scgDb;
  if (existant) return existant;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL est absent. Copiez .env.example vers .env.local et renseignez-le.",
    );
  }

  /* Derrière un pooler en mode transaction (Neon, PgBouncer), les requêtes
     préparées ne sont pas supportées : la connexion change entre la
     préparation et l'exécution. Neon signale ses hôtes poolés par `-pooler`. */
  const derrierePooler =
    process.env.DATABASE_PREPARE === "false" || /-pooler\./.test(new URL(url).hostname);

  const sql = postgres(url, {
    /* En serverless, chaque instance ne sert qu'une requête à la fois : un
       pool de 10 n'apporte rien et multiplie les connexions ouvertes. */
    max: Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 10)),
    prepare: !derrierePooler,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const base = drizzle(sql, { schema });

  if (process.env.NODE_ENV === "production") cache = base;
  else global_.__scgDb = base;

  return base;
}

/* La connexion ne s'ouvre qu'à la première requête réelle. Importer ce module
   depuis une page entièrement statique ne doit rien coûter – et ne doit pas
   faire échouer le build quand DATABASE_URL n'est pas dans l'environnement. */
export const db = new Proxy({} as Base, {
  get(_cible, propriete) {
    const base = connecter();
    const valeur = Reflect.get(base, propriete);
    /* Les méthodes sont liées à l'instance réelle, pas au proxy : Drizzle
       utilise des champs privés de classe, auxquels un `this` mandataire
       n'a pas accès. Sans ce liage, `db.transaction()` lève. */
    return typeof valeur === "function" ? valeur.bind(base) : valeur;
  },
});

export { schema };
