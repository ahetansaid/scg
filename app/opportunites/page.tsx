import type { Metadata } from "next";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
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
    ? new Set(
        (await mesFavoris(utilisateur.id))
          .filter((f) => f.nature === "opportunite")
          .map((f) => f.cibleId),
      )
    : new Set<string>();

  return (
    <>
      <div
        className="pb-8"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 70%,#0b2e5b 100%)",
        }}
      >
        <Navigation />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Opportunités</p>
          <h1 className="t-h2 mt-1.5 text-white">
            Ce qui <em className="t-italique text-laiton">s&apos;ouvre</em>
          </h1>
          <p className="mt-3 max-w-[54ch] text-[#b9cddf]">
            Appels à candidatures, missions et bourses. Les échéances passées disparaissent
            d&apos;elles-mêmes de cette liste.
          </p>

          {domaines.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {domaines.map((d) => (
                <Link
                  key={d}
                  href={
                    domaine === d ? "/opportunites" : `/opportunites?domaine=${encodeURIComponent(d)}`
                  }
                  aria-current={domaine === d ? "true" : undefined}
                  className={`inline-block rounded-full border px-[13px] py-1.5 text-[0.79rem] font-semibold no-underline transition-colors ${
                    domaine === d
                      ? "border-laiton bg-laiton text-[#1a1204]"
                      : "border-white/22 bg-white/7 text-[#dce7f1] hover:border-laiton/60"
                  }`}
                >
                  {d}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
          {liste.length === 0 ? (
            <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
              {domaine ? (
                <>
                  Aucune opportunité ouverte dans ce domaine.{" "}
                  <Link href="/opportunites" className="font-semibold text-marine">
                    Voir tout
                  </Link>
                  .
                </>
              ) : (
                <>
                  Aucune opportunité ouverte pour le moment.{" "}
                  <Link href="/contact" className="font-semibold text-marine">
                    Écrivez-nous
                  </Link>{" "}
                  pour nous en signaler une.
                </>
              )}
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-4 pl-0">
              {liste.map((o) => (
                <li
                  key={o.id}
                  className="rounded-carte border border-ligne bg-white p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="t-balise text-[0.58rem] text-laiton-fonce">
                        {o.nature} · {o.domaine}
                        {o.lieu ? ` · ${o.lieu}` : ""}
                      </p>
                      <h2 className="t-italique mt-1.5 text-[1.3rem] leading-tight">
                        <Link
                          href={`/opportunites/${o.slug}`}
                          className="text-encre no-underline hover:text-marine"
                        >
                          {o.titre}
                        </Link>
                      </h2>
                      <p className="mt-1 text-[0.86rem] text-gris">{o.organisation}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {o.dateLimite && (
                        <span className="t-balise text-[0.58rem] text-gris">
                          jusqu&apos;au {formatLong.format(o.dateLimite)}
                        </span>
                      )}
                      {utilisateur && (
                        <form action={basculerFavori}>
                          <input type="hidden" name="nature" value="opportunite" />
                          <input type="hidden" name="cible" value={o.id} />
                          <input
                            type="hidden"
                            name="retour"
                            value={domaine ? `/opportunites?domaine=${domaine}` : "/opportunites"}
                          />
                          <Bouton
                            type="submit"
                            variante={favoris.has(o.id) ? "marine" : "fantomeClair"}
                            taille="sm"
                          >
                            {favoris.has(o.id) ? "Retirer des favoris" : "Mettre de côté"}
                          </Bouton>
                        </form>
                      )}
                    </div>
                  </div>

                  {o.description && (
                    <p className="mt-3 max-w-[70ch] text-[0.9rem] text-gris">{o.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
