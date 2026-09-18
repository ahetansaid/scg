import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { HeroLigne, HeroTexte, Souligne } from "./Animations";
import { Navigation } from "./Navigation";

/* ============================================================================
   En-tête des pages intérieures.

   Deux registres :
   - avec `photo` : le cadre sombre de l'accueil, en plus bas. La photo
     couvre le cadre sous un voile marine, le titre est blanc, les filtres
     se posent en bas.
   - sans photo (`etroit`) : version claire et resserrée, pour les pages de
     formulaire.
   ============================================================================ */

type Fil = { href: string; libelle: string }[];

function FilDAriane({ fil, clair }: { fil: Fil; clair: boolean }) {
  const lien = clair ? "text-white/70 hover:text-white" : "text-gris hover:text-canard";
  return (
    <nav aria-label="Fil d'Ariane" className={`mb-4 text-[0.82rem] ${clair ? "text-white/70" : "text-gris"}`}>
      <ol className="flex list-none flex-wrap gap-1.5 pl-0">
        <li>
          <Link href="/" className={`no-underline ${lien}`}>
            Accueil
          </Link>
          <span className="mx-1.5">/</span>
        </li>
        {fil.map((f, i) => (
          <li key={f.href}>
            <Link href={f.href} className={`no-underline ${lien}`}>
              {f.libelle}
            </Link>
            {i < fil.length - 1 && <span className="mx-1.5">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Titre({ titre, souligne, className = "" }: { titre: string; souligne?: string; className?: string }) {
  const parties = souligne ? titre.split(souligne) : [titre];
  return (
    <h1 className={className}>
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
  );
}

export function EnTete({
  actif,
  fil,
  sur,
  titre,
  souligne,
  sous,
  etroit = false,
  photo,
  sombre = false,
  children,
}: {
  actif?: string;
  fil?: Fil;
  sur?: string;
  titre: string;
  souligne?: string;
  sous?: ReactNode;
  /** Colonne resserrée pour les pages de formulaire. */
  etroit?: boolean;
  /** Photo de fond : bascule sur le cadre sombre. */
  photo?: string;
  /** Cadre sombre sans photo, pour les pages de lecture. */
  sombre?: boolean;
  children?: ReactNode;
}) {
  if (photo || sombre) {
    return (
      <>
        <Navigation actif={actif} />
        <section className="px-3 pt-3 sm:px-4">
          <div
            className={`relative mx-auto flex max-w-[1400px] flex-col justify-end overflow-hidden rounded-grand bg-nuit text-white ${
              photo ? "min-h-[420px] md:min-h-[480px]" : "min-h-[300px]"
            }`}
          >
            {photo ? (
              <>
                {/* Dès 768 px, la photo est coupée en biais : marine à gauche,
                    image à droite, un trait canard sur la diagonale. */}
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  priority
                  className="object-cover md:[clip-path:polygon(34%_0,100%_0,100%_100%,18%_100%)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 hidden bg-canard md:block md:[clip-path:polygon(33%_0,34.6%_0,18.6%_100%,17%_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,24,47,.9)_0%,rgba(6,24,47,.6)_50%,rgba(6,24,47,.3)_100%)] md:bg-[linear-gradient(90deg,rgba(6,24,47,0)_0%,rgba(6,24,47,0)_30%,rgba(6,24,47,.55)_60%,rgba(6,24,47,.25)_100%)]"
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_20%,rgba(20,160,138,.35),transparent_70%),linear-gradient(135deg,#0b2e5b,#06182f)]"
              />
            )}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-nuit/90 to-transparent" />

            <div className="relative p-6 pt-24 sm:p-10 md:p-14 md:pt-28">
              <HeroTexte>
                {fil && fil.length > 0 && (
                  <HeroLigne>
                    <FilDAriane fil={fil} clair />
                  </HeroLigne>
                )}
                {sur && (
                  <HeroLigne>
                    <p className="mb-3 text-[0.86rem] font-semibold text-soleil">{sur}</p>
                  </HeroLigne>
                )}
                <HeroLigne>
                  <Titre titre={titre} souligne={souligne} className="t-hero t-clair max-w-[18ch] text-[clamp(2.1rem,4.8vw,3.6rem)]" />
                </HeroLigne>
                {sous && (
                  <HeroLigne>
                    <div className="mt-4 max-w-[58ch] text-[1.02rem] text-white/80">{sous}</div>
                  </HeroLigne>
                )}
                {children && (
                  <HeroLigne>
                    <div className="mt-7">{children}</div>
                  </HeroLigne>
                )}
              </HeroTexte>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navigation actif={actif} />
      <section className="relative overflow-hidden bg-brume">
        <div className={`mx-auto px-4 pt-10 pb-14 sm:px-6 ${etroit ? "max-w-[720px]" : "max-w-[1180px]"}`}>
          <HeroTexte>
            {fil && fil.length > 0 && (
              <HeroLigne>
                <FilDAriane fil={fil} clair={false} />
              </HeroLigne>
            )}
            {sur && (
              <HeroLigne>
                <p className="t-sur mb-2">{sur}</p>
              </HeroLigne>
            )}
            <HeroLigne>
              <Titre titre={titre} souligne={souligne} className="t-hero max-w-[22ch] text-[clamp(2rem,4.6vw,3.2rem)]" />
            </HeroLigne>
            {sous && (
              <HeroLigne>
                <div className="mt-4 max-w-[60ch] text-[1.02rem] text-gris">{sous}</div>
              </HeroLigne>
            )}
            {children && (
              <HeroLigne>
                <div className="mt-6">{children}</div>
              </HeroLigne>
            )}
          </HeroTexte>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-8 rounded-t-[100%_100%] bg-white md:h-12" />
      </section>
    </>
  );
}

/* Filtre en pilule. Sur le cadre sombre, la pilule inactive est en verre. */
export function Filtre({
  href,
  actif,
  clair = true,
  children,
}: {
  href: string;
  actif: boolean;
  /** Posé sur le cadre sombre. */
  clair?: boolean;
  children: ReactNode;
}) {
  const inactif = clair
    ? "border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
    : "border-ligne bg-white text-marine hover:border-canard hover:text-canard";
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={`inline-block rounded-full border px-4 py-1.5 text-[0.84rem] font-semibold no-underline transition-colors ${
        actif ? "border-canard bg-canard text-white" : inactif
      }`}
    >
      {children}
    </Link>
  );
}
