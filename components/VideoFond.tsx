"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ============================================================================
   Vidéo de fond : muette, en boucle, sans commandes. L'affiche est rendue
   tout de suite (c'est elle que mesure le LCP) ; la vidéo se fond dessus
   quand elle est prête. Avec prefers-reduced-motion, seule l'affiche reste.
   ============================================================================ */

export function VideoFond({
  src,
  srcMobile,
  affiche,
  className = "",
}: {
  src: string;
  /** Version plus légère servie sous 768 px. */
  srcMobile?: string;
  affiche: string;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [prete, setPrete] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduit) return;
    const jouer = () => v.play().catch(() => {});
    if (v.readyState >= 3) setPrete(true);
    jouer();
  }, [reduit]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- affiche locale, pas d'optimisation nécessaire */}
      <img src={affiche} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      {!reduit && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={affiche}
          onCanPlay={() => setPrete(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${prete ? "opacity-100" : "opacity-0"}`}
        >
          {srcMobile && <source src={srcMobile} type="video/mp4" media="(max-width: 767px)" />}
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
