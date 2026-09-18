import type { Metadata } from "next";
import Link from "next/link";

import { Cascade, Element, Reveler } from "@/components/Animations";
import { EnTete, Filtre } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { CarteMentor, TitreSection } from "@/components/Vitrine";
import { PHOTOS } from "@/lib/photos";
import { domainesDeMentorat, listerMentors } from "@/lib/mentorat";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mentorat",
  description: "Un réseau de dirigeants en poste qui ouvrent quelques créneaux par mois aux membres de SCG.",
};

const FONCTIONNEMENT = [
  {
    numero: "01",
    titre: "Vous choisissez un mentor",
    texte: "Par domaine, par fonction, par parcours. Chaque fiche dit ce que la personne fait aujourd'hui, pas seulement ce qu'elle a fait.",
  },
  {
    numero: "02",
    titre: "Vous exposez votre décision",
    texte: "Une demande courte : le contexte, la question, l'échéance. Le mentor accepte, propose un créneau, ou décline.",
  },
  {
    numero: "03",
    titre: "Vous échangez, puis vous tranchez",
    texte: "Un entretien, parfois deux. Le mentor n'a pas de compte à rendre sur votre choix : il vous aide à le faire.",
  },
] as const;

export default async function Mentorat(props: PageProps<"/mentorat">) {
  const params = await props.searchParams;
  const v = params.domaine;
  const domaine = Array.isArray(v) ? v[0] : v;

  const [mentors, domaines] = await Promise.all([listerMentors(domaine), domainesDeMentorat()]);

  return (
    <>
      <EnTete
        photo={PHOTOS.reunion}
        actif="/mentorat"
        sur="Le réseau"
        titre="Des mentors en exercice"
        souligne="en exercice"
        sous="Chaque mentor ouvre un nombre limité de créneaux par mois. C'est délibéré : un mentor disponible pour tout le monde n'est disponible pour personne."
      >
        {domaines.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <Filtre
                key={d}
                href={domaine === d ? "/mentorat" : `/mentorat?domaine=${encodeURIComponent(d)}`}
                actif={domaine === d}
              >
                {d}
              </Filtre>
            ))}
          </div>
        )}
      </EnTete>

      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
        {mentors.length === 0 ? (
          <div className="rounded-carte border border-ligne bg-brume p-8 text-center">
            <p className="t-h3">{domaine ? "Aucun mentor dans ce domaine" : "L'annuaire ouvre bientôt"}</p>
            <p className="mx-auto mt-2 max-w-[48ch] text-gris">
              {domaine ? (
                <>
                  <Link href="/mentorat" className="font-semibold text-canard">
                    Voir tout l&apos;annuaire
                  </Link>
                  .
                </>
              ) : (
                <>
                  <Link href="/contact" className="font-semibold text-canard">
                    Écrivez-nous
                  </Link>{" "}
                  pour être prévenu, ou pour proposer votre candidature comme mentor.
                </>
              )}
            </p>
          </div>
        ) : (
          <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((m) => (
              <Element key={m.slug}>
                <CarteMentor mentor={m} />
              </Element>
            ))}
          </Cascade>
        )}
      </main>

      {/* Comment le mentorat fonctionne ici, en trois temps. */}
      <section className="bg-brume">
        <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 md:py-20">
          <TitreSection sur="Le fonctionnement" titre="Peu de créneaux, bien utilisés" souligne="bien utilisés" />
          <Cascade className="grid gap-6 md:grid-cols-3">
            {FONCTIONNEMENT.map((e) => (
              <Element key={e.numero} className="rounded-grand bg-white p-7 shadow-carte">
                <span className="t-chiffres block text-[2.6rem] leading-none font-extrabold tracking-[-0.04em] text-soleil">
                  {e.numero}
                </span>
                <h3 className="t-h3 mt-4">{e.titre}</h3>
                <p className="mt-2 text-[0.92rem] text-gris">{e.texte}</p>
              </Element>
            ))}
          </Cascade>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 md:py-20">
        <Reveler>
          <div className="grid items-center gap-8 overflow-hidden rounded-grand bg-marine p-8 text-white md:grid-cols-[1.4fr_auto] md:p-12">
            <div>
              <p className="text-[0.8rem] font-semibold text-soleil">Vous dirigez, vous avez du recul</p>
              <h2 className="mt-2 text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-extrabold tracking-[-0.02em]">
                Devenir mentor du réseau
              </h2>
              <p className="mt-3 max-w-[52ch] text-white/80">
                Quelques créneaux par mois, à votre rythme, pour des dirigeants et cadres qui ont une décision
                à prendre. Le cabinet vérifie chaque demande avant de vous la transmettre.
              </p>
            </div>
            <BoutonLien href="/contact?sujet=Devenir%20mentor" variante="clair" taille="lg">
              Proposer ma candidature
            </BoutonLien>
          </div>
        </Reveler>
      </section>

      <PiedDePage />
    </>
  );
}
