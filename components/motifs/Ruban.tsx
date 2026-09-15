/* ============================================================================
   MOTIF – LE RUBAN
   Le trimestre déplié à l'horizontale, les sessions posées dessus à leur
   vraie durée. Un directeur voit en une seconde si un cycle tombe pendant
   sa clôture comptable.

   La grille fait douze colonnes – une par semaine du trimestre. Les entrées
   sont placées par `semaineDebut` / `semaineFin`, pas par une largeur en
   pixels : c'est la durée réelle qui dessine le bloc.
   ============================================================================ */

const TON = {
  ouvert: "bg-nuit text-white",
  dernieres: "bg-laiton text-nuit",
  aVenir: "bg-transparent text-gris shadow-[inset_0_0_0_1px_rgba(6,24,47,.22)]",
} as const;

export type EntreeRuban = {
  titre: string;
  detail: string;
  /** Semaine de début, de 1 à 12. */
  semaineDebut: number;
  /** Semaine de fin, incluse. */
  semaineFin: number;
  /** Ligne d'empilement, de 1 à 3, pour les sessions qui se chevauchent. */
  ligne?: 1 | 2 | 3;
  ton?: keyof typeof TON;
  href?: string;
};

const LIGNE = { 1: "row-start-1", 2: "row-start-2", 3: "row-start-3" } as const;

export function Ruban({
  mois,
  entrees,
}: {
  mois: [string, string, string];
  entrees: EntreeRuban[];
}) {
  return (
    /* Douze colonnes ne tiennent pas sur un téléphone sans tronquer les
       titres. Plutôt que d'écraser la grille – ce qui détruirait justement
       l'information de durée que le ruban existe pour porter – on lui donne
       une largeur plancher et on la fait défiler dans son propre conteneur.
       Le corps de la page, lui, ne défile jamais latéralement. */
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[680px] border-y border-[rgba(6,24,47,.16)]">
        <div className="grid grid-cols-12 border-b border-[rgba(6,24,47,.1)]">
          {mois.map((nom) => (
            <div
              key={nom}
              className="t-balise col-span-4 border-l border-[rgba(6,24,47,.1)] py-2 pl-[10px] text-[0.62rem] text-gris first:border-l-0"
            >
              {nom}
            </div>
          ))}
        </div>

        <ol className="grid list-none grid-cols-12 gap-y-[5px] py-3 pl-0">
          {entrees.map((e) => {
            const classes = `block overflow-hidden rounded-[7px] px-[11px] py-2 no-underline transition-transform duration-200 hover:-translate-y-0.5 ${TON[e.ton ?? "ouvert"]}`;
            const contenu = (
              <>
                <span className="block overflow-hidden text-[0.79rem] font-semibold tracking-[-0.01em] text-ellipsis whitespace-nowrap">
                  {e.titre}
                </span>
                <span className="t-balise block text-[0.58rem] opacity-70">
                  {e.detail}
                </span>
              </>
            );
            return (
              <li
                key={e.titre}
                className={LIGNE[e.ligne ?? 1]}
                style={{
                  gridColumn: `${e.semaineDebut} / ${e.semaineFin + 1}`,
                }}
              >
                {e.href ? (
                  <a href={e.href} className={classes}>
                    {contenu}
                  </a>
                ) : (
                  <div className={classes}>{contenu}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
