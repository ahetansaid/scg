import { defineConfig } from "drizzle-kit";

/* drizzle-kit tourne hors du serveur Next : il ne bénéficie pas du chargement
   automatique de .env.local. `loadEnvFile` est natif depuis Node 20.12, donc
   pas de dépendance supplémentaire pour ça. */
try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : on se rabat sur l'environnement du shell (CI, VPS).
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL est absent. Copiez .env.example vers .env.local et renseignez-le.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  /* Pas d'option `casing` : chaque colonne composée porte son nom SQL
     explicite dans le schéma, donc migrations et runtime ne peuvent pas
     diverger sur une convention implicite. */
  verbose: true,
  strict: true,
});
