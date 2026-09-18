/* ============================================================================
   VISUELS TEMPORAIRES
   Photos et vidéos libres de droits (licence Pexels : usage commercial
   autorisé, sans attribution). Elles tiennent la place des visuels de SCG en
   attendant les vrais : remplacez les valeurs ici, rien d'autre ne change.
   Choisies pour montrer des cadres et dirigeants africains en situation
   professionnelle, avec une lumière et un cadrage cohérents.

   Les vidéos sont réencodées en local (public/video, sans son, 720p et
   540p) pour ne pas dépendre d'un hébergeur tiers ni charger 7 Mo.
   ============================================================================ */

/* Pexels sert l'image déjà réduite et compressée. */
const P = (id: number, largeur = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${largeur}`;

export const PHOTOS = {
  /* Dirigeante souriante à son bureau, chemise blanche. */
  hero: P(36551042),
  dirigeante: P(36551042),
  /* Cadre, chemise blanche, sourire franc. */
  dirigeant: P(9301461),
  /* Formateur debout auprès de participants. */
  formation: P(9301316),
  /* Trois personnes penchées sur un écran. */
  atelier: P(9489091),
  /* Équipe debout dans un bureau de Lagos. */
  equipe: P(30688593),
  /* Réunion vue de haut, Lagos. */
  reunion: P(30688596),
  /* Deux hommes en réunion devant un tableau. */
  conference: P(9301745),
  /* Femme d'affaires, bras croisés, fond uni. */
  portrait: P(38670854),
} as const;

/* Vidéos de fond, servies depuis public/. */
export const VIDEOS = {
  hero: { src: "/video/hero.mp4", srcMobile: "/video/hero-mobile.mp4", affiche: "/video/hero.jpg" },
  formation: { src: "/video/formation.mp4", affiche: "/video/formation.jpg" },
} as const;

/* Vignette par domaine, quand un programme n'a pas encore sa propre image. */
export const PHOTO_DOMAINE: Record<string, string> = {
  Finance: P(5717310),
  Stratégie: P(9301745),
  "Secteur public": P(30688592),
  Digital: P(9301502),
  "Ressources humaines": P(7446593),
  Entrepreneuriat: P(30690402),
};

/* Portraits de remplacement pour les mentors sans photo. Tirés à tour de
   rôle, de façon stable, pour qu'un même mentor garde le même visage. */
export const PORTRAITS = [P(9301461, 600), P(36551042, 600), P(5060564, 600), P(20209020, 600)];

export function photoProgramme(domaine: string, imageUrl?: string | null) {
  return imageUrl || PHOTO_DOMAINE[domaine] || PHOTOS.formation;
}

export function portrait(cle: string, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl;
  let h = 0;
  for (const c of cle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PORTRAITS[h % PORTRAITS.length]!;
}
