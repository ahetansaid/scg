import Image from "next/image";
import type { ReactNode } from "react";

import { HeroLigne, HeroTexte, HeroVisuel, Souligne } from "./Animations";
import { Navigation } from "./Navigation";
import { PiedDePage } from "./PiedDePage";

/* ============================================================================
   Gabarit des pages de compte : le formulaire à gauche, et à droite un cadre
   sombre qui rappelle pourquoi on ouvre un compte ici. Sur mobile, seul le
   formulaire reste.
   ============================================================================ */

const POINTS = [
  "Vos inscriptions, vos séances et vos documents au même endroit.",
  "Vos demandes de mentorat, suivies jusqu'à la réponse.",
  "Vos certificats, avec leur numéro vérifiable en ligne.",
];

export function PageCompte({
  actif,
  sur,
  titre,
  souligne,
  sous,
  photo,
  children,
}: {
  actif?: string;
  sur: string;
  titre: string;
  souligne?: string;
  sous: string;
  photo: string;
  children: ReactNode;
}) {
  const parties = souligne ? titre.split(souligne) : [titre];

  return (
    <>
      <Navigation actif={actif} />
      <main className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1fr_1fr] md:gap-12 md:py-12">
        <div className="mx-auto w-full max-w-[520px] md:mx-0 md:py-6">
          <HeroTexte>
            <HeroLigne>
              <p className="t-sur mb-2">{sur}</p>
            </HeroLigne>
            <HeroLigne>
              <h1 className="t-hero text-[clamp(1.9rem,4vw,2.8rem)]">
                {souligne && parties.length === 2 ? (
                  <>
                    {parties[0]}
                    <Souligne>{souligne}</Souligne>
                    {parties[1]}
                  </>
                ) : (
                  titre
                )}
              </h1>
            </HeroLigne>
            <HeroLigne>
              <p className="mt-3 max-w-[48ch] text-gris">{sous}</p>
            </HeroLigne>
            <HeroLigne className="mt-8">{children}</HeroLigne>
          </HeroTexte>
        </div>

        <HeroVisuel className="relative hidden min-h-[560px] overflow-hidden rounded-grand bg-nuit text-white md:block">
          <Image src={photo} alt="" fill sizes="600px" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/55 to-nuit/10" />
          <div className="absolute inset-x-0 bottom-0 p-9">
            <p className="text-[0.8rem] font-semibold text-soleil">Votre espace</p>
            <p className="mt-2 max-w-[18ch] text-[1.7rem] leading-tight font-extrabold tracking-[-0.02em]">
              Un seul endroit pour tout ce que vous faites avec le cabinet
            </p>
            <ul className="mt-6 flex list-none flex-col gap-3 pl-0 text-[0.9rem] text-white/80">
              {POINTS.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-canard text-white">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </HeroVisuel>
      </main>
      <PiedDePage />
    </>
  );
}
