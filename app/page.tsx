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
  Reveler,
  Souligne,
} from "@/components/Animations";
import { Cohorte } from "@/components/motifs/Cohorte";
import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { VideoFond } from "@/components/VideoFond";
import { BoutonLien } from "@/components/ui/Bouton";
import { CarteDomaine, CarteMentor, CarteProgramme, Losanges, TitreSection } from "@/components/Vitrine";
import { listerProgrammes, sessionsDuTrimestre } from "@/lib/catalogue";
import { listerMentors } from "@/lib/mentorat";
import { PHOTO_DOMAINE, PHOTOS, portrait, VIDEOS } from "@/lib/photos";
import { listerArticles } from "@/lib/publications";
import { dateCourte, DOMAINES, formatLong, montant, pluriel } from "@/lib/vocabulaire";

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

/* L'offre, en une ligne qui défile sous le hero. */
const OFFRE = [
  { libelle: "Masterclasses", href: "/programmes?nature=masterclass" },
  { libelle: "Formations", href: "/programmes?nature=formation" },
  { libelle: "Certifications", href: "/programmes?nature=certification" },
  { libelle: "Mentorat", href: "/mentorat" },
  { libelle: "Publications", href: "/publications" },
  { libelle: "Opportunités", href: "/opportunites" },
] as const;

/* Les deux repères de la section cabinet. */
const REPERES = [
  {
    titre: "Praticiens en exercice",
    texte: "Chaque intervenant tient un poste aujourd'hui et enseigne sur ses propres cas.",
    icone: <path d="M12 3l8 4-8 4-8-4 8-4zM4 11l8 4 8-4M4 15l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    titre: "Certificat vérifiable",
    texte: "Un numéro unique par certificat, contrôlable en ligne par un employeur ou un partenaire.",
    icone: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
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

  const visages = mentors.slice(0, 4);

  return (
    <>
      <Navigation />

      {/* ================================================================ HERO
          Fond blanc, titre marine à gauche ; à droite, la vidéo découpée en
          biais sur une dalle marine, une photo en contrepoint, la carte de la
          prochaine session posée dessus. Les diagonales viennent de la
          référence Editech, le mouvement de la vidéo. */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="grille absolute top-0 left-0 h-[420px] w-[46%] opacity-70" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pt-10 pb-16 sm:px-8 md:grid-cols-[1fr_1.15fr] md:pt-14 md:pb-24">
          <HeroTexte>
            <HeroLigne>
              <p className="t-sur mb-4 inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-px w-8 bg-canard" />
                Cotonou · Conseil et formation de dirigeants
              </p>
            </HeroLigne>
            <h1 className="t-hero max-w-[12ch]">
              <Mots texte="Former ceux qui" au="chargement" delai={0.1} />{" "}
              <HeroLigne balise="span" className="inline-block">
                <Souligne>décident</Souligne>
              </HeroLigne>
            </h1>
            <HeroLigne>
              <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-gris">
                Masterclasses, formations certifiantes et mentorat, animés par des praticiens en
                exercice. Pour les dirigeants, cadres publics et entrepreneurs de la sous-région.
              </p>
            </HeroLigne>
            <HeroLigne className="mt-8 flex flex-wrap items-center gap-3">
              <BoutonLien href="/programmes" variante="canard" taille="lg">
                Voir les programmes
              </BoutonLien>
              <BoutonLien href="#parcours" variante="contourMarine" taille="lg">
                Comment ça se passe
              </BoutonLien>
            </HeroLigne>
            {visages.length > 0 && (
              <HeroLigne className="mt-9 flex items-center gap-4">
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
              </HeroLigne>
            )}
          </HeroTexte>

          {/* La composition en biais. */}
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[680px]">
            <HeroVisuel className="absolute inset-0">
              {/* Dalle marine, derrière, décalée vers le haut à gauche. */}
              <span
                aria-hidden="true"
                className="absolute top-0 left-[6%] h-[62%] w-[58%] bg-marine"
                style={{ clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)" }}
              />
              {/* La vidéo, coupée en biais sur sa gauche. */}
              <div
                className="absolute top-[6%] right-0 bottom-[10%] left-[18%] overflow-hidden bg-nuit"
                style={{ clipPath: "polygon(26% 0, 100% 0, 100% 100%, 0 100%)" }}
              >
                <VideoFond {...VIDEOS.hero} />
              </div>
              {/* Trait canard le long de la diagonale. */}
              <span
                aria-hidden="true"
                className="absolute top-[6%] bottom-[10%] left-[18%] w-[30%] bg-canard"
                style={{ clipPath: "polygon(26% 0, 30.5% 0, 4.5% 100%, 0 100%)" }}
              />
              {/* Une photo en contrepoint, en bas à gauche, bord blanc. */}
              <span
                className="absolute bottom-0 left-0 block h-[44%] w-[46%] overflow-hidden bg-white p-2"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 22% 100%)" }}
              >
                <span className="relative block h-full w-full overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 22% 100%)" }}>
                  <Image src={PHOTOS.atelier} alt="" fill sizes="320px" className="object-cover" />
                </span>
              </span>
            </HeroVisuel>

            <Flotte delai={1} className="absolute top-[2%] right-[2%] flex items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-2 shadow-flottant">
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

            <HeroCarte className="absolute right-[3%] -bottom-6 w-[min(320px,70%)] rounded-carte bg-white p-5 text-marine shadow-flottant">
              {prochaine ? (
                <>
                  <p className="flex items-center justify-between text-[0.74rem] font-semibold text-canard">
                    Prochaine session
                    <span className="t-chiffres text-gris-clair">{dateCourte(prochaine.debut)}</span>
                  </p>
                  <p className="mt-2 text-[1rem] leading-snug font-bold">
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
                  <BoutonLien href={`/programmes/${prochaine.programmeSlug}`} variante="marine" taille="sm" className="mt-4 w-full">
                    Réserver une place
                  </BoutonLien>
                </>
              ) : (
                <>
                  <p className="text-[0.74rem] font-semibold text-canard">Le calendrier</p>
                  <p className="mt-2 text-[1rem] leading-snug font-bold">Les prochaines sessions arrivent</p>
                  <p className="mt-1 text-[0.8rem] text-gris">
                    Laissez-nous vos coordonnées, nous vous prévenons à l&apos;ouverture.
                  </p>
                  <BoutonLien href="/contact" variante="marine" taille="sm" className="mt-4 w-full">
                    Être prévenu
                  </BoutonLien>
                </>
              )}
            </HeroCarte>
          </div>
        </div>
      </section>

      {/* ============================================================= BANDEAU
          L'offre en une ligne qui défile. */}
      <div className="border-y border-ligne bg-white py-4">
        <Defilement>
          {OFFRE.map((o) => (
            <Link
              key={o.libelle}
              href={o.href}
              className="flex items-center gap-6 pr-6 text-[1.05rem] font-bold whitespace-nowrap text-marine no-underline hover:text-canard"
            >
              {o.libelle}
              <span aria-hidden="true" className="inline-block size-2 rounded-full bg-soleil" />
            </Link>
          ))}
        </Defilement>
      </div>

      {/* ============================================================ DOMAINES
          Six cartes hautes, photo et voile marine, comme les services de la
          référence. Sur mobile, elles défilent à l'horizontale. */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
        <TitreSection
          sur="Nos domaines"
          titre="Trois domaines, un même niveau d'exigence"
          souligne="d'exigence"
          action={
            <BoutonLien href="/programmes" variante="contour" taille="sm">
              Tout le catalogue
            </BoutonLien>
          }
        />
        <Cascade className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {DOMAINES.map((d) => (
            <Element key={d} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <CarteDomaine domaine={d} href={`/programmes?domaine=${encodeURIComponent(d)}`} photo={PHOTO_DOMAINE[d] ?? PHOTOS.formation} />
            </Element>
          ))}
        </Cascade>
      </section>

      {/* ============================================================ CABINET
          Collage en losanges à gauche, le propos à droite, deux repères. */}
      <section className="bg-brume">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <Reveler>
            <Losanges photos={[PHOTOS.dirigeant, PHOTOS.reunion, PHOTOS.dirigeante]} etiquette="Cotonou · Sous-région" />
          </Reveler>
          <Reveler delai={0.15}>
            <p className="t-sur">Le cabinet</p>
            <h2 className="t-h2 mt-2">
              Des praticiens, <Souligne>pas des conférenciers</Souligne>
            </h2>
            <p className="mt-4 max-w-[54ch] text-gris">
              Nos intervenants exercent : fondateur qui a levé des fonds, responsable de la transformation
              numérique d&apos;un groupe, acteur de la gouvernance de l&apos;internet dans la sous-région. Ils
              enseignent ce qu&apos;ils font, sur des cas qu&apos;ils ont eu à traiter, dans des groupes volontairement petits.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {REPERES.map((r) => (
                <div key={r.titre} className="flex gap-4 rounded-carte border border-ligne bg-white p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-pastel-canard text-canard-fonce">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      {r.icone}
                    </svg>
                  </span>
                  <span>
                    <span className="block font-bold text-marine">{r.titre}</span>
                    <span className="mt-1 block text-[0.86rem] text-gris">{r.texte}</span>
                  </span>
                </div>
              ))}
            </div>
            <BoutonLien href="/le-cabinet" variante="marine" className="mt-7">
              Qui nous sommes
            </BoutonLien>
          </Reveler>
        </div>
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

      {/* ================================================================ BENTO
          Ce que la plateforme contient, en une grille inégale : la formation
          prend la grande case, le reste s'organise autour. */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 md:py-24">
        <TitreSection sur="La plateforme" titre="Tout ce qu'il faut pour décider mieux" souligne="décider mieux" />
        <Cascade className="grid gap-4 md:grid-cols-12 md:grid-rows-2">
          <Element className="relative min-h-[380px] overflow-hidden rounded-grand bg-nuit md:col-span-7 md:row-span-2">
            <VideoFond {...VIDEOS.formation} />
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
