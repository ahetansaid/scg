import type { NextConfig } from "next";

/* En-têtes de sécurité posés par l'application elle-même, pour qu'ils
   suivent le déploiement quel que soit l'hébergeur.

   Pas de Content-Security-Policy ici : Next injecte des scripts inline que
   seule une politique à nonce autorise proprement, et une politique mal
   réglée rend le site blanc. Elle viendra dans un second temps, avec des
   tests.

   HSTS n'est correct que si tout le trafic est déjà en HTTPS – c'est le cas
   sur Vercel, qui redirige HTTP de lui-même. */
const ENTETES = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  /* Inutile d'annoncer le framework à chaque réponse. */
  poweredByHeader: false,

  async headers() {
    return [{ source: "/(.*)", headers: ENTETES }];
  },
};

export default nextConfig;
