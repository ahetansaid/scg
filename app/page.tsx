import Image from "next/image";
import Link from "next/link";

import {
  Cascade,
  Element,
  Eleve,
  HeroCarte,
  HeroLigne,
  HeroTexte,
  HeroVisuel,
  Reveler,
  Souligne,
} from "@/components/Animations";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { CarteMentor, CarteProgramme, Decoupe, PuceDomaine, TitreSection } from "@/components/Vitrine";
import { listerProgrammes, sessionsDuTrimestre } from "@/lib/catalogue";
import { listerMentors } from "@/lib/mentorat";
import { PHOTOS } from "@/lib/photos";
import { listerArticles } from "@/lib/publications";
import { DOMAINES, formatLong, montant, pluriel } from "@/lib/vocabulaire";

export const revalidate = 600;

export default async function Accueil() {
  const [programmes, sessions, mentors, articles] = await Promise.all([
    listerProgrammes(),
    sessionsDuTrimestre(new Date()),
    listerMentors(),
    listerArticles(),
  ]);

  const prochaine = sessions.find((s) => s.etat === "ouverte" || s.etat === "dernieres") ?? null;

  const annonce = prochaine
    ? {
        texte: `Prochaine session : ${prochaine.programmeTitre}, le ${formatLong.format(prochaine.debut)}.`,
        accent: prochaine.restantes > 0 ? `${prochaine.restantes} ${pluriel(prochaine.restantes, "place")}` : undefined,
        href: `/programmes/${prochaine.programmeSlug}`,
      }
    : { texte: "Masterclasses, formations certifiantes et mentorat pour ceux qui décident." };

  return (
    <>
      <Navigation annonce={annonce} />

      {/* ================================================================ HERO
          Une seule scène animée : le texte monte en trois temps, la photo se
          révèle, la carte de session arrive en dernier. Pas de décor autour. */}
      <section className="relative overflow-hidden bg-brume">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 pt-14 pb-24 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-20 md:pb-32">
          <HeroTexte>
            <HeroLigne>
              <p className="t-sur mb-4 inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block size-2 rounded-full bg-soleil" />
                Cotonou · Conseil et formation de dirigeants
              </p>
            </HeroLigne>
            <HeroLigne>
              <h1 className="t-hero">
                Former ceux qui <Souligne>décident</Souligne>
              </h1>
            </HeroLigne>
            <HeroLigne>
              <p className="mt-6 max-w-[46ch] text-[1.05rem] text-gris">
                Masterclasses, formations certifiantes et mentorat, animés par des praticiens en
                exercice. Pour les dirigeants, cadres publics et entrepreneurs de la sous-région.
              </p>
            </HeroLigne>
            <HeroLigne className="mt-8 flex flex-wrap items-center gap-5">
              <BoutonLien href="/programmes" variante="canard" taille="lg">
                Voir les programmes
              </BoutonLien>
              <Link href="/mentorat" className="text-[0.95rem] font-semibold text-marine no-underline hover:text-canard">
                Trouver un mentor →
              </Link>
            </HeroLigne>
          </HeroTexte>

          <div className="relative mx-auto w-full max-w-[520px]">
            <HeroVisuel>
              <Decoupe src={PHOTOS.hero} alt="" forme="galet" className="aspect-[4/5] w-full" priority />
            </HeroVisuel>

            {/* Carte flottante : la prochaine session réelle, pas un chiffre
                de vitrine. */}
            <HeroCarte className="absolute -bottom-6 -left-4 w-[min(300px,80%)] rounded-carte bg-white p-4 shadow-flottant sm:-left-10">
              {prochaine ? (
                <>
                  <p className="text-[0.74rem] font-semibold text-canard">Prochaine session</p>
                  <p className="mt-1 text-[0.95rem] leading-snug font-bold text-marine">
                    {prochaine.programmeTitre}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-gris">
                    {formatLong.format(prochaine.debut)} · {montant(prochaine.prixFcfa)} FCFA
                  </p>
                  <div className="mt-3">
                    <Cohorte capacite={prochaine.capacite} pris={prochaine.confirmees} compteur />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[0.74rem] font-semibold text-canard">Le calendrier</p>
                  <p className="mt-1 text-[0.95rem] leading-snug font-bold text-marine">
                    Les prochaines sessions arrivent
                  </p>
                  <p className="mt-1 text-[0.8rem] text-gris">
                    Laissez-nous vos coordonnées, nous vous prévenons à l&apos;ouverture.
                  </p>
                </>
              )}
            </HeroCarte>
          </div>
        </div>

        {/* Le grand arrondi blanc qui referme le hero. */}
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-14 rounded-t-[100%_100%] bg-white md:h-20" />
      </section>

      {/* ============================================================ DOMAINES */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
        <TitreSection titre="Nos domaines" souligne="domaines" centre />
        <Cascade className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINES.map((d) => (
            <Element key={d}>
              <PuceDomaine domaine={d} href={`/programmes?domaine=${encodeURIComponent(d)}`} />
            </Element>
          ))}
        </Cascade>
      </section>

      {/* ======================================================= DEUX VOIES */}
      <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6 md:pb-24">
        <Cascade className="grid gap-6 md:grid-cols-2">
          <Element>
            <div className="relative h-full overflow-hidden rounded-grand bg-pastel-soleil p-8 md:p-10 md:pr-32">
              <p className="t-sur">Apprendre avec</p>
              <h3 className="t-h2 mt-1">Des praticiens en exercice</h3>
              <p className="mt-3 max-w-[34ch] text-gris">
                Chaque séance produit un livrable que vous rapportez dans votre structure.
              </p>
              <BoutonLien href="/programmes" variante="canard" className="mt-6">
                Voir les programmes
              </BoutonLien>
              <span className="absolute -top-4 right-8 hidden size-24 overflow-hidden rounded-full ring-8 ring-white md:block">
                <Image src={PHOTOS.atelier} alt="" fill sizes="96px" className="object-cover" />
              </span>
            </div>
          </Element>

          <Element>
            <div className="relative h-full overflow-hidden rounded-grand bg-pastel-ciel p-8 md:p-10 md:pr-32">
              <p className="t-sur">Être accompagné</p>
              <h3 className="t-h2 mt-1">Par un mentor en poste</h3>
              <p className="mt-3 max-w-[34ch] text-gris">
                Quelques créneaux par mois, pour trancher une décision avec quelqu&apos;un qui l&apos;a déjà prise.
              </p>
              <BoutonLien href="/mentorat" variante="canard" className="mt-6">
                Trouver un mentor
              </BoutonLien>
              <span className="absolute -top-4 right-8 hidden size-24 overflow-hidden rounded-full ring-8 ring-white md:block">
                <Image src={PHOTOS.reunion} alt="" fill sizes="96px" className="object-cover" />
              </span>
            </div>
          </Element>
        </Cascade>
      </section>

      {/* ========================================================== PROGRAMMES */}
      <section className="bg-brume">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
          <TitreSection
            sur="Le calendrier"
            titre="Programmes à venir"
            souligne="à venir"
            action={
              <BoutonLien href="/programmes" variante="contour" taille="sm">
                Tout le catalogue
              </BoutonLien>
            }
          />

          {programmes.length === 0 ? (
            <Reveler className="rounded-carte border border-ligne bg-white p-8 text-center">
              <p className="t-h3">Le calendrier arrive</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-gris">
                Aucun programme n&apos;est publié pour le moment.{" "}
                <Link href="/contact" className="font-semibold text-canard">
                  Écrivez-nous
                </Link>{" "}
                pour être prévenu de l&apos;ouverture des prochaines sessions.
              </p>
            </Reveler>
          ) : (
            <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programmes.slice(0, 8).map((p) => (
                <Element key={p.slug}>
                  <CarteProgramme programme={p} />
                </Element>
              ))}
            </Cascade>
          )}
        </div>
      </section>

      {/* ============================================================= MENTORS */}
      {mentors.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
          <TitreSection
            sur="Le réseau"
            titre="Des mentors en exercice"
            souligne="en exercice"
            action={
              <BoutonLien href="/mentorat" variante="contour" taille="sm">
                Tout l&apos;annuaire
              </BoutonLien>
            }
          />
          <Cascade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.slice(0, 4).map((m) => (
              <Element key={m.slug}>
                <CarteMentor mentor={m} />
              </Element>
            ))}
          </Cascade>
        </section>
      )}

      {/* ========================================================= PUBLICATIONS */}
      {articles.length > 0 && (
        <section className="bg-brume">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
            <TitreSection
              sur="Publications"
              titre="Ce que le cabinet écrit"
              souligne="écrit"
              action={
                <BoutonLien href="/publications" variante="contour" taille="sm">
                  Toutes les publications
                </BoutonLien>
              }
            />
            <Cascade className="grid gap-5 md:grid-cols-3">
              {articles.slice(0, 3).map((a) => (
                <Element key={a.slug}>
                  <Eleve className="h-full">
                    <Link
                      href={`/publications/${a.slug}`}
                      className="flex h-full flex-col gap-2 rounded-carte border border-ligne bg-white p-6 no-underline shadow-carte"
                    >
                      <span className="text-[0.78rem] font-semibold text-canard">{a.categorie}</span>
                      <span className="t-h3">{a.titre}</span>
                      {a.chapo && <span className="line-clamp-3 text-[0.88rem] text-gris">{a.chapo}</span>}
                      <span className="mt-auto pt-3 text-[0.8rem] text-gris">
                        {a.minutesLecture > 0 ? `${a.minutesLecture} min de lecture` : ""}
                        {a.publieAt ? ` · ${formatLong.format(a.publieAt)}` : ""}
                      </span>
                    </Link>
                  </Eleve>
                </Element>
              ))}
            </Cascade>
          </div>
        </section>
      )}

      {/* ============================================================== APPEL */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
        <Reveler y={24}>
          <div className="rounded-grand bg-marine px-8 py-12 text-white md:px-14 md:py-16">
            <div className="grid items-center gap-8 md:grid-cols-[1.4fr_auto]">
              <div>
                <h2 className="text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight font-extrabold tracking-[-0.02em]">
                  Une session sur mesure pour vos équipes ?
                </h2>
                <p className="mt-3 max-w-[52ch] text-white/80">
                  Nous construisons aussi des cycles fermés, dans vos locaux ou à distance, sur les
                  sujets qui bloquent vraiment.
                </p>
              </div>
              <BoutonLien href="/contact" variante="clair" taille="lg">
                Nous écrire
              </BoutonLien>
            </div>
          </div>
        </Reveler>
      </section>

      <PiedDePage />
    </>
  );
}
