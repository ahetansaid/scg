/* ============================================================================
   Vocabulaire du produit.
   Ce ne sont pas des données mais les libellés des énumérations de la base :
   ils appartiennent au code, pas au contenu.
   ============================================================================ */

export const DOMAINES = [
  "Finance",
  "Stratégie",
  "Secteur public",
  "Digital",
  "Ressources humaines",
  "Entrepreneuriat",
] as const;

export type Nature = "masterclass" | "formation" | "certification";
export type Format = "presentiel" | "hybride" | "en_ligne";
export type StatutPublication = "brouillon" | "publie" | "archive";

export const NATURES: Nature[] = ["masterclass", "formation", "certification"];
export const FORMATS: Format[] = ["presentiel", "hybride", "en_ligne"];

export const LIBELLE_NATURE: Record<Nature, string> = {
  masterclass: "Masterclass",
  formation: "Formation",
  certification: "Certification",
};

export const LIBELLE_FORMAT: Record<Format, string> = {
  presentiel: "Présentiel",
  hybride: "Hybride",
  en_ligne: "En ligne",
};

export const LIBELLE_STATUT_DEMANDE = {
  envoyee: "Envoyée",
  acceptee: "Acceptée",
  declinee: "Déclinée",
  close: "Close",
} as const;

export const LIBELLE_ROLE = {
  visiteur: "Visiteur",
  membre: "Membre",
  mentor: "Mentor",
  formateur: "Formateur",
  admin: "Administrateur",
} as const;

/* --- Mise en forme -------------------------------------------------------- */

const jourMois = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });

export const formatLong = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDateHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export const dateCourte = (d: Date) => jourMois.format(d);

/** Les montants s'écrivent avec des groupes de trois : 250 000 FCFA. */
export function montant(fcfa: number) {
  return new Intl.NumberFormat("fr-FR").format(fcfa);
}

export function pluriel(n: number, singulier: string, pluriel_?: string) {
  return n > 1 ? (pluriel_ ?? `${singulier}s`) : singulier;
}
