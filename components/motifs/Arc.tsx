/* ============================================================================
   MOTIF – L'ARC DE TRAJECTOIRE
   La courbe du logo, en jauge d'avancement pour l'espace membre : les étapes
   franchies sont pleines, l'étape en cours porte un halo, l'objectif reste un
   cercle vide. Les pastilles sont posées sur la cubique par le calcul.
   ============================================================================ */

const P0 = { x: 0, y: 290 };
const P1 = { x: 250, y: 40 };
const P2 = { x: 950, y: 40 };
const P3 = { x: 1200, y: 290 };

const COURBE = `M${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`;

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

function reparti(index: number, total: number) {
  if (total <= 1) return 0.5;
  return 0.15 + (index * 0.7) / (total - 1);
}

export type Etape = {
  titre: string;
  etat: "termine" | "en_cours" | "a_venir";
};

export function ArcTrajectoire({ etapes }: { etapes: Etape[] }) {
  const points = etapes.map((e, i) => ({ ...e, ...surLArc(reparti(i, etapes.length)) }));
  const courant = points.find((p) => p.etat === "en_cours");

  const parcouru = courant
    ? `M${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${courant.x * 0.5} ${courant.y * 0.4}, ${courant.x} ${courant.y}`
    : null;

  return (
    <figure className="m-0">
      <svg viewBox="0 0 1200 320" fill="none" className="block h-auto w-full" aria-hidden="true">
        <path d={COURBE} stroke="rgba(255,255,255,.18)" strokeWidth="2" />
        {parcouru && <path d={parcouru} stroke="var(--color-soleil)" strokeWidth="4" strokeLinecap="round" />}
        {points.map((p) => (
          <g key={p.titre}>
            {p.etat === "en_cours" && (
              <circle cx={p.x} cy={p.y} r="20" fill="none" stroke="var(--color-soleil)" strokeOpacity="0.4" strokeWidth="3" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.etat === "en_cours" ? 10 : 7}
              fill={p.etat === "termine" ? "var(--color-canard)" : p.etat === "en_cours" ? "var(--color-soleil)" : "none"}
              stroke={p.etat === "a_venir" ? "rgba(255,255,255,.45)" : "none"}
              strokeWidth="3"
            />
          </g>
        ))}
      </svg>

      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {etapes.map((e) => (
          <span key={e.titre} className="block">
            <span className={`block text-[0.7rem] font-bold tracking-wide uppercase ${e.etat === "en_cours" ? "text-soleil" : "text-white/60"}`}>
              {e.etat === "termine" ? "Terminé" : e.etat === "en_cours" ? "En cours" : "À venir"}
            </span>
            <span className={`text-[0.85rem] font-semibold ${e.etat === "en_cours" ? "text-soleil" : "text-white"}`}>{e.titre}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
