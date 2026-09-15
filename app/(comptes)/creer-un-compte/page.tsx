import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, PiegeRobots } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";

import { creerMonCompte } from "../actions";

export const metadata: Metadata = { title: "Créer un compte" };

const ERREURS: Record<string, string> = {
  identite: "Indiquez votre prénom et votre nom, au moins deux caractères chacun.",
  email: "Cette adresse e-mail ne semble pas valide. Vérifiez l'arobase et le domaine.",
  motdepasse: "Choisissez un mot de passe d'au moins douze caractères.",
  email_pris: "Un compte existe déjà pour cette adresse. Connectez-vous plutôt.",
  debit: "Trop de créations depuis cette connexion. Réessayez dans une demi-heure.",
};

export default async function CreerUnCompte(props: PageProps<"/creer-un-compte">) {
  if (await utilisateurCourant()) redirect("/espace");

  const params = await props.searchParams;
  const v = params.erreur;
  const erreur = Array.isArray(v) ? v[0] : v;

  return (
    <>
      <div
        className="pb-10"
        style={{
          background:
            "radial-gradient(70% 60% at 84% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 74%,#0b2e5b 100%)",
        }}
      >
        <Navigation />
        <div className="mx-auto max-w-[1010px] px-4 pt-10 sm:px-8">
          <p className="t-balise text-laiton">Espace membre</p>
          <h1 className="t-h2 mt-2 text-white">
            Créer votre <em className="t-italique text-laiton">compte</em>
          </h1>
          <p className="mt-3 max-w-[46ch] text-[#b9cddf]">
            Il vous permet de vous inscrire aux sessions, de suivre votre progression et de
            solliciter un mentor.
          </p>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[620px] px-4 py-10 sm:px-8 md:py-14">
          {erreur && (
            <Alerte nature="erreur">{ERREURS[erreur] ?? "La création du compte a échoué."}</Alerte>
          )}

          <form
            action={creerMonCompte}
            className="flex flex-col gap-4 rounded-panneau border border-ligne bg-white p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ id="prenom" name="prenom" label="Prénom" required maxLength={120} autoComplete="given-name" />
              <Champ id="nom" name="nom" label="Nom" required maxLength={120} autoComplete="family-name" />
            </div>

            <Champ
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail"
              required
              maxLength={180}
              autoComplete="email"
            />

            <Champ
              id="motDePasse"
              name="motDePasse"
              type="password"
              label="Mot de passe"
              required
              minLength={12}
              maxLength={200}
              autoComplete="new-password"
              aide="Douze caractères au minimum. Une phrase dont vous vous souvenez vaut mieux qu'un mot compliqué."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Champ
                id="telephone"
                name="telephone"
                type="tel"
                label="Téléphone"
                maxLength={40}
                autoComplete="tel"
                placeholder="+229 …"
              />
              <Champ id="structure" name="structure" label="Structure" maxLength={160} />
            </div>

            <Champ
              id="fonction"
              name="fonction"
              label="Fonction"
              maxLength={160}
              aide="Facultatif. Nous aide à orienter nos recommandations de programmes."
            />

            <PiegeRobots />

            <Bouton type="submit" variante="marine" className="mt-1 w-full justify-center">
              Créer mon compte
            </Bouton>
            <p className="m-0 text-[0.8rem] text-gris">
              Vos coordonnées servent à gérer votre inscription et à vous joindre. Elles ne sont
              transmises à personne.
            </p>
          </form>

          <p className="mt-5 text-center text-[0.9rem] text-gris">
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-marine">
              Se connecter
            </Link>
          </p>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
