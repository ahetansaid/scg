/* ============================================================================
   MOTIF – L'ARC
   Le geste du logo devient une trajectoire. Il porte les pôles du cabinet
   dans le hero, et sert de jauge d'avancement dans l'espace membre.

   La courbe est une cubique fixe dans un viewBox 1200 × 300 ; les pastilles
   sont posées dessus par le calcul, pas à l'œil. La zone qui la contient
   garde le même rapport 4/1, donc pastilles et libellés restent collés à la
   courbe quelle que soit la largeur.
   ============================================================================ */

const P0 = { x: 0, y: 290 };
const P1 = { x: 250, y: 40 };
const P2 = { x: 950, y: 40 };
const P3 = { x: 1200, y: 290 };

const COURBE = `M${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`;
const COURBE_ECHO = "M0 300 C 250 82, 950 82, 1200 300";

/** Point de la cubique en t ∈ [0,1]. */
function surLArc(t: number) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * P0.x + b * P1.x + c * P2.x + d * P3.x,
    y: a * P0.y + b * P1.y + c * P2.y + d * P3.y,
  };
}

/* Les pôles ne vont pas jusqu'aux extrémités : la courbe doit continuer
   au-delà du dernier, sinon elle se lit comme un segment fermé. */
function reparti(index: number, total: number) {
  if (total <= 1) return 0.5;
  return 0.15 + (index * 0.7) / (total - 1);
}

export type Pole = {
  /** Le verbe : ce que le pôle fait. */
  action: string;
  /** Le nom du pôle. */
  titre: string;
  href?: string;
};

export function Arc({ poles }: { poles: Pole[] }) {
  const points = poles.map((pole, i) => ({ ...pole, ...surLArc(reparti(i, poles.length)) }));

  return (
    <>
      {/* Réserve la hauteur dans le flux pour que le contenu du hero ne
          chevauche jamais la courbe. Même rapport que la zone ci-dessous. */}
      <div className="aspect-[4/1] w-full max-md:aspect-[6/1]" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] aspect-[4/1] max-md:aspect-[6/1]">
        <svg
          viewBox="0 0 1200 300"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 size-full"
        >
          <path d={COURBE_ECHO} stroke="rgba(62,143,193,.26)" strokeWidth="1.2" />
          <path d={COURBE} stroke="rgba(216,155,52,.62)" strokeWidth="2" />
          {points.map((p) => (
            <circle key={p.titre} cx={p.x} cy={p.y} r="5.5" fill="var(--color-laiton-vif)" />
          ))}
        </svg>

        {points.map((p) => (
          <span
            key={p.titre}
            className="absolute -translate-x-1/2 text-center whitespace-nowrap max-md:hidden"
            style={{ left: `${(p.x / 1200) * 100}%`, top: `${(p.y / 300) * 100 + 7}%` }}
          >
            <span className="t-balise text-[0.6rem] text-[#9fc0dc]">{p.action}</span>
            <span className="mt-[3px] block text-[0.85rem] font-semibold tracking-[-0.015em] text-white">
              {p.titre}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
   La même courbe, en jauge : où en est le participant sur son parcours.
   Les étapes franchies sont pleines, l'étape en cours porte un halo,
   l'objectif reste un cercle vide.
   -------------------------------------------------------------------------- */

export type Etape = {
  titre: string;
  etat: "termine" | "en_cours" | "a_venir";
};

export function ArcTrajectoire({ etapes }: { etapes: Etape[] }) {
  const points = etapes.map((e, i) => ({ ...e, ...surLArc(reparti(i, etapes.length)) }));
  const courant = points.find((p) => p.etat === "en_cours");

  /* Le tracé plein s'arrête à l'étape en cours : il montre le chemin
     parcouru, pas celui qui reste. */
  const parcouru = courant
    ? `M${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${courant.x * 0.5} ${courant.y * 0.4}, ${courant.x} ${courant.y}`
    : null;

  return (
    <figure className="m-0">
      <svg viewBox="0 0 1200 320" fill="none" className="block h-auto w-full" aria-hidden="true">
        <path d={COURBE} stroke="rgba(255,255,255,.16)" strokeWidth="2" />
        {parcouru && (
          <path
            d={parcouru}
            stroke="var(--color-laiton-vif)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {points.map((p) => (
          <g key={p.titre}>
            {p.etat === "en_cours" && (
              <circle
                cx={p.x}
                cy={p.y}
                r="20"
                fill="none"
                stroke="var(--color-laiton-vif)"
                strokeOpacity="0.38"
                strokeWidth="3"
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.etat === "en_cours" ? 10 : 7}
              fill={
                p.etat === "termine"
                  ? "var(--color-vert-clair)"
                  : p.etat === "en_cours"
                    ? "var(--color-laiton-vif)"
                    : "none"
              }
              stroke={p.etat === "a_venir" ? "rgba(255,255,255,.4)" : "none"}
              strokeWidth="3"
            />
          </g>
        ))}
      </svg>

      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {etapes.map((e) => (
          <span key={e.titre} className="block">
            <span
              className={`t-balise block text-[0.6rem] ${
                e.etat === "en_cours" ? "text-laiton-vif" : "text-gris-clair"
              }`}
            >
              {e.etat === "termine" ? "Terminé" : e.etat === "en_cours" ? "En cours" : "À venir"}
            </span>
            <span
              className={`text-[0.82rem] font-semibold tracking-[-0.01em] ${
                e.etat === "en_cours" ? "text-laiton-vif" : "text-white"
              }`}
            >
              {e.titre}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
