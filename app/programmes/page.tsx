import type { Metadata } from "next";
import Link from "next/link";

import { LigneProgramme } from "@/components/CarteProgramme";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { listerProgrammes } from "@/lib/catalogue";
import { DOMAINES, FORMATS, LIBELLE_FORMAT, LIBELLE_NATURE, NATURES } from "@/lib/vocabulaire";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Masterclasses, formations et certifications SCG : finance, stratégie, secteur public, digital, ressources humaines, entrepreneuriat.",
};

function Filtre({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={`inline-block rounded-full border px-[13px] py-1.5 text-[0.79rem] font-semibold no-underline transition-colors ${
        actif
          ? "border-laiton bg-laiton text-[#1a1204]"
          : "border-white/22 bg-white/7 text-[#dce7f1] hover:border-laiton/60"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function Programmes(props: PageProps<"/programmes">) {
  const params = await props.searchParams;
  const lire = (cle: string) => {
    const v = params[cle];
    return Array.isArray(v) ? v[0] : v;
  };

  const domaine = lire("domaine");
  const nature = lire("nature");
  const format = lire("format");
  const ouvertes = lire("statut") === "ouvertes";

  const programmes = await listerProgrammes({ domaine, nature, format, ouvertes });

  /* Les filtres vivent dans l'URL, pas dans un état de composant : une
     sélection se partage, se met en favori et s'indexe. Rappuyer sur un
     filtre actif le retire. */
  const lien = (cle: string, valeur: string) => {
    const actuel: Record<string, string | undefined> = {
      domaine,
      nature,
      format,
      statut: ouvertes ? "ouvertes" : undefined,
    };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(actuel)) if (v) q.set(k, v);
    if (q.get(cle) === valeur) q.delete(cle);
    else q.set(cle, valeur);
    const s = q.toString();
    return s ? `/programmes?${s}` : "/programmes";
  };

  const filtreActif = Boolean(domaine || nature || format || ouvertes);

  return (
    <>
      <div
        className="pb-7"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 70%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/programmes" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Catalogue</p>
          <h1 className="t-h2 mt-1.5 text-white">
            Six domaines, <em className="t-italique text-laiton">trois formats</em>
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            {DOMAINES.map((d) => (
              <Filtre key={d} href={lien("domaine", d)} actif={domaine === d}>
                {d}
              </Filtre>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {NATURES.map((n) => (
              <Filtre key={n} href={lien("nature", n)} actif={nature === n}>
                {LIBELLE_NATURE[n]}
              </Filtre>
            ))}
            {FORMATS.map((f) => (
              <Filtre key={f} href={lien("format", f)} actif={format === f}>
                {LIBELLE_FORMAT[f]}
              </Filtre>
            ))}
            <Filtre href={lien("statut", "ouvertes")} actif={ouvertes}>
              Inscriptions ouvertes
            </Filtre>
          </div>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <p className="t-balise m-0 text-gris">
              {programmes.length} résultat{programmes.length > 1 ? "s" : ""} · classés par date
              d&apos;ouverture
            </p>
            {filtreActif && (
              <Link href="/programmes" className="text-[0.82rem] font-semibold text-marine">
                Tout afficher
              </Link>
            )}
          </div>

          {programmes.length === 0 ? (
            <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
              {filtreActif ? (
                <>
                  Aucun programme ne correspond à ces filtres.{" "}
                  <Link href="/programmes" className="font-semibold text-marine">
                    Retirez-les
                  </Link>{" "}
                  ou{" "}
                  <Link href="/contact" className="font-semibold text-marine">
                    dites-nous ce que vous cherchez
                  </Link>{" "}
                  – nous construisons aussi des sessions sur mesure.
                </>
              ) : (
                <>
                  Aucun programme n&apos;est publié pour le moment.{" "}
                  <Link href="/contact" className="font-semibold text-marine">
                    Écrivez-nous
                  </Link>{" "}
                  pour être prévenu de l&apos;ouverture des prochaines sessions.
                </>
              )}
            </p>
          ) : (
            <ol className="m-0 list-none border-t border-[rgba(6,24,47,.16)] pl-0">
              {programmes.map((p, i) => (
                <LigneProgramme key={p.slug} programme={p} rang={i + 1} />
              ))}
            </ol>
          )}
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
