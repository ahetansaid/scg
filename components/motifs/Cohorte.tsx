/* ============================================================================
   MOTIF — LA COHORTE
   Un carré, un siège. On lit « il reste trois places » sans chiffre.
   Sur le site public : pris ou libre. En back-office, la même rangée se
   colore par statut de paiement.
   ============================================================================ */

export type EtatSiege = "libre" | "pris" | "solde" | "acompte" | "relance";

const REMPLISSAGE: Record<EtatSiege, string> = {
  libre: "bg-transparent shadow-[inset_0_0_0_1px_var(--teinte-libre)]",
  pris: "bg-[var(--teinte-pris)]",
  solde: "bg-vert",
  acompte: "bg-laiton",
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
  sm: "size-[9px] rounded-[2px]",
  md: "size-[13px] rounded-[3px]",
} as const;

type Props = {
  /** Nombre total de places. Donne le nombre de carrés. */
  capacite: number;
  /**
   * État de chaque siège, dans l'ordre. Plus court que `capacite` ? Le reste
   * est complété en « libre ». Omis ? On utilise `pris`.
   */
  sieges?: EtatSiege[];
  /** Raccourci quand seul le remplissage compte. */
  pris?: number;
  fond?: "papier" | "nuit";
  taille?: keyof typeof TAILLE;
  /** Affiche « 22 / 25 » à droite de la rangée. */
  compteur?: boolean;
  className?: string;
};

export function Cohorte({
  capacite,
  sieges,
  pris = 0,
  fond = "papier",
  taille = "sm",
  compteur = false,
  className = "",
}: Props) {
  const etats: EtatSiege[] = Array.from({ length: capacite }, (_, i) => {
    if (sieges) return sieges[i] ?? "libre";
    return i < pris ? "pris" : "libre";
  });

  const occupes = etats.filter((e) => e !== "libre").length;

  /* Le décompte par état, pour l'alternative textuelle. Un graphique ne doit
     jamais être la seule source de l'information. */
  const parEtat = etats.reduce<Partial<Record<EtatSiege, number>>>((acc, e) => {
    acc[e] = (acc[e] ?? 0) + 1;
    return acc;
  }, {});

  const resume = Object.entries(parEtat)
    .map(([etat, n]) => `${n} ${LIBELLE[etat as EtatSiege]}`)
    .join(", ");

  return (
    <div
      className={`flex flex-wrap items-center gap-[3px] ${className}`}
      style={
        fond === "nuit"
          ? ({
              "--teinte-pris": "var(--color-laiton)",
              "--teinte-libre": "rgba(255,255,255,.32)",
            } as React.CSSProperties)
          : ({
              "--teinte-pris": "var(--color-marine)",
              "--teinte-libre": "rgba(6,24,47,.28)",
            } as React.CSSProperties)
      }
    >
      <span className="sr-only-scg">
        {capacite} places : {resume}.
      </span>

      {etats.map((etat, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`block shrink-0 ${TAILLE[taille]} ${REMPLISSAGE[etat]}`}
        />
      ))}

      {compteur && (
        <span
          aria-hidden="true"
          className={`t-chiffres ml-[5px] font-mono text-[0.66rem] tracking-[0.1em] ${
            fond === "nuit" ? "text-gris-clair" : "text-gris"
          }`}
        >
          {occupes} / {capacite}
        </span>
      )}
    </div>
  );
}
