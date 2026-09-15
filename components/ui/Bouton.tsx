import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* ============================================================================
   Bouton – trois fonds, mêmes tokens.
   Le fond détermine la variante : sur nuit c'est le laiton qui porte l'action
   principale, sur papier c'est le marine, sur le panneau laiton c'est le nuit.
   ============================================================================ */

const VARIANTE = {
  laiton: "bg-laiton text-[#1a1204] hover:bg-laiton-vif",
  marine: "bg-marine text-white hover:bg-marine-clair",
  nuit: "bg-nuit text-white hover:bg-nuit-2",
  fantomeNuit:
    "bg-transparent border border-white/30 text-[#e6eef6] hover:border-laiton hover:bg-laiton/15",
  fantomeClair:
    "bg-transparent border border-[#c2ccd5] text-marine hover:border-marine hover:bg-marine/6",
  fantomeLaiton:
    "bg-transparent border border-nuit/35 text-nuit hover:bg-nuit/10",
} as const;

const TAILLE = {
  md: "px-[21px] py-[11px] text-[0.89rem]",
  sm: "px-[15px] py-2 text-[0.81rem]",
} as const;

const BASE =
  "inline-flex items-center gap-2 rounded-full font-semibold tracking-[-0.01em] no-underline " +
  "transition-[transform,background-color,border-color] duration-150 ease-out " +
  "hover:-translate-y-px motion-reduce:hover:translate-y-0 " +
  "disabled:pointer-events-none disabled:opacity-50";

type Commun = {
  variante?: keyof typeof VARIANTE;
  taille?: keyof typeof TAILLE;
  className?: string;
  children: ReactNode;
};

export function Bouton({
  variante = "marine",
  taille = "md",
  className = "",
  ...reste
}: Commun & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      type="button"
      {...reste}
      className={`${BASE} ${VARIANTE[variante]} ${TAILLE[taille]} ${className}`}
    />
  );
}

export function BoutonLien({
  variante = "marine",
  taille = "md",
  className = "",
  ...reste
}: Commun & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      {...reste}
      className={`${BASE} ${VARIANTE[variante]} ${TAILLE[taille]} ${className}`}
    />
  );
}
