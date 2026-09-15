import type { Metadata } from "next";

import { Navigation } from "@/components/Navigation";
import { CABINET, PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";

import { envoyerMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description: `Écrire à Strategic Consulting Group – ${CABINET.adresse}, ${CABINET.ville}.`,
};

/* Un message d'erreur dit ce qui ne va pas ET comment le réparer. Pas
   d'excuses, pas de vague. */
const ERREURS: Record<string, string> = {
  nom: "Indiquez votre nom, au moins deux caractères.",
  email: "Cette adresse e-mail ne semble pas valide. Vérifiez l'arobase et le domaine.",
  message: "Votre message fait moins de vingt caractères. Dites-nous un peu plus.",
  debit: "Vous avez déjà envoyé plusieurs messages. Réessayez dans {minutes} minutes.",
};

const champ =
  "w-full rounded-champ border border-ligne bg-white px-3.5 py-2.5 text-[0.94rem] " +
  "outline-none focus:border-marine focus:ring-2 focus:ring-marine/20";
const label = "t-balise mb-1.5 block text-[0.6rem] text-gris";

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
    ? (ERREURS[erreur] ?? "Votre message n'a pas pu être envoyé.").replace(
        "{minutes}",
        lire("minutes") ?? "quelques",
      )
    : null;

  return (
    <>
      <div
        className="pb-10"
        style={{
          background:
            "radial-gradient(70% 60% at 84% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 72%,#0b2e5b 100%)",
        }}
      >
        <Navigation actif="/contact" />

        <div className="mx-auto max-w-[1010px] px-4 pt-10 sm:px-8 md:pt-14">
          <p className="t-balise text-laiton">Contact</p>
          <h1 className="t-h2 mt-2 max-w-[20ch] text-white">
            Dites-nous ce que vous <em className="t-italique text-laiton">cherchez</em>
          </h1>
          <p className="mt-4 max-w-[52ch] text-[#b9cddf]">
            Une question sur un programme, une session sur mesure pour vos équipes, ou une demande
            d&apos;intervention. Nous répondons sous 72 heures ouvrées.
          </p>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto grid max-w-[1010px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.5fr_1fr] md:py-14">
          <div>
            {envoye && (
              <p
                role="status"
                className="mb-6 rounded-carte border border-vert/30 bg-[#e2f0e8] px-4 py-3.5 text-[0.92rem] text-vert"
              >
                <strong className="font-semibold">Message envoyé.</strong> Nous vous répondons sous
                72 heures ouvrées à l&apos;adresse indiquée.
              </p>
            )}

            {message && (
              <p
                role="alert"
                className="mb-6 rounded-carte border border-terre/30 bg-[#fae4de] px-4 py-3.5 text-[0.92rem] text-terre"
              >
                {message}
              </p>
            )}

            <form action={envoyerMessage} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className={label}>
                    Nom et prénom
                  </label>
                  <input id="nom" name="nom" required maxLength={120} className={champ} />
                </div>
                <div>
                  <label htmlFor="email" className={label}>
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={180}
                    className={champ}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="structure" className={label}>
                    Structure <span className="normal-case">(facultatif)</span>
                  </label>
                  <input id="structure" name="structure" maxLength={160} className={champ} />
                </div>
                <div>
                  <label htmlFor="sujet" className={label}>
                    Sujet
                  </label>
                  <input
                    id="sujet"
                    name="sujet"
                    defaultValue={sujet}
                    maxLength={160}
                    className={champ}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className={label}>
                  Votre message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  maxLength={4000}
                  className={champ}
                />
              </div>

              {/* Piège à robots. Masqué à l'œil et retiré du parcours clavier
                  et des lecteurs d'écran – un humain ne le rencontre jamais. */}
              <div aria-hidden="true" className="absolute left-[-9999px]">
                <label htmlFor="site">Ne pas remplir</label>
                <input id="site" name="site" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Bouton type="submit" variante="marine">
                  Envoyer le message
                </Bouton>
                <p className="m-0 text-[0.8rem] text-gris">
                  Vos coordonnées servent uniquement à vous répondre.
                </p>
              </div>
            </form>
          </div>

          <aside className="rounded-panneau border border-ligne bg-white p-6 md:self-start">
            <p className="t-balise text-[0.6rem] text-laiton-fonce">Nous joindre directement</p>
            <address className="mt-3 flex flex-col gap-4 text-[0.92rem] not-italic">
              <span>
                <span className="t-balise block text-[0.58rem] text-gris">Adresse</span>
                {CABINET.adresse}
                <br />
                {CABINET.ville}
              </span>
              <span>
                <span className="t-balise block text-[0.58rem] text-gris">Téléphone</span>
                <a href={`tel:${CABINET.telephoneLien}`} className="font-medium text-marine">
                  {CABINET.telephone}
                </a>
              </span>
              <span>
                <span className="t-balise block text-[0.58rem] text-gris">E-mail</span>
                <a href={`mailto:${CABINET.email}`} className="font-medium break-all text-marine">
                  {CABINET.email}
                </a>
              </span>
            </address>
          </aside>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
