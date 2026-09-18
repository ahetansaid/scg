import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* ============================================================================
   Bouton. L'action principale est vert-canard, comme dans la référence ;
   le marine sert aux actions secondaires ; le contour aux actions discrètes.
   ============================================================================ */

const VARIANTE = {
  canard: "bg-canard text-white hover:bg-canard-fonce shadow-[0_8px_20px_-10px_rgba(20,160,138,.7)]",
  marine: "bg-marine text-white hover:bg-marine-clair",
  contour: "bg-white border border-canard text-canard hover:bg-canard-clair",
  contourMarine: "bg-white border border-ligne text-marine hover:border-marine",
  discret: "bg-transparent text-marine hover:bg-brume",
  clair: "bg-white text-marine hover:bg-brume",
} as const;

const TAILLE = {
  md: "px-6 py-3 text-[0.92rem]",
  sm: "px-4 py-2 text-[0.84rem]",
  lg: "px-7 py-3.5 text-[1rem]",
} as const;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold whitespace-nowrap no-underline " +
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
  variante = "canard",
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
  variante = "canard",
  taille = "md",
  className = "",
  ...reste
}: Commun & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link {...reste} className={`${BASE} ${VARIANTE[variante]} ${TAILLE[taille]} ${className}`} />
  );
}
