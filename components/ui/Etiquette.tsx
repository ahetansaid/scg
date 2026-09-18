import type { ReactNode } from "react";

/* ============================================================================
   Étiquette d'état. Petite, arrondie, sur fond pastel. Les couleurs de statut
   ne servent qu'ici et sur la cohorte : jamais de décoration avec.
   ============================================================================ */

const TON = {
  ouvert: "bg-canard-clair text-canard-fonce",
  bientot: "bg-pastel-soleil text-[#8a5f14]",
  complet: "bg-pastel-corail text-terre",
  certifiante: "bg-pastel-ciel text-marine",
  neutre: "bg-brume-2 text-gris",
} as const;

export function Etiquette({
  etat,
  children,
  className = "",
}: {
  etat: keyof typeof TON;
  /** Conservé pour compatibilité : le rendu est le même sur tous les fonds. */
  fond?: "papier" | "nuit";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${TON[etat]} ${className}`}
    >
      {children}
    </span>
  );
}
