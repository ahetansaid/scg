import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageCompte } from "@/components/Compte";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, PiegeRobots } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { PHOTOS } from "@/lib/photos";

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
    <PageCompte
      actif="/creer-un-compte"
      sur="Espace membre"
      titre="Créer votre compte"
      souligne="compte"
      sous="Gratuit. Il vous permet de vous inscrire aux sessions, de suivre votre progression et de solliciter un mentor."
      photo={PHOTOS.dirigeant}
    >
      <div>
        {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La création du compte a échoué."}</Alerte>}

        <form action={creerMonCompte} className="flex flex-col gap-4 rounded-carte border border-ligne bg-white p-6 shadow-carte md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ id="prenom" name="prenom" label="Prénom" required maxLength={120} autoComplete="given-name" />
            <Champ id="nom" name="nom" label="Nom" required maxLength={120} autoComplete="family-name" />
          </div>
          <Champ id="email" name="email" type="email" label="Adresse e-mail" required maxLength={180} autoComplete="email" />
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
            <Champ id="telephone" name="telephone" type="tel" label="Téléphone" maxLength={40} autoComplete="tel" placeholder="+229 …" />
            <Champ id="structure" name="structure" label="Structure" maxLength={160} />
          </div>
          <Champ id="fonction" name="fonction" label="Fonction (facultatif)" maxLength={160} />
          <PiegeRobots />
          <Bouton type="submit" variante="canard" taille="lg" className="mt-1 w-full">
            Créer mon compte
          </Bouton>
          <p className="text-[0.82rem] text-gris">
            Vos coordonnées servent à gérer votre inscription et à vous joindre. Elles ne sont transmises à personne.
          </p>
        </form>

        <p className="mt-6 text-center text-[0.92rem] text-gris">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-canard">
            Se connecter
          </Link>
        </p>
      </div>
    </PageCompte>
  );
}
