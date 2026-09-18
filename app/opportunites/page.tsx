import type { Metadata } from "next";
import Link from "next/link";

import { Cascade, Element } from "@/components/Animations";
import { EnTete, Filtre } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
import { PHOTOS } from "@/lib/photos";
import { utilisateurCourant } from "@/lib/auth";
import { mesFavoris } from "@/lib/espace";
import { domainesOpportunites, listerOpportunites } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

import { basculerFavori } from "../espace/actions";

export const metadata: Metadata = {
  title: "Opportunités",
  description: "Appels à candidatures, missions et bourses relayés par Strategic Consulting Group.",
};

export default async function Opportunites(props: PageProps<"/opportunites">) {
  const params = await props.searchParams;
  const v = params.domaine;
  const domaine = Array.isArray(v) ? v[0] : v;

  const [liste, domaines, utilisateur] = await Promise.all([
    listerOpportunites(domaine),
    domainesOpportunites(),
    utilisateurCourant(),
  ]);

  const favoris = utilisateur
    ? new Set((await mesFavoris(utilisateur.id)).filter((f) => f.nature === "opportunite").map((f) => f.cibleId))
    : new Set<string>();

  return (
    <>
      <EnTete
        photo={PHOTOS.equipe}
        actif="/opportunites"
        sur="Opportunités"
        titre="Ce qui s'ouvre"
        souligne="s'ouvre"
        sous="Appels à candidatures, missions et bourses. Les échéances passées disparaissent d'elles-mêmes de cette liste."
      >
        {domaines.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <Filtre
                key={d}
                href={domaine === d ? "/opportunites" : `/opportunites?domaine=${encodeURIComponent(d)}`}
                actif={domaine === d}
              >
                {d}
              </Filtre>
            ))}
          </div>
        )}
      </EnTete>

      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
        {liste.length === 0 ? (
          <div className="rounded-carte border border-ligne bg-brume p-8 text-center">
            <p className="t-h3">{domaine ? "Rien dans ce domaine pour l'instant" : "Aucune opportunité ouverte"}</p>
            <p className="mx-auto mt-2 max-w-[48ch] text-gris">
              {domaine ? (
                <Link href="/opportunites" className="font-semibold text-canard">
                  Voir tout
                </Link>
              ) : (
                <>
                  <Link href="/contact" className="font-semibold text-canard">
                    Écrivez-nous
                  </Link>{" "}
                  pour nous en signaler une.
                </>
              )}
            </p>
          </div>
        ) : (
          <Cascade className="grid gap-5 md:grid-cols-2">
            {liste.map((o) => (
              <Element key={o.id}>
              <article className="flex h-full flex-col rounded-carte border border-ligne bg-white p-6 shadow-carte">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="text-[0.78rem] font-semibold text-canard">
                    {o.nature} · {o.domaine}
                  </span>
                  {o.dateLimite && (
                    <span className="rounded-full bg-pastel-soleil px-2.5 py-1 text-[0.72rem] font-semibold text-[#8a5f14]">
                      jusqu&apos;au {formatLong.format(o.dateLimite)}
                    </span>
                  )}
                </div>
                <h2 className="t-h3 mt-2">
                  <Link href={`/opportunites/${o.slug}`} className="no-underline hover:text-canard">
                    {o.titre}
                  </Link>
                </h2>
                <p className="mt-1 text-[0.88rem] text-gris">
                  {o.organisation}
                  {o.lieu ? ` · ${o.lieu}` : ""}
                </p>
                {o.description && <p className="mt-3 line-clamp-3 text-[0.9rem] text-gris">{o.description}</p>}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-ligne pt-4">
                  <Link href={`/opportunites/${o.slug}`} className="text-[0.88rem] font-semibold text-marine">
                    Voir le détail →
                  </Link>
                  {utilisateur && (
                    <form action={basculerFavori}>
                      <input type="hidden" name="nature" value="opportunite" />
                      <input type="hidden" name="cible" value={o.id} />
                      <input type="hidden" name="retour" value={domaine ? `/opportunites?domaine=${domaine}` : "/opportunites"} />
                      <Bouton type="submit" variante={favoris.has(o.id) ? "marine" : "contourMarine"} taille="sm">
                        {favoris.has(o.id) ? "Retirer des favoris" : "Mettre de côté"}
                      </Bouton>
                    </form>
                  )}
                </div>
              </article>
              </Element>
            ))}
          </Cascade>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
