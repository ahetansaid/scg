import fs from "node:fs";
import path from "node:path";

import Image from "next/image";

/* Le logo officiel vit dans public/logo-scg.png (fond transparent, lettres
   marine). Sur fond sombre, un filtre le passe en blanc : une seule source
   à maintenir. Si le fichier venait à manquer, le sigle est reconstitué. */
const CANDIDATS = ["logo-scg.svg", "logo-scg.png", "logo-scg.webp"];
const FICHIER = CANDIDATS.find((f) => fs.existsSync(path.join(process.cwd(), "public", f)));

/* Proportions du fichier fourni : 567 × 150. */
const RATIO = 567 / 150;

export function Logo({
  hauteur = 34,
  clair = false,
  className = "",
}: {
  hauteur?: number;
  /** Version pour fond sombre. */
  clair?: boolean;
  className?: string;
}) {
  if (FICHIER) {
    return (
      <Image
        src={`/${FICHIER}`}
        alt="SCG – Strategic Consulting Group"
        width={Math.round(hauteur * RATIO)}
        height={hauteur}
        priority
        className={className}
        style={{
          height: hauteur,
          width: "auto",
          filter: clair ? "brightness(0) invert(1)" : undefined,
        }}
      />
    );
  }

  const couleur = clair ? "#ffffff" : "#0b2e5b";
  return (
    <span
      className={`inline-flex flex-col items-start leading-none ${className}`}
      style={{ color: couleur }}
      aria-label="SCG – Strategic Consulting Group"
      role="img"
    >
      <svg width={hauteur * 1.55} height={hauteur * 0.32} viewBox="0 0 118 26" fill="none" aria-hidden="true" className="-mb-[0.1em]">
        <path d="M6 24 C 24 2, 94 2, 112 24" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="font-extrabold tracking-[-0.06em]" style={{ fontSize: hauteur * 0.78 }}>
        SCG
      </span>
      <span className="font-semibold tracking-[0.16em] uppercase" style={{ fontSize: Math.max(7, hauteur * 0.2), opacity: 0.75 }}>
        Strategic Consulting Group
      </span>
    </span>
  );
}
