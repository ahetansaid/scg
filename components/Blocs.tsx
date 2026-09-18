import type { Bloc, SerieFigure } from "@/lib/publications";

/* ============================================================================
   Rendu du corps éditorial et des figures : des blocs typés plutôt que du
   HTML libre, pour que le contenu reste réutilisable et sûr.
   ============================================================================ */

export function Corps({ blocs }: { blocs: Bloc[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocs.map((b, i) => {
        if (b.type === "intertitre")
          return (
            <h2 key={i} className="t-h2 mt-6 text-[1.4rem]">
              {b.texte}
            </h2>
          );
        if (b.type === "citation")
          return (
            <blockquote key={i} className="my-2 rounded-carte bg-pastel-soleil p-6 text-[1.15rem] leading-relaxed font-semibold text-marine">
              {b.texte}
            </blockquote>
          );
        if (b.type === "liste")
          return (
            <ul key={i} className="m-0 flex list-none flex-col gap-2 pl-0">
              {b.items.map((item) => (
                <li key={item} className="flex gap-3 text-[1rem]">
                  <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-canard" />
                  {item}
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="m-0 max-w-[65ch] text-[1.02rem] leading-[1.7]">
            {b.texte}
          </p>
        );
      })}
    </div>
  );
}

/* Barres horizontales sans bibliothèque. Une seule échelle place les barres
   et les libellés ; chaque libellé nomme une valeur que le graphique atteint. */
export function Figure({
  titre,
  legende,
  serie,
  source,
}: {
  titre: string;
  legende?: string;
  serie: SerieFigure[];
  source?: string;
}) {
  if (serie.length === 0) return null;
  const maxi = Math.max(...serie.map((d) => d.valeur), 0);
  if (maxi <= 0) return null;

  return (
    <figure className="my-8 rounded-carte border border-ligne bg-white p-6 shadow-carte">
      <figcaption>
        <p className="text-[0.78rem] font-semibold text-canard">Figure</p>
        <p className="mt-1 text-[1.05rem] font-bold text-marine">{titre}</p>
        {legende && <p className="mt-1 text-[0.88rem] text-gris">{legende}</p>}
      </figcaption>
      <ul className="m-0 mt-5 flex list-none flex-col gap-3 pl-0">
        {serie.map((d) => (
          <li key={d.libelle} className="grid grid-cols-[minmax(90px,26%)_1fr_auto] items-center gap-3">
            <span className="text-[0.86rem] text-gris">{d.libelle}</span>
            <span className="h-3 overflow-hidden rounded-full bg-brume-2">
              <span className="block h-full rounded-full bg-canard" style={{ width: `${(d.valeur / maxi) * 100}%` }} />
            </span>
            <span className="t-chiffres text-[0.86rem] font-bold text-marine">
              {new Intl.NumberFormat("fr-FR").format(d.valeur)}
            </span>
          </li>
        ))}
      </ul>
      {source && <p className="mt-4 border-t border-ligne pt-3 text-[0.78rem] text-gris">Source : {source}</p>}
    </figure>
  );
}
