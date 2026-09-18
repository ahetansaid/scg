/* ============================================================================
   VISUELS TEMPORAIRES
   Ces photos viennent d'Unsplash (licence libre, hébergement Unsplash). Elles
   tiennent la place des photos de SCG en attendant les vraies : remplacez les
   valeurs ici, rien d'autre ne change. Choisies pour montrer des cadres et
   dirigeants africains en situation professionnelle.
   ============================================================================ */

/* On demande à Unsplash une image déjà réduite : l'optimiseur de Next
   rapatrie la source à chaque première demande, et un original de 3 Mo
   dépasse son délai. À 1600 px de large, on reste sous 300 Ko. */
const U = (id: string, largeur = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${largeur}&q=80`;

export const PHOTOS = {
  /* Femme cadre, lunettes, bureau lumineux, sourire franc. */
  hero: U("photo-1573497161161-c3e73707e25c"),
  dirigeant: U("photo-1531384441138-2736e62e0919"),
  dirigeante: U("photo-1531123897727-8f129e1688ce"),
  /* Intervenant devant une salle. */
  formation: U("photo-1591115765373-5207764f72e7"),
  /* Deux personnes penchées sur un ordinateur. */
  atelier: U("photo-1560250056-07ba64664864"),
  /* Une équipe alignée dans un open space. */
  equipe: U("photo-1573496774426-fe3db3dd1731"),
  /* Deux femmes en discussion à une table, près d'une baie vitrée. */
  reunion: U("photo-1573497491208-6b1acb260507"),
  /* Cadre à son bureau, mur à motifs. */
  conference: U("photo-1573497701175-00c200fd57f0"),
} as const;

/* Vignette par domaine, quand un programme n'a pas encore sa propre image. */
export const PHOTO_DOMAINE: Record<string, string> = {
  Finance: U("photo-1521791136064-7986c2920216"),
  Stratégie: U("photo-1556761175-4b46a572b786"),
  "Secteur public": U("photo-1591115765373-5207764f72e7"),
  Digital: U("photo-1573164713714-d95e436ab8d6"),
  "Ressources humaines": U("photo-1573496774426-fe3db3dd1731"),
  Entrepreneuriat: U("photo-1560250056-07ba64664864"),
};

/* Portraits de remplacement pour les mentors sans photo. Tirés à tour de
   rôle, de façon stable, pour qu'un même mentor garde le même visage. */
export const PORTRAITS = [
  U("photo-1531384441138-2736e62e0919", 600),
  U("photo-1573497019418-b400bb3ab074", 600),
  U("photo-1531123897727-8f129e1688ce", 600),
  U("photo-1589156280159-27698a70f29e", 600),
];

export function photoProgramme(domaine: string, imageUrl?: string | null) {
  return imageUrl || PHOTO_DOMAINE[domaine] || PHOTOS.formation;
}

export function portrait(cle: string, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl;
  let h = 0;
  for (const c of cle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PORTRAITS[h % PORTRAITS.length]!;
}
