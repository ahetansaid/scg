"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/* ============================================================================
   Animations – une grammaire courte et retenue.

   Trois gestes seulement : une entrée orchestrée sur le hero, une révélation
   douce des sections au défilement, et un décalage en cascade sur les grilles
   de cartes. Durées courtes, déplacements de quelques pixels, aucune
   rotation ni zoom. Tout s'efface avec prefers-reduced-motion.

   Ces composants sont clients ; les pages restent des composants serveur et
   ne font qu'envelopper leur contenu.
   ============================================================================ */

const SORTIE = [0.22, 1, 0.36, 1] as const; // ease-out marqué, sans rebond

/* --- Révélation au défilement ---------------------------------------------- */

export function Reveler({
  children,
  delai = 0,
  y = 18,
  className = "",
  une = true,
}: {
  children: ReactNode;
  delai?: number;
  y?: number;
  className?: string;
  /** Ne jouer qu'une fois. */
  une?: boolean;
}) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: une, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, delay: delai, ease: SORTIE }}
    >
      {children}
    </motion.div>
  );
}

/* --- Cascade sur une grille ------------------------------------------------ */

const conteneur: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const element: Variants = {
  cache: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SORTIE } },
};

export function Cascade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={conteneur}
      initial="cache"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function Element({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={element}>
      {children}
    </motion.div>
  );
}

/* --- Entrée du hero --------------------------------------------------------
   Un seul moment scénarisé : le texte monte en trois temps, la photo se
   révèle, la carte flottante arrive en dernier. Après ça, plus rien ne
   bouge tout seul.                                                         */

export function HeroTexte({ children }: { children: ReactNode }) {
  const reduit = useReducedMotion();
  if (reduit) return <div>{children}</div>;
  return (
    <motion.div
      variants={{ cache: {}, visible: { transition: { staggerChildren: 0.11 } } }}
      initial="cache"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function HeroLigne({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        cache: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SORTIE } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroVisuel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: SORTIE }}
    >
      {children}
    </motion.div>
  );
}

export function HeroCarte({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.85, ease: SORTIE }}
    >
      {children}
    </motion.div>
  );
}

/* --- Le soulignement qui se trace ------------------------------------------
   Remplace la version CSS statique là où l'on veut que le trait s'écrive
   sous le mot, une fois, quand il entre dans la vue.                       */

export function Souligne({ children }: { children: ReactNode }) {
  const reduit = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-[1]">{children}</span>
      <svg
        className="absolute -bottom-[0.12em] left-[-2%] h-[0.34em] w-[104%]"
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M3 14 C 40 6, 90 4, 197 9"
          stroke="var(--color-soleil)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          initial={reduit ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
}

/* --- Élévation au survol, pour les cartes ---------------------------------- */

export function Eleve({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}
