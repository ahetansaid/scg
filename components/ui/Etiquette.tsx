import type { ReactNode } from "react";

/* ============================================================================
   Étiquette d'état.
   Les couleurs de statut – vert, laiton, terre – ne servent qu'ici et sur la
   cohorte. Jamais de décoration avec ces trois-là.
   ============================================================================ */

const SUR_NUIT = {
  ouvert: "bg-vert/18 text-vert-clair border-vert-clair/30",
  bientot: "bg-laiton/18 text-[#e0b457] border-[#e0b457]/32",
  complet: "bg-terre/20 text-terre-clair border-terre-clair/28",
  certifiante: "bg-azur/18 text-[#8cc5e8] border-[#8cc5e8]/28",
} as const;

const SUR_PAPIER = {
  ouvert: "bg-[#e2f0e8] text-vert border-transparent",
  bientot: "bg-[#fbf0dc] text-[#7a5310] border-transparent",
  complet: "bg-[#fae4de] text-terre border-transparent",
  certifiante: "bg-[#dfebf4] text-[#1b537c] border-transparent",
} as const;

export function Etiquette({
  etat,
  fond = "papier",
  children,
}: {
  etat: keyof typeof SUR_NUIT;
  fond?: "papier" | "nuit";
  children: ReactNode;
}) {
  const ton = fond === "nuit" ? SUR_NUIT[etat] : SUR_PAPIER[etat];
  return (
    <span
      className={`t-balise inline-block rounded-etiquette border px-[9px] py-[4px] text-[0.6rem] font-semibold tracking-[0.14em] ${ton}`}
    >
      {children}
    </span>
  );
}
