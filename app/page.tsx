import Link from "next/link";

import { CarteProgramme } from "@/components/CarteProgramme";
import { Arc, type Pole } from "@/components/motifs/Arc";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Ruban, type EntreeRuban } from "@/components/motifs/Ruban";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { Etiquette } from "@/components/ui/Etiquette";
import { listerProgrammes, sessionsDuTrimestre } from "@/lib/catalogue";
import { listerMentors } from "@/lib/mentorat";
import { montant, pluriel } from "@/lib/vocabulaire";

/* La page se reconstruit toutes les dix minutes : le catalogue bouge à
   l'échelle de la semaine, pas de la seconde. */
export const revalidate = 600;

const POLES: Pole[] = [
  { action: "Diagnostiquer", titre: "Publications" },
  { action: "Apprendre", titre: "Masterclasses" },
  { action: "Certifier", titre: "Formations" },
  { action: "Accompagner", titre: "Mentorat" },
];

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/* Le ruban déplie douze semaines à partir d'aujourd'hui. Chaque session est
   placée par sa semaine de début et de fin : c'est la durée réelle qui
   dessine le bloc, pas une largeur choisie à la main. */
function construireRuban(
  sessions: Awaited<ReturnType<typeof sessionsDuTrimestre>>,
  origine: Date,
): { mois: [string, string, string]; entrees: EntreeRuban[] } {
  const semaine = (d: Date) =>
    Math.floor((d.getTime() - origine.getTime()) / (7 * 24 * 3600 * 1000)) + 1;

  const mois = [0, 1, 2].map((n) => {
    const d = new Date(origine);
    d.setMonth(d.getMonth() + n);
    return MOIS[d.getMonth()]!.replace(/^./, (c) => c.toUpperCase());
  }) as [string, string, string];

  /* Trois lignes d'empilement : on pose chaque session sur la première ligne
     encore libre à cette date, pour éviter les chevauchements. */
  const finLigne = [0, 0, 0];

  const entrees = sessions.slice(0, 8).map((s): EntreeRuban => {
    const debut = Math.min(12, Math.max(1, semaine(s.debut)));
    const fin = Math.min(12, Math.max(debut, semaine(s.fin)));
    const ligne = (finLigne.findIndex((f) => f < debut) + 1 || 1) as 1 | 2 | 3;
    finLigne[ligne - 1] = fin;

    return {
      titre: s.programmeTitre,
      detail: `${s.debutCourt}${s.restantes > 0 ? ` · ${s.restantes} ${pluriel(s.restantes, "place")}` : " · complet"}`,
      semaineDebut: debut,
      semaineFin: fin,
      ligne,
      ton: s.etat === "complete" || s.etat === "close" ? "aVenir" : s.etat === "dernieres" ? "dernieres" : "ouvert",
      href: `/programmes/${s.programmeSlug}`,
    };
  });

  return { mois, entrees };
}

export default async function Accueil() {
  const origine = new Date();
  const [programmes, sessions, mentors] = await Promise.all([
    listerProgrammes(),
    sessionsDuTrimestre(origine),
    listerMentors(),
  ]);

  const phare = programmes.find((p) => p.prochaine?.etat === "dernieres") ?? programmes[0] ?? null;
  const autres = programmes.filter((p) => p.slug !== phare?.slug).slice(0, 3);
  const s = phare?.prochaine ?? null;
  const ruban = construireRuban(sessions, origine);

  return (
    <>
      {/* ------------------------------------------------------------- nuit */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(80% 62% at 50% 118%, rgba(216,155,52,.46) 0%, rgba(216,155,52,0) 62%)," +
            "radial-gradient(66% 52% at 86% -4%, rgba(62,143,193,.34) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 58%,#0b2e5b 100%)",
        }}
      >
        <Navigation />

        <div className="relative z-[3] mx-auto max-w-[1010px] px-4 pt-10 pb-6 sm:px-8 md:pt-16">
          <p className="t-balise text-laiton">Cotonou · Conseil et formation de dirigeants</p>
          <h1 className="t-display mt-3.5 max-w-[13ch] text-white">
            Former ceux qui <em className="t-italique text-laiton">décident</em>
          </h1>
          <p className="mt-4 max-w-[44ch] text-[#b9cddf]">
            Un cabinet fait passer une organisation d&apos;un point à un autre. Nos quatre pôles
            jalonnent ce trajet.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <BoutonLien href="/programmes" variante="laiton">
              Le trimestre en cours
            </BoutonLien>
            <BoutonLien href="/mentorat" variante="fantomeNuit">
              Trouver un mentor
            </BoutonLien>
          </div>
        </div>

        <Arc poles={POLES} />
      </section>

      {/* ----------------------------------------------------------- papier */}
      {ruban.entrees.length > 0 && (
        <section className="bg-papier">
          <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-balise text-laiton-fonce">
                  {ruban.mois[0]} → {ruban.mois[2]}
                </p>
                <h2 className="t-h2 mt-1.5">
                  Le trimestre, <em className="t-italique text-laiton-fonce">déplié</em>
                </h2>
              </div>
              <Link href="/programmes" className="text-[0.82rem] font-semibold text-marine">
                Calendrier complet →
              </Link>
            </div>

            <Ruban mois={ruban.mois} entrees={ruban.entrees} />

            <p className="t-balise mt-3 text-gris">
              Plein = inscriptions ouvertes · Ochre = dernières places · Contour = complet ou clos
            </p>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- laiton */}
      {phare && s && (
        <section className="bg-laiton">
          <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-balise text-[#4a340c]">Le cycle du trimestre</p>
                <h2 className="t-h2 mt-1.5 text-nuit">{phare.domaine}</h2>
              </div>
              <Link href="/programmes" className="text-[0.82rem] font-semibold text-nuit">
                Tous les programmes →
              </Link>
            </div>

            <div className="grid items-stretch gap-6 md:grid-cols-[1.15fr_0.85fr]">
              <article className="relative flex flex-col overflow-hidden rounded-panneau bg-nuit p-6 text-[#dce7f1] sm:p-7">
                <svg
                  viewBox="0 0 200 80"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[14%] -bottom-[52%] w-4/5 opacity-20"
                >
                  <path d="M5 76 C 50 8, 150 8, 195 76" stroke="#d89b34" strokeWidth="3" />
                </svg>

                {s.restantes > 0 && (
                  <div className="relative">
                    <Etiquette etat="bientot" fond="nuit">
                      {s.restantes} {pluriel(s.restantes, "place")}
                    </Etiquette>
                  </div>
                )}

                <h3 className="t-h2 relative mt-3 text-white">{phare.titre}</h3>
                <p className="relative mt-3 max-w-[38ch] text-[0.88rem] text-[#a8c0d6]">
                  {phare.accroche}
                </p>

                {phare.objectifs.length > 0 && (
                  <ol className="relative mt-5 flex list-none flex-col border-t border-white/14 pl-0">
                    {phare.objectifs.slice(0, 4).map((o, i) => (
                      <li
                        key={o}
                        className="grid grid-cols-[26px_1fr] gap-3 border-b border-white/8 py-2 text-[0.83rem]"
                      >
                        <span className="t-balise text-[0.63rem] tracking-[0.1em] text-laiton">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="relative mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                  <div>
                    <p className="t-chiffres m-0 text-[1.5rem] font-extrabold tracking-[-0.035em] text-white">
                      {montant(s.prixFcfa)}{" "}
                      <span className="text-[0.68rem] font-medium tracking-normal text-[#9fb8ce]">
                        FCFA
                      </span>
                    </p>
                    <Cohorte
                      capacite={s.capacite}
                      pris={s.confirmees}
                      fond="nuit"
                      compteur
                      className="mt-2.5"
                    />
                  </div>
                  <BoutonLien href={`/programmes/${phare.slug}`} variante="laiton">
                    Voir le programme
                  </BoutonLien>
                </div>
              </article>

              <div className="flex flex-col justify-center gap-3.5">
                <p className="t-balise text-[#4a340c]">Ce que produit le cycle</p>
                <blockquote className="t-italique m-0 text-[clamp(1.15rem,2.2vw,1.55rem)] leading-[1.25] text-nuit">
                  {phare.description.split(". ")[0]}.
                </blockquote>
                <p className="t-balise text-[#4a340c]">
                  {phare.dureeLibelle} · {s.lieu || s.ville}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- nuit */}
      {mentors.length > 0 && (
        <section className="bg-nuit">
          <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-balise text-laiton">Réseau</p>
                <h2 className="t-h2 mt-1.5 text-white">
                  Des praticiens <em className="t-italique text-laiton">en exercice</em>
                </h2>
              </div>
              <Link href="/mentorat" className="text-[0.82rem] font-semibold text-azur">
                Parcourir l&apos;annuaire →
              </Link>
            </div>

            <div className="grid grid-cols-4 items-start gap-3.5 max-md:grid-cols-2">
              {mentors.slice(0, 4).map((m, i) => (
                <Link
                  key={m.slug}
                  href={`/mentorat/${m.slug}`}
                  className="flex flex-col gap-2 rounded-carte border border-white/13 bg-white/4 p-4 no-underline transition-transform duration-200 hover:-translate-y-1 hover:border-laiton/50 motion-reduce:hover:translate-y-0"
                  style={{ marginTop: i === 0 || i === 3 ? "38px" : undefined }}
                >
                  <span
                    className="t-italique flex size-[50px] items-center justify-center rounded-[14px] text-[1.32rem] text-white"
                    style={{ background: DEGRADES[i % DEGRADES.length] }}
                    aria-hidden="true"
                  >
                    {m.initiales}
                  </span>
                  <span className="text-[0.94rem] font-bold tracking-[-0.02em] text-white">
                    {m.nomComplet}
                  </span>
                  <span className="text-[0.77rem] text-[#9fb8ce]">{m.titre}</span>
                  <span className="mt-auto flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[0.73rem] text-[#8fc7a9]">
                    <span className="block size-1.5 shrink-0 rounded-full bg-vert-clair" />
                    {m.creneauxLibres} {pluriel(m.creneauxLibres, "créneau", "créneaux")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- papier */}
      {autres.length > 0 && (
        <section className="bg-papier">
          <div className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-balise text-laiton-fonce">Aussi au programme</p>
                <h2 className="t-h2 mt-1.5">
                  D&apos;autres <em className="t-italique text-laiton-fonce">cycles</em>
                </h2>
              </div>
              <Link href="/programmes" className="text-[0.82rem] font-semibold text-marine">
                Le catalogue →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((p) => (
                <CarteProgramme key={p.slug} programme={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue vide : on le dit, plutôt que d'afficher une page creuse. */}
      {programmes.length === 0 && (
        <section className="bg-papier">
          <div className="mx-auto max-w-[1010px] px-4 py-14 sm:px-8">
            <h2 className="t-h2">
              Le calendrier <em className="t-italique text-laiton-fonce">arrive</em>
            </h2>
            <p className="mt-3 max-w-[52ch] text-gris">
              Aucun programme n&apos;est publié pour le moment.{" "}
              <Link href="/contact" className="font-semibold text-marine">
                Dites-nous ce que vous cherchez
              </Link>{" "}
              et nous vous préviendrons à l&apos;ouverture des prochaines sessions.
            </p>
          </div>
        </section>
      )}

      <PiedDePage />
    </>
  );
}

const DEGRADES = [
  "linear-gradient(135deg,#164a85,#3e8fc1)",
  "linear-gradient(135deg,#8a5f14,#d89b34)",
  "linear-gradient(135deg,#0b2e5b,#1f6b4a)",
  "linear-gradient(135deg,#3a2350,#164a85)",
];
