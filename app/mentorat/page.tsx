import type { Metadata } from "next";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { domainesDeMentorat, listerMentors } from "@/lib/mentorat";
import { pluriel } from "@/lib/vocabulaire";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mentorat",
  description:
    "Un réseau de dirigeants en poste qui ouvrent quelques créneaux par mois aux membres de SCG.",
};

const DEGRADES = [
  "linear-gradient(135deg,#164a85,#3e8fc1)",
  "linear-gradient(135deg,#8a5f14,#d89b34)",
  "linear-gradient(135deg,#0b2e5b,#1f6b4a)",
  "linear-gradient(135deg,#3a2350,#164a85)",
];

export default async function Mentorat(props: PageProps<"/mentorat">) {
  const params = await props.searchParams;
  const v = params.domaine;
  const domaine = Array.isArray(v) ? v[0] : v;

  const [mentors, domaines] = await Promise.all([listerMentors(domaine), domainesDeMentorat()]);

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
        <Navigation actif="/mentorat" />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Réseau</p>
          <h1 className="t-h2 mt-1.5 text-white">
            Des praticiens <em className="t-italique text-laiton">en exercice</em>
          </h1>
          <p className="mt-3 max-w-[54ch] text-[#b9cddf]">
            Chaque mentor ouvre un nombre limité de créneaux par mois. C&apos;est délibéré : un
            mentor disponible pour tout le monde n&apos;est disponible pour personne.
          </p>

          {domaines.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {domaines.map((d) => (
                <Link
                  key={d}
                  href={domaine === d ? "/mentorat" : `/mentorat?domaine=${encodeURIComponent(d)}`}
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
          {mentors.length === 0 ? (
            <p className="rounded-carte border border-ligne bg-white p-6 text-gris">
              {domaine ? (
                <>
                  Aucun mentor publié dans ce domaine.{" "}
                  <Link href="/mentorat" className="font-semibold text-marine">
                    Voir tout l&apos;annuaire
                  </Link>
                  .
                </>
              ) : (
                <>
                  L&apos;annuaire des mentors n&apos;est pas encore ouvert.{" "}
                  <Link href="/contact" className="font-semibold text-marine">
                    Écrivez-nous
                  </Link>{" "}
                  pour être prévenu, ou pour proposer votre candidature comme mentor.
                </>
              )}
            </p>
          ) : (
            <ul className="m-0 grid list-none gap-4 pl-0 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((m, i) => (
                <li key={m.slug}>
                  <Link
                    href={`/mentorat/${m.slug}`}
                    className="flex h-full flex-col gap-2.5 rounded-carte border border-ligne bg-white p-5 no-underline transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                  >
                    <span
                      className="t-italique flex size-[52px] items-center justify-center rounded-[14px] text-[1.32rem] text-white"
                      style={{ background: DEGRADES[i % DEGRADES.length] }}
                      aria-hidden="true"
                    >
                      {m.initiales}
                    </span>
                    <span className="text-[1rem] font-bold tracking-[-0.02em] text-encre">
                      {m.nomComplet}
                    </span>
                    <span className="text-[0.82rem] text-gris">
                      {m.titre}
                      {m.organisation ? ` · ${m.organisation}` : ""}
                    </span>

                    {m.domaines.length > 0 && (
                      <span className="flex flex-wrap gap-1.5">
                        {m.domaines.slice(0, 3).map((d) => (
                          <span
                            key={d}
                            className="t-balise rounded-etiquette bg-azur/12 px-[7px] py-[3px] text-[0.56rem] text-[#1b537c]"
                          >
                            {d}
                          </span>
                        ))}
                      </span>
                    )}

                    <span className="mt-auto flex items-center gap-1.5 border-t border-ligne-douce pt-3 text-[0.78rem]">
                      {m.creneauxLibres > 0 ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="block size-1.5 shrink-0 rounded-full bg-vert"
                          />
                          <span className="text-vert">
                            {m.creneauxLibres} {pluriel(m.creneauxLibres, "créneau", "créneaux")}{" "}
                            {pluriel(m.creneauxLibres, "libre")}
                          </span>
                        </>
                      ) : (
                        <span className="text-gris">Aucun créneau ouvert ce mois</span>
                      )}
                    </span>
                  </Link>
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
