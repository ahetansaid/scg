import type { ComponentProps, ReactNode } from "react";

/* ============================================================================
   Champs de formulaire. Un seul endroit décide de l'apparence d'un champ :
   sinon la moitié des formulaires dérive au premier ajout.
   ============================================================================ */

export const classeChamp =
  "w-full rounded-champ border border-ligne bg-white px-3.5 py-2.5 text-[0.95rem] " +
  "outline-none transition-colors focus:border-canard focus:ring-4 focus:ring-canard/12 " +
  "disabled:bg-brume disabled:text-gris";

export const classeLabel = "mb-1.5 block text-[0.84rem] font-semibold text-marine";

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
      {aide && <p className="mt-1 text-[0.8rem] text-gris">{aide}</p>}
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
      {aide && <p className="mt-1 text-[0.8rem] text-gris">{aide}</p>}
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
      {aide && <p className="mt-1 text-[0.8rem] text-gris">{aide}</p>}
    </div>
  );
}

/* Un message d'erreur dit ce qui ne va pas ET comment le réparer. */
export function Alerte({ nature, children }: { nature: "succes" | "erreur"; children: ReactNode }) {
  const ton =
    nature === "succes"
      ? "border-canard/30 bg-canard-clair text-canard-fonce"
      : "border-terre/30 bg-pastel-corail text-terre";
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
