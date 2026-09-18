/* ============================================================================
   MOTIF – LA COHORTE
   Un carré, un siège. On lit « il reste trois places » sans chiffre.
   Sur le site public : pris ou libre. En back-office, la même rangée se
   colore par statut.
   ============================================================================ */

export type EtatSiege = "libre" | "pris" | "solde" | "acompte" | "relance";

const REMPLISSAGE: Record<EtatSiege, string> = {
  libre: "bg-transparent shadow-[inset_0_0_0_1.5px_var(--color-ligne)]",
  pris: "bg-canard",
  solde: "bg-vert",
  acompte: "bg-soleil",
  relance: "bg-terre",
};

const LIBELLE: Record<EtatSiege, string> = {
  libre: "libre",
  pris: "pris",
  solde: "soldé",
  acompte: "acompte versé",
  relance: "en relance",
};

const TAILLE = {
  sm: "size-[9px] rounded-[3px]",
  md: "size-[13px] rounded-[4px]",
} as const;

type Props = {
  capacite: number;
  sieges?: EtatSiege[];
  pris?: number;
  /** Conservé pour compatibilité ; le rendu est identique sur tous les fonds. */
  fond?: "papier" | "nuit";
  taille?: keyof typeof TAILLE;
  compteur?: boolean;
  className?: string;
};

export function Cohorte({
  capacite,
  sieges,
  pris = 0,
  taille = "sm",
  compteur = false,
  className = "",
}: Props) {
  const etats: EtatSiege[] = Array.from({ length: capacite }, (_, i) => {
    if (sieges) return sieges[i] ?? "libre";
    return i < pris ? "pris" : "libre";
  });

  const occupes = etats.filter((e) => e !== "libre").length;

  const parEtat = etats.reduce<Partial<Record<EtatSiege, number>>>((acc, e) => {
    acc[e] = (acc[e] ?? 0) + 1;
    return acc;
  }, {});
  const resume = Object.entries(parEtat)
    .map(([etat, n]) => `${n} ${LIBELLE[etat as EtatSiege]}`)
    .join(", ");

  return (
    <div className={`flex flex-wrap items-center gap-[3px] ${className}`}>
      <span className="sr-only-scg">
        {capacite} places : {resume}.
      </span>
      {etats.map((etat, i) => (
        <span key={i} aria-hidden="true" className={`block shrink-0 ${TAILLE[taille]} ${REMPLISSAGE[etat]}`} />
      ))}
      {compteur && (
        <span aria-hidden="true" className="t-chiffres ml-1.5 text-[0.76rem] font-semibold text-gris">
          {occupes} / {capacite}
        </span>
      )}
    </div>
  );
}
