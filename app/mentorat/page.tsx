import type { Metadata } from "next";
import Link from "next/link";

import { EnTete, Filtre } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { CarteMentor } from "@/components/Vitrine";
import { domainesDeMentorat, listerMentors } from "@/lib/mentorat";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mentorat",
  description: "Un réseau de dirigeants en poste qui ouvrent quelques créneaux par mois aux membres de SCG.",
};

export default async function Mentorat(props: PageProps<"/mentorat">) {
  const params = await props.searchParams;
  const v = params.domaine;
  const domaine = Array.isArray(v) ? v[0] : v;

  const [mentors, domaines] = await Promise.all([listerMentors(domaine), domainesDeMentorat()]);

  return (
    <>
      <EnTete
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.map((m) => (
              <CarteMentor key={m.slug} mentor={m} />
            ))}
          </div>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
