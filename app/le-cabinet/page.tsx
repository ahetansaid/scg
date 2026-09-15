import type { Metadata } from "next";

import { Navigation } from "@/components/Navigation";
import { CABINET, PiedDePage } from "@/components/PiedDePage";
import { BoutonLien } from "@/components/ui/Bouton";

export const metadata: Metadata = {
  title: "Le cabinet",
  description:
    "Strategic Consulting Group – conseil, formation et mentorat pour les dirigeants, cadres publics et entrepreneurs. Cotonou, Bénin.",
};

/* Les quatre pôles sont ceux que porte l'arc du hero. Même vocabulaire d'un
   bout à l'autre du site : ce qui est dessiné est ce qui est vendu. */
const POLES = [
  {
    action: "Diagnostiquer",
    titre: "Publications",
    texte:
      "Notes de conjoncture et rapports chapitrés, avec les jeux de données téléchargeables. Ce qui distingue une publication de cabinet d'un billet d'opinion, c'est qu'on peut vérifier les chiffres.",
  },
  {
    action: "Apprendre",
    titre: "Masterclasses",
    texte:
      "Des cycles courts animés par des praticiens en exercice, construits autour de cas réels d'entreprises béninoises et sous-régionales. Chaque séance produit un livrable.",
  },
  {
    action: "Certifier",
    titre: "Formations",
    texte:
      "Des parcours plus longs, avec présence contrôlée, projet réel et soutenance. Le certificat porte un numéro vérifiable en ligne – il n'a de valeur que s'il est opposable.",
  },
  {
    action: "Accompagner",
    titre: "Mentorat",
    texte:
      "Un réseau de dirigeants en poste qui ouvrent quelques créneaux par mois. Le quota est délibéré : un mentor disponible pour tout le monde n'est disponible pour personne.",
  },
] as const;

export default function LeCabinet() {
  return (
    <>
      <div
        className="pb-10"
        style={{
          background:
            "radial-gradient(70% 60% at 84% -10%, rgba(62,143,193,.32) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 68%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/le-cabinet" />

        <div className="mx-auto max-w-[1010px] px-4 pt-10 sm:px-8 md:pt-14">
          <p className="t-balise text-laiton">Le cabinet</p>
          <h1 className="t-h2 mt-2 max-w-[18ch] text-white">
            Un cabinet fait passer une organisation{" "}
            <em className="t-italique text-laiton">d&apos;un point à un autre</em>
          </h1>
          <p className="mt-4 max-w-[56ch] text-[#b9cddf]">
            Strategic Consulting Group accompagne les dirigeants, les cadres publics et les
            entrepreneurs de la sous-région. Nos quatre pôles jalonnent ce trajet : diagnostiquer,
            apprendre, certifier, accompagner.
          </p>
        </div>
      </div>

      <main className="bg-papier">
        <section className="mx-auto max-w-[1010px] px-4 py-10 sm:px-8 md:py-14">
          <h2 className="t-h2 mb-7">
            Quatre pôles, <em className="t-italique text-laiton-fonce">un même trajet</em>
          </h2>

          <ol className="m-0 grid list-none gap-px overflow-hidden rounded-carte border border-ligne bg-ligne pl-0 sm:grid-cols-2">
            {POLES.map((p) => (
              <li key={p.titre} className="bg-white p-6">
                <p className="t-balise text-[0.6rem] text-laiton-fonce">{p.action}</p>
                <h3 className="t-h3 mt-1.5">{p.titre}</h3>
                <p className="mt-2 text-[0.9rem] text-gris">{p.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-nuit">
          <div className="mx-auto grid max-w-[1010px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.3fr_1fr] md:py-14">
            <div>
              <p className="t-balise text-laiton">Notre manière de travailler</p>
              <h2 className="t-h2 mt-1.5 text-white">
                Des praticiens, <em className="t-italique text-laiton">pas des conférenciers</em>
              </h2>
              <p className="mt-4 max-w-[54ch] text-[#b9cddf]">
                Nos intervenants exercent. Un directeur financier en poste, un ancien directeur
                général d&apos;agence publique, une contrôleuse de gestion dans l&apos;industrie.
                Ils enseignent ce qu&apos;ils font, sur des cas qu&apos;ils ont eu à traiter – pas
                sur des études de cas importées d&apos;un autre continent.
              </p>
              <p className="mt-3 max-w-[54ch] text-[#b9cddf]">
                Les groupes sont volontairement petits. Une masterclass ne dépasse pas vingt-cinq
                participants, une certification dix-huit. C&apos;est ce qui permet à chacun de
                repartir avec sa propre pièce de travail plutôt qu&apos;avec des notes.
              </p>
            </div>

            <aside className="rounded-panneau border border-white/13 bg-white/4 p-6">
              <p className="t-balise text-[0.6rem] text-[#8fb0cc]">Le cabinet</p>
              <dl className="mt-3 flex flex-col gap-4 text-[0.9rem] text-[#dce7f1]">
                <div>
                  <dt className="t-balise text-[0.58rem] text-[#5f7b96]">Adresse</dt>
                  <dd className="m-0 mt-1">
                    {CABINET.adresse}
                    <br />
                    {CABINET.ville}
                  </dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-[#5f7b96]">Téléphone</dt>
                  <dd className="m-0 mt-1">
                    <a href={`tel:${CABINET.telephoneLien}`} className="no-underline">
                      {CABINET.telephone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-[#5f7b96]">IFU</dt>
                  <dd className="t-chiffres m-0 mt-1">{CABINET.ifu}</dd>
                </div>
              </dl>
              <BoutonLien href="/contact" variante="laiton" className="mt-6 w-full justify-center">
                Nous écrire
              </BoutonLien>
            </aside>
          </div>
        </section>
      </main>

      <PiedDePage />
    </>
  );
}
