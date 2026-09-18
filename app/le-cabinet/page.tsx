import type { Metadata } from "next";
import Image from "next/image";

import { Cascade, Element, Reveler, Souligne } from "@/components/Animations";
import { EnTete } from "@/components/EnTete";
import { CABINET, PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";
import { Decoupe, TitreSection } from "@/components/Vitrine";
import { PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Le cabinet",
  description:
    "Strategic Consulting Group – conseil, formation et mentorat pour les dirigeants, cadres publics et entrepreneurs. Cotonou, Bénin.",
};

const POLES = [
  {
    titre: "Publications",
    action: "Diagnostiquer",
    fond: "bg-pastel-violet",
    texte:
      "Notes de conjoncture et rapports chapitrés, avec les jeux de données consultables. Ce qui distingue une publication de cabinet d'un billet d'opinion, c'est qu'on peut vérifier les chiffres.",
  },
  {
    titre: "Masterclasses",
    action: "Apprendre",
    fond: "bg-pastel-soleil",
    texte:
      "Des cycles courts animés par des praticiens en exercice, construits autour de cas réels d'entreprises béninoises et sous-régionales. Chaque séance produit un livrable.",
  },
  {
    titre: "Formations",
    action: "Certifier",
    fond: "bg-pastel-canard",
    texte:
      "Des parcours plus longs, avec présence contrôlée, projet réel et soutenance. Le certificat porte un numéro vérifiable en ligne : il n'a de valeur que s'il est opposable.",
  },
  {
    titre: "Mentorat",
    action: "Accompagner",
    fond: "bg-pastel-ciel",
    texte:
      "Un réseau de dirigeants en poste qui ouvrent quelques créneaux par mois. Le quota est délibéré : un mentor disponible pour tout le monde n'est disponible pour personne.",
  },
] as const;

export default function LeCabinet() {
  return (
    <>
      <EnTete
        photo={PHOTOS.dirigeant}
        actif="/le-cabinet"
        sur="Le cabinet"
        titre="Un cabinet fait passer une organisation d'un point à un autre"
        souligne="d'un point à un autre"
        sous="Strategic Consulting Group accompagne les dirigeants, les cadres publics et les entrepreneurs de la sous-région. Quatre pôles jalonnent ce trajet."
      />

      <main>
        <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14">
          <TitreSection titre="Quatre pôles, un même trajet" souligne="un même trajet" centre />
          <Cascade className="grid gap-5 sm:grid-cols-2">
            {POLES.map((p) => (
              <Element key={p.titre} className={`rounded-grand p-7 ${p.fond}`}>
                <p className="t-sur">{p.action}</p>
                <h3 className="t-h2 mt-1 text-[1.5rem]">{p.titre}</h3>
                <p className="mt-3 text-[0.95rem] text-gris">{p.texte}</p>
              </Element>
            ))}
          </Cascade>
        </section>

        <section className="bg-brume">
          <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
            <Reveler className="relative mx-auto w-full max-w-[460px]">
              <Decoupe src={PHOTOS.conference} alt="" forme="goutte" className="aspect-square w-full" />
              <span className="absolute -right-3 -bottom-5 hidden size-28 overflow-hidden rounded-full ring-8 ring-white md:block">
                <Image src={PHOTOS.equipe} alt="" fill sizes="112px" className="object-cover" />
              </span>
            </Reveler>
            <Reveler delai={0.15}>
              <p className="t-sur">Notre manière de travailler</p>
              <h2 className="t-h2 mt-1">
                Des praticiens, <Souligne>pas des conférenciers</Souligne>
              </h2>
              <p className="mt-4 max-w-[54ch] text-gris">
                Nos intervenants exercent. Un directeur financier en poste, un ancien directeur général d&apos;agence
                publique, une contrôleuse de gestion dans l&apos;industrie. Ils enseignent ce qu&apos;ils font, sur
                des cas qu&apos;ils ont eu à traiter.
              </p>
              <p className="mt-3 max-w-[54ch] text-gris">
                Les groupes sont volontairement petits. Une masterclass ne dépasse pas vingt-cinq participants, une
                certification dix-huit. C&apos;est ce qui permet à chacun de repartir avec sa propre pièce de travail
                plutôt qu&apos;avec des notes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <BoutonLien href="/programmes" variante="canard">
                  Voir les programmes
                </BoutonLien>
                <BoutonLien href="/contact" variante="contour">
                  Nous écrire
                </BoutonLien>
              </div>
            </Reveler>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
          <Reveler className="grid gap-5 rounded-grand bg-marine p-8 text-white md:grid-cols-3 md:p-12">
            <div>
              <p className="text-[0.78rem] font-semibold text-soleil">Adresse</p>
              <p className="mt-1 font-semibold">
                {CABINET.adresse}
                <br />
                {CABINET.ville}
              </p>
            </div>
            <div>
              <p className="text-[0.78rem] font-semibold text-soleil">Téléphone</p>
              <a href={`tel:${CABINET.telephoneLien}`} className="mt-1 block font-semibold no-underline">
                {CABINET.telephone}
              </a>
            </div>
            <div>
              <p className="text-[0.78rem] font-semibold text-soleil">IFU</p>
              <p className="t-chiffres mt-1 font-semibold">{CABINET.ifu}</p>
            </div>
          </Reveler>
        </section>
      </main>

      <PiedDePage />
    </>
  );
}
