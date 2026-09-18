import Link from "next/link";
import type { ReactNode } from "react";

import { Navigation } from "./Navigation";
import { Pastilles } from "./Vitrine";

/* ============================================================================
   En-tête clair des pages intérieures : navigation, fil d'Ariane, titre avec
   mot souligné, sous-titre, et un emplacement pour les filtres.
   ============================================================================ */

export function EnTete({
  actif,
  fil,
  sur,
  titre,
  souligne,
  sous,
  etroit = false,
  children,
}: {
  actif?: string;
  fil?: { href: string; libelle: string }[];
  sur?: string;
  titre: string;
  souligne?: string;
  sous?: ReactNode;
  /** Colonne resserrée pour les pages de formulaire. */
  etroit?: boolean;
  children?: ReactNode;
}) {
  const parties = souligne ? titre.split(souligne) : [titre];

  return (
    <>
      <Navigation actif={actif} />
      <section className="relative overflow-hidden bg-brume">
        <Pastilles />
        <div aria-hidden="true" className="trame absolute top-6 right-[6%] h-28 w-28 opacity-50" />
        <div className={`mx-auto px-4 pt-10 pb-14 sm:px-6 ${etroit ? "max-w-[720px]" : "max-w-[1180px]"}`}>
          {fil && fil.length > 0 && (
            <nav aria-label="Fil d'Ariane" className="mb-3 text-[0.82rem] text-gris">
              <ol className="flex list-none flex-wrap gap-1.5 pl-0">
                <li>
                  <Link href="/" className="no-underline hover:text-canard">
                    Accueil
                  </Link>
                  <span className="mx-1.5">/</span>
                </li>
                {fil.map((f, i) => (
                  <li key={f.href}>
                    <Link href={f.href} className="no-underline hover:text-canard">
                      {f.libelle}
                    </Link>
                    {i < fil.length - 1 && <span className="mx-1.5">/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {sur && <p className="t-sur mb-2">{sur}</p>}
          <h1 className="t-hero max-w-[22ch] text-[clamp(2rem,4.6vw,3.2rem)]">
            {souligne && parties.length === 2 ? (
              <>
                {parties[0]}
                <span className="souligne">{souligne}</span>
                {parties[1]}
              </>
            ) : (
              titre
            )}
          </h1>
          {sous && <div className="mt-4 max-w-[60ch] text-[1.02rem] text-gris">{sous}</div>}
          {children && <div className="mt-6">{children}</div>}
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-8 rounded-t-[100%_100%] bg-white md:h-12" />
      </section>
    </>
  );
}

/* Filtre en pilule, tel qu'on le trouve sous le titre du catalogue. */
export function Filtre({ href, actif, children }: { href: string; actif: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={`inline-block rounded-full border px-4 py-1.5 text-[0.84rem] font-semibold no-underline transition-colors ${
        actif
          ? "border-canard bg-canard text-white"
          : "border-ligne bg-white text-marine hover:border-canard hover:text-canard"
      }`}
    >
      {children}
    </Link>
  );
}
