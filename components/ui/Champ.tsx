import type { ComponentProps, ReactNode } from "react";

/* ============================================================================
   Champs de formulaire, version papier.
   Un seul endroit décide de l'apparence d'un champ : sinon la moitié des
   formulaires dérive au premier ajout.
   ============================================================================ */

export const classeChamp =
  "w-full rounded-champ border border-ligne bg-white px-3.5 py-2.5 text-[0.94rem] " +
  "outline-none transition-colors focus:border-marine focus:ring-2 focus:ring-marine/20 " +
  "disabled:bg-papier-2 disabled:text-gris";

export const classeLabel = "t-balise mb-1.5 block text-[0.6rem] text-gris";

export function Champ({
  label,
  aide,
  id,
  ...reste
}: { label: string; aide?: ReactNode } & ComponentProps<"input">) {
  return (
    <div>
      <label htmlFor={id} className={classeLabel}>
        {label}
      </label>
      <input id={id} className={classeChamp} {...reste} />
      {aide && <p className="mt-1 text-[0.78rem] text-gris">{aide}</p>}
    </div>
  );
}

export function ChampTexte({
  label,
  aide,
  id,
  ...reste
}: { label: string; aide?: ReactNode } & ComponentProps<"textarea">) {
  return (
    <div>
      <label htmlFor={id} className={classeLabel}>
        {label}
      </label>
      <textarea id={id} className={classeChamp} {...reste} />
      {aide && <p className="mt-1 text-[0.78rem] text-gris">{aide}</p>}
    </div>
  );
}

export function ChampListe({
  label,
  aide,
  id,
  children,
  ...reste
}: { label: string; aide?: ReactNode } & ComponentProps<"select">) {
  return (
    <div>
      <label htmlFor={id} className={classeLabel}>
        {label}
      </label>
      <select id={id} className={classeChamp} {...reste}>
        {children}
      </select>
      {aide && <p className="mt-1 text-[0.78rem] text-gris">{aide}</p>}
    </div>
  );
}

/* Message de résultat. Un message d'erreur dit ce qui ne va pas ET comment
   le réparer – pas d'excuses, pas de vague. */
export function Alerte({ nature, children }: { nature: "succes" | "erreur"; children: ReactNode }) {
  const ton =
    nature === "succes"
      ? "border-vert/30 bg-[#e2f0e8] text-vert"
      : "border-terre/30 bg-[#fae4de] text-terre";
  return (
    <p
      role={nature === "succes" ? "status" : "alert"}
      className={`mb-6 rounded-carte border px-4 py-3.5 text-[0.92rem] ${ton}`}
    >
      {children}
    </p>
  );
}

/* Piège à robots : masqué à l'œil, retiré du parcours clavier et des lecteurs
   d'écran. Un humain ne le rencontre jamais. */
export function PiegeRobots() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px]">
      <label htmlFor="site">Ne pas remplir</label>
      <input id="site" name="site" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
