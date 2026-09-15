import type { Bloc, SerieFigure } from "@/lib/publications";

/* ============================================================================
   Rendu du corps éditorial et des figures.
   Le moteur est repris de Bénin Numérique 2050 : des blocs typés plutôt que
   du HTML libre, pour que le contenu reste réutilisable et sûr.
   ============================================================================ */

export function Corps({ blocs }: { blocs: Bloc[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocs.map((b, i) => {
        if (b.type === "intertitre")
          return (
            <h2 key={i} className="t-h3 mt-6">
              {b.texte}
            </h2>
          );
        if (b.type === "citation")
          return (
            <blockquote
              key={i}
              className="t-italique my-2 border-l-2 border-laiton-fonce pl-5 text-[1.3rem] leading-[1.3] text-encre"
            >
              {b.texte}
            </blockquote>
          );
        if (b.type === "liste")
          return (
            <ul key={i} className="m-0 flex list-none flex-col gap-2 pl-0">
              {b.items.map((item) => (
                <li key={item} className="flex gap-3 text-[1rem]">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-laiton-fonce"
                  />
                  {item}
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="m-0 max-w-[65ch] text-[1.02rem] leading-[1.65]">
            {b.texte}
          </p>
        );
      })}
    </div>
  );
}

/* Un graphique à barres horizontales, en SVG, sans bibliothèque. Une seule
   échelle place les barres et les libellés, et chaque libellé nomme une
   valeur que le graphique atteint réellement. */
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
    <figure className="my-8 rounded-carte border border-ligne bg-white p-5">
      <figcaption>
        <p className="t-balise m-0 text-[0.58rem] text-laiton-fonce">Figure</p>
        <p className="mt-1 text-[1.02rem] font-bold tracking-[-0.02em]">{titre}</p>
        {legende && <p className="mt-1 text-[0.86rem] text-gris">{legende}</p>}
      </figcaption>

      <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 pl-0">
        {serie.map((d) => (
          <li key={d.libelle} className="grid grid-cols-[minmax(90px,26%)_1fr_auto] items-center gap-3">
            <span className="text-[0.84rem] text-gris">{d.libelle}</span>
            <span className="h-3 overflow-hidden rounded-[3px] bg-papier-2">
              <span
                className="block h-full rounded-[3px] bg-gradient-to-r from-marine to-azur"
                style={{ width: `${(d.valeur / maxi) * 100}%` }}
              />
            </span>
            <span className="t-chiffres font-mono text-[0.8rem] font-semibold text-marine">
              {new Intl.NumberFormat("fr-FR").format(d.valeur)}
            </span>
          </li>
        ))}
      </ul>

      {source && (
        <p className="t-balise mt-4 border-t border-ligne-douce pt-3 text-[0.56rem] text-gris">
          Source : {source}
        </p>
      )}
    </figure>
  );
}
