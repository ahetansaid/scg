import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Base = ReturnType<typeof drizzle<typeof schema>>;

/* Un seul pool par processus. En développement, Next recharge ce module à
   chaque modification : sans ce cache sur globalThis, on ouvrirait une
   nouvelle connexion à chaque sauvegarde jusqu'à saturer Postgres. */
const global_ = globalThis as unknown as {
  __scgSql?: ReturnType<typeof postgres>;
  __scgDb?: Base;
};

function connecter(): Base {
  if (global_.__scgDb) return global_.__scgDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL est absent. Copiez .env.example vers .env.local et renseignez-le.",
    );
  }

  const sql =
    global_.__scgSql ??
    postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idle_timeout: 20,
      connect_timeout: 10,
    });

  const base = drizzle(sql, { schema });

  if (process.env.NODE_ENV !== "production") {
    global_.__scgSql = sql;
    global_.__scgDb = base;
  }
  return base;
}

/* La connexion ne s'ouvre qu'à la première requête réelle. Importer ce module
   depuis une page entièrement statique ne doit rien coûter — et ne doit pas
   faire échouer le build quand DATABASE_URL n'est pas dans l'environnement. */
export const db = new Proxy({} as Base, {
  get(_cible, propriete, recepteur) {
    return Reflect.get(connecter(), propriete, recepteur);
  },
});

export { schema };
