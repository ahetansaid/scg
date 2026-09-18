import type { Metadata } from "next";
import Link from "next/link";

import { Cascade, Element } from "@/components/Animations";
import { EnTete, Filtre } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { CarteProgramme } from "@/components/Vitrine";
import { PHOTOS } from "@/lib/photos";
import { listerProgrammes } from "@/lib/catalogue";
import { DOMAINES, FORMATS, LIBELLE_FORMAT, LIBELLE_NATURE, NATURES, pluriel } from "@/lib/vocabulaire";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Masterclasses, formations et certifications SCG : finance, stratégie, secteur public, digital, ressources humaines, entrepreneuriat.",
};

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

  /* Les filtres vivent dans l'URL : une sélection se partage et s'indexe.
     Rappuyer sur un filtre actif le retire. */
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
      <EnTete
        photo={PHOTOS.formation}
        actif="/programmes"
        sur="Catalogue"
        titre="Trois domaines, trois formats"
        souligne="trois formats"
        sous="Masterclasses courtes, formations de quelques jours, certifications sur plusieurs semaines. Toutes animées par des praticiens en exercice."
      >
        <div className="flex flex-wrap gap-2">
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
      </EnTete>

      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[0.9rem] text-gris">
            <strong className="text-marine">{programmes.length}</strong>{" "}
            {pluriel(programmes.length, "programme")}
            {filtreActif ? " pour ces filtres" : ""}
          </p>
          {filtreActif && (
            <Link href="/programmes" className="text-[0.88rem] font-semibold text-canard">
              Tout afficher
            </Link>
          )}
        </div>

        {programmes.length === 0 ? (
          <div className="rounded-carte border border-ligne bg-brume p-8 text-center">
            <p className="t-h3">
              {filtreActif ? "Rien pour ces filtres" : "Aucun programme publié pour le moment"}
            </p>
            <p className="mx-auto mt-2 max-w-[48ch] text-gris">
              {filtreActif ? (
                <>
                  <Link href="/programmes" className="font-semibold text-canard">
                    Retirez les filtres
                  </Link>{" "}
                  ou{" "}
                  <Link href="/contact" className="font-semibold text-canard">
                    dites-nous ce que vous cherchez
                  </Link>{" "}
                  : nous construisons aussi des sessions sur mesure.
                </>
              ) : (
                <>
                  <Link href="/contact" className="font-semibold text-canard">
                    Écrivez-nous
                  </Link>{" "}
                  pour être prévenu de l&apos;ouverture des prochaines sessions.
                </>
              )}
            </p>
          </div>
        ) : (
          <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {programmes.map((p) => (
              <Element key={p.slug}>
                <CarteProgramme programme={p} />
              </Element>
            ))}
          </Cascade>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
