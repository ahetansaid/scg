import type { MetadataRoute } from "next";

/* Manifeste d'application : nom, couleurs et icône pour l'écran d'accueil
   des mobiles et l'installation en raccourci. Les icônes app/icon.png et
   app/apple-icon.png sont servies par Next à partir du dossier app/. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SCG – Strategic Consulting Group",
    short_name: "SCG",
    description:
      "Masterclasses, formations certifiantes et mentorat pour les dirigeants, cadres publics et entrepreneurs. Cotonou, Bénin.",
    start_url: "/",
    display: "standalone",
    lang: "fr",
    background_color: "#ffffff",
    theme_color: "#0b2e5b",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
