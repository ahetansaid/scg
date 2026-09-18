import Image from "next/image";
import Link from "next/link";

import {
  Cascade,
  Element,
  Eleve,
  Defilement,
  Flotte,
  HeroCarte,
  HeroLigne,
  HeroTexte,
  HeroVisuel,
  Mots,
  Parallaxe,
  Reveler,
  Souligne,
} from "@/components/Animations";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { CarteMentor, CarteProgramme, Decoupe, TitreSection } from "@/components/Vitrine";
import { listerProgrammes, sessionsDuTrimestre } from "@/lib/catalogue";
import { listerMentors } from "@/lib/mentorat";
import { PHOTOS, portrait } from "@/lib/photos";
import { listerArticles } from "@/lib/publications";
import { DOMAINES, formatLong, LIBELLE_NATURE, montant, NATURES, pluriel } from "@/lib/vocabulaire";

export const revalidate = 600;

/* Le parcours réel d'un participant sur la plateforme, en trois temps. */
const ETAPES = [
  {
    numero: "01",
    titre: "Vous choisissez une session",
    texte: "Masterclass d'une journée, formation de quelques jours ou certification sur plusieurs semaines : chaque fiche donne les dates, le lieu, le prix et les places restantes.",
  },
  {
    numero: "02",
    titre: "Vous réservez, nous confirmons",
    texte: "Votre place est retenue le temps que le cabinet valide l'inscription. Vous suivez tout depuis votre espace : programme, séances, documents.",
  },
  {
    numero: "03",
    titre: "Vous repartez avec une pièce de travail",
    texte: "Un livrable construit sur votre propre cas, et pour les certifications, un certificat au numéro vérifiable en ligne.",
  },
] as const;

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

  const visages = mentors.slice(0, 4);

  return (
    <>
      <Navigation annonce={annonce} />

      {/* ================================================================ HERO
          Titre à pleine taille, une photo en arche qui glisse au défilement,
          deux repères posés dessus : le certificat, la prochaine session. */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-[-10%] right-[-10%] h-[70%] w-[55%] rounded-full opacity-80 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #e8f3ff, transparent 70%)" }}
        />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-24">
          <HeroTexte>
            <HeroLigne>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ligne bg-white px-3.5 py-1.5 text-[0.8rem] font-semibold text-marine">
                <span aria-hidden="true" className="inline-block size-2 rounded-full bg-canard" />
                Cotonou · Conseil et formation de dirigeants
              </p>
            </HeroLigne>
            <h1 className="t-hero">
              <Mots texte="Former ceux" au="chargement" delai={0.1} />
              <br className="hidden md:block" />{" "}
              <HeroLigne balise="span" className="mot-image">
                <Image src={PHOTOS.atelier} alt="" fill sizes="120px" className="object-cover" priority />
              </HeroLigne>{" "}
              <Mots texte="qui" au="chargement" delai={0.3} />{" "}
              <HeroLigne balise="span" className="inline-block">
                <Souligne>décident</Souligne>
              </HeroLigne>
            </h1>
            <HeroLigne>
              <p className="mt-7 max-w-[44ch] text-[1.08rem] leading-relaxed text-gris">
                Masterclasses, formations certifiantes et mentorat, animés par des praticiens en
                exercice. Pour les dirigeants, cadres publics et entrepreneurs de la sous-région.
              </p>
            </HeroLigne>
            <HeroLigne className="mt-8 flex flex-wrap items-center gap-4">
              <BoutonLien href="/programmes" variante="canard" taille="lg">
                Voir les programmes
              </BoutonLien>
              <BoutonLien href="#parcours" variante="contourMarine" taille="lg">
                Comment ça se passe
              </BoutonLien>
            </HeroLigne>
            <HeroLigne className="mt-10 flex items-center gap-4">
              {visages.length > 0 ? (
                <>
                  <span className="flex -space-x-3">
                    {visages.map((m) => (
                      <span key={m.slug} className="relative block size-10 overflow-hidden rounded-full ring-[3px] ring-white">
                        <Image src={portrait(m.slug, m.avatarUrl)} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                    ))}
                  </span>
                  <span className="text-[0.88rem] text-gris">
                    <Link href="/mentorat" className="font-semibold text-marine no-underline hover:text-canard">
                      {mentors.length} {pluriel(mentors.length, "mentor")} en poste
                    </Link>{" "}
                    {pluriel(mentors.length, "ouvre", "ouvrent")} des créneaux chaque mois.
                  </span>
                </>
              ) : (
                <span className="flex flex-wrap gap-2">
                  {NATURES.map((n) => (
                    <Link
                      key={n}
                      href={`/programmes?nature=${n}`}
                      className="rounded-full bg-brume px-3 py-1 text-[0.8rem] font-semibold text-marine no-underline hover:bg-brume-2"
                    >
                      {LIBELLE_NATURE[n]}
                    </Link>
                  ))}
                </span>
              )}
            </HeroLigne>
          </HeroTexte>

          <div className="relative mx-auto w-full max-w-[500px] pt-6 md:pt-0">
            <HeroVisuel>
              <Parallaxe distance={-40}>
                <Decoupe src={PHOTOS.hero} alt="" forme="arche" className="aspect-[4/5] w-full" priority />
              </Parallaxe>
            </HeroVisuel>

            <Flotte delai={0.9} className="absolute top-8 -right-3 flex items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-2 shadow-flottant sm:-right-8">
              <span className="flex size-8 items-center justify-center rounded-full bg-canard text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[0.82rem] leading-tight font-semibold text-marine">
                Certificat
                <br />
                <span className="font-medium text-gris">vérifiable en ligne</span>
              </span>
            </Flotte>

            <HeroCarte className="absolute -bottom-5 -left-3 w-[min(300px,82%)] rounded-carte bg-white p-4 shadow-flottant sm:-left-10">
              {prochaine ? (
                <>
                  <p className="text-[0.74rem] font-semibold text-canard">Prochaine session</p>
                  <p className="mt-1 text-[0.95rem] leading-snug font-bold text-marine">
                    <Link href={`/programmes/${prochaine.programmeSlug}`} className="no-underline hover:text-canard">
                      {prochaine.programmeTitre}
                    </Link>
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
                    <Link href="/contact" className="font-semibold text-canard no-underline">
                      Laissez-nous vos coordonnées
                    </Link>
                    , nous vous prévenons à l&apos;ouverture.
                  </p>
                </>
              )}
            </HeroCarte>
          </div>
        </div>
      </section>

      {/* ============================================================= BANDEAU
          Les six domaines défilent : c'est le sommaire du catalogue. */}
      <div className="border-y border-ligne bg-white py-4">
        <Defilement>
          {DOMAINES.map((d) => (
            <Link
              key={d}
              href={`/programmes?domaine=${encodeURIComponent(d)}`}
              className="flex items-center gap-6 pr-6 text-[1.05rem] font-bold whitespace-nowrap text-marine no-underline hover:text-canard"
            >
              {d}
              <span aria-hidden="true" className="inline-block size-2 rounded-full bg-soleil" />
            </Link>
          ))}
        </Defilement>
      </div>

      {/* ================================================================ BENTO
          Ce que la plateforme contient, en une grille inégale : la formation
          prend la grande case, le reste s'organise autour. */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
        <TitreSection sur="La plateforme" titre="Tout ce qu'il faut pour décider mieux" souligne="décider mieux" />
        <Cascade className="grid gap-4 md:grid-cols-12 md:grid-rows-2">
          <Element className="relative min-h-[380px] overflow-hidden rounded-grand md:col-span-7 md:row-span-2">
            <Image src={PHOTOS.formation} alt="" fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-nuit/90 via-nuit/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
              <p className="text-[0.8rem] font-semibold text-soleil">Masterclasses et formations</p>
              <h3 className="mt-2 max-w-[18ch] text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight font-extrabold tracking-[-0.02em]">
                Des praticiens en exercice, des cas réels, un livrable par séance
              </h3>
              <BoutonLien href="/programmes" variante="clair" className="mt-5">
                Voir le catalogue
              </BoutonLien>
            </div>
          </Element>

          <Element className="relative overflow-hidden rounded-grand bg-pastel-ciel p-7 md:col-span-5">
            <p className="text-[0.8rem] font-semibold text-canard">Mentorat</p>
            <h3 className="t-h3 mt-2 text-[1.35rem]">Un dirigeant en poste, quelques créneaux par mois</h3>
            <p className="mt-2 max-w-[36ch] text-[0.9rem] text-gris">
              Pour trancher une décision avec quelqu&apos;un qui l&apos;a déjà prise.
            </p>
            <Link href="/mentorat" className="mt-4 inline-block text-[0.88rem] font-semibold text-marine no-underline hover:text-canard">
              Trouver un mentor →
            </Link>
            <span className="absolute -right-4 -bottom-6 hidden size-28 overflow-hidden rounded-full ring-8 ring-white md:block">
              <Image src={PHOTOS.reunion} alt="" fill sizes="112px" className="object-cover" />
            </span>
          </Element>

          <Element className="rounded-grand bg-pastel-soleil p-7 md:col-span-3">
            <p className="text-[0.8rem] font-semibold text-[#8a5f14]">Certifications</p>
            <h3 className="t-h3 mt-2 text-[1.2rem]">Un numéro vérifiable en ligne</h3>
            <p className="mt-2 text-[0.88rem] text-gris">Présence contrôlée, projet réel, soutenance.</p>
          </Element>

          <Element className="rounded-grand bg-marine p-7 text-white md:col-span-2">
            <p className="text-[0.8rem] font-semibold text-soleil">Publications</p>
            <h3 className="mt-2 text-[1.2rem] leading-tight font-extrabold tracking-[-0.02em]">Ce que le cabinet écrit</h3>
            <Link href="/publications" className="mt-4 inline-block text-[0.85rem] font-semibold text-white/85 no-underline hover:text-white">
              Lire →
            </Link>
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

      {/* ============================================================ PARCOURS */}
      <section id="parcours" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
        <TitreSection sur="Comment ça se passe" titre="Trois temps, pas plus" souligne="pas plus" />
        <Cascade className="grid gap-8 md:grid-cols-3 md:gap-6">
          {ETAPES.map((e, i) => (
            <Element key={e.numero} className="relative border-t-2 border-marine pt-6">
              <span className="t-chiffres block text-[3.4rem] leading-none font-extrabold tracking-[-0.04em] text-soleil">
                {e.numero}
              </span>
              <h3 className="t-h3 mt-4">{e.titre}</h3>
              <p className="mt-2 text-[0.92rem] text-gris">{e.texte}</p>
              {i < ETAPES.length - 1 && (
                <span aria-hidden="true" className="absolute top-[-9px] right-0 hidden size-4 rounded-full border-2 border-marine bg-white md:block" />
              )}
            </Element>
          ))}
        </Cascade>
      </section>

      {/* =========================================================== MANIFESTE
          Le sommet du défilement : une phrase, en grand, mot à mot. */}
      <section className="bg-marine text-white">
        <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 md:py-28">
          <p className="t-manifeste max-w-[22ch]">
            <Mots texte="Nous ne formons pas des auditeurs. Nous préparons des" />{" "}
            <span className="relative inline-block">
              <Souligne>décisions.</Souligne>
            </span>
          </p>
          <Reveler delai={0.4} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.9rem] text-white/70">
            <span>Strategic Consulting Group, Cotonou</span>
            <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-soleil sm:inline-block" />
            <Link href="/le-cabinet" className="font-semibold text-white no-underline hover:text-soleil">
              Qui nous sommes →
            </Link>
          </Reveler>
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
              {articles.slice(0, 3).map((a, i) => (
                <Element key={a.slug}>
                  <Eleve className="h-full">
                    <Link
                      href={`/publications/${a.slug}`}
                      className="flex h-full flex-col gap-3 rounded-carte border border-ligne bg-white p-6 no-underline shadow-carte"
                    >
                      <span className="flex items-center justify-between">
                        <span className="rounded-full bg-pastel-canard px-2.5 py-1 text-[0.74rem] font-bold text-canard-fonce">
                          {a.categorie}
                        </span>
                        <span className="t-chiffres text-[0.78rem] font-semibold text-gris-clair">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </span>
                      <span className="t-h3 text-[1.2rem]">{a.titre}</span>
                      {a.chapo && <span className="line-clamp-3 text-[0.88rem] text-gris">{a.chapo}</span>}
                      <span className="mt-auto flex items-center justify-between pt-3 text-[0.8rem] text-gris">
                        <span>
                          {a.minutesLecture > 0 ? `${a.minutesLecture} min de lecture` : ""}
                          {a.publieAt ? ` · ${formatLong.format(a.publieAt)}` : ""}
                        </span>
                        <span aria-hidden="true" className="font-semibold text-marine">
                          →
                        </span>
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
          <div className="grid overflow-hidden rounded-grand border border-ligne bg-white md:grid-cols-[1.2fr_1fr]">
            <div className="p-8 md:p-12">
              <p className="t-sur">Pour les organisations</p>
              <h2 className="t-h2 mt-2">Une session sur mesure pour vos équipes ?</h2>
              <p className="mt-3 max-w-[48ch] text-gris">
                Nous construisons aussi des cycles fermés, dans vos locaux ou à distance, sur les
                sujets qui bloquent vraiment.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <BoutonLien href="/contact" variante="canard" taille="lg">
                  Nous écrire
                </BoutonLien>
                <BoutonLien href="/le-cabinet" variante="contourMarine" taille="lg">
                  Le cabinet
                </BoutonLien>
              </div>
            </div>
            <div className="relative min-h-[240px]">
              <Image src={PHOTOS.equipe} alt="" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
            </div>
          </div>
        </Reveler>
      </section>

      <PiedDePage />
    </>
  );
}
