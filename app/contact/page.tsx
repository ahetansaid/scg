import type { Metadata } from "next";

import { Reveler } from "@/components/Animations";
import { EnTete } from "@/components/EnTete";
import { CABINET, PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampTexte, PiegeRobots } from "@/components/ui/Champ";

import { envoyerMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description: `Écrire à Strategic Consulting Group – ${CABINET.adresse}, ${CABINET.ville}.`,
};

const ERREURS: Record<string, string> = {
  nom: "Indiquez votre nom, au moins deux caractères.",
  email: "Cette adresse e-mail ne semble pas valide. Vérifiez l'arobase et le domaine.",
  message: "Votre message fait moins de vingt caractères. Dites-nous un peu plus.",
  debit: "Vous avez déjà envoyé plusieurs messages. Réessayez dans {minutes} minutes.",
};

export default async function Contact(props: PageProps<"/contact">) {
  const params = await props.searchParams;
  const lire = (cle: string) => {
    const v = params[cle];
    return Array.isArray(v) ? v[0] : v;
  };

  const envoye = lire("envoye") === "1";
  const erreur = lire("erreur");
  const sujet = lire("sujet") ?? "";
  const message = erreur
    ? (ERREURS[erreur] ?? "Votre message n'a pas pu être envoyé.").replace("{minutes}", lire("minutes") ?? "quelques")
    : null;

  return (
    <>
      <EnTete
        actif="/contact"
        sur="Contact"
        titre="Dites-nous ce que vous cherchez"
        souligne="cherchez"
        sous="Une question sur un programme, une session sur mesure pour vos équipes, ou une demande d'intervention. Nous répondons sous 72 heures ouvrées."
      />

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr] md:py-14">
        <Reveler>
          {envoye && (
            <Alerte nature="succes">
              <strong className="font-semibold">Message envoyé.</strong> Nous vous répondons sous 72 heures
              ouvrées à l&apos;adresse indiquée.
            </Alerte>
          )}
          {message && <Alerte nature="erreur">{message}</Alerte>}

          <form action={envoyerMessage} className="flex flex-col gap-4 rounded-carte border border-ligne bg-white p-6 shadow-carte md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ id="nom" name="nom" label="Nom et prénom" required maxLength={120} />
              <Champ id="email" name="email" type="email" label="Adresse e-mail" required maxLength={180} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ id="structure" name="structure" label="Structure (facultatif)" maxLength={160} />
              <Champ id="sujet" name="sujet" label="Sujet" defaultValue={sujet} maxLength={160} />
            </div>
            <ChampTexte id="message" name="message" label="Votre message" required rows={7} maxLength={4000} />
            <PiegeRobots />
            <div className="flex flex-wrap items-center gap-4">
              <Bouton type="submit" variante="canard" taille="lg">
                Envoyer le message
              </Bouton>
              <p className="text-[0.82rem] text-gris">Vos coordonnées servent uniquement à vous répondre.</p>
            </div>
          </form>
        </Reveler>

        <Reveler delai={0.12} className="flex flex-col gap-5 md:self-start">
          <div className="rounded-carte bg-pastel-ciel p-6">
            <p className="text-[0.78rem] font-semibold text-canard">Nous joindre directement</p>
            <address className="mt-3 flex flex-col gap-4 text-[0.95rem] not-italic">
              <span>
                <span className="block text-[0.78rem] font-semibold text-gris">Adresse</span>
                <span className="font-semibold text-marine">
                  {CABINET.adresse}, {CABINET.ville}
                </span>
              </span>
              <span>
                <span className="block text-[0.78rem] font-semibold text-gris">Téléphone</span>
                <a href={`tel:${CABINET.telephoneLien}`} className="font-semibold text-marine no-underline">
                  {CABINET.telephone}
                </a>
              </span>
              <span>
                <span className="block text-[0.78rem] font-semibold text-gris">E-mail</span>
                <a href={`mailto:${CABINET.email}`} className="font-semibold break-all text-marine no-underline">
                  {CABINET.email}
                </a>
              </span>
            </address>
          </div>
          <div className="rounded-carte bg-pastel-soleil p-6 text-[0.9rem] text-marine">
            <p className="font-bold">Session sur mesure ?</p>
            <p className="mt-1 text-gris">
              Précisez la taille de l&apos;équipe, le sujet et la période souhaitée : nous revenons avec une proposition
              en quelques jours.
            </p>
          </div>
        </Reveler>
      </main>

      <PiedDePage />
    </>
  );
}
