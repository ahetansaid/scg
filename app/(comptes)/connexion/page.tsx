import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageCompte } from "@/components/Compte";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";
import { PHOTOS } from "@/lib/photos";

import { seConnecter } from "../actions";

export const metadata: Metadata = { title: "Connexion" };

const ERREURS: Record<string, string> = {
  champs: "Renseignez votre adresse e-mail et votre mot de passe.",
  identifiants: "Adresse e-mail ou mot de passe incorrect.",
  debit: "Trop de tentatives depuis cette connexion. Réessayez dans quelques minutes.",
};

export default async function Connexion(props: PageProps<"/connexion">) {
  if (await utilisateurCourant()) redirect("/espace");

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };
  const erreur = lire("erreur");
  const suite = lire("suite") ?? "/espace";

  return (
    <PageCompte
      actif="/connexion"
      sur="Espace membre"
      titre="Bon retour"
      souligne="retour"
      sous="Connectez-vous pour retrouver vos programmes, vos demandes de mentorat et vos certificats."
      photo={PHOTOS.dirigeante}
    >
      <div>
        {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La connexion a échoué."}</Alerte>}

        <form action={seConnecter} className="flex flex-col gap-4 rounded-carte border border-ligne bg-white p-6 shadow-carte md:p-8">
          <input type="hidden" name="suite" value={suite} />
          <Champ id="email" name="email" type="email" label="Adresse e-mail" autoComplete="email" required maxLength={180} />
          <Champ id="motDePasse" name="motDePasse" type="password" label="Mot de passe" autoComplete="current-password" required maxLength={200} />
          <Bouton type="submit" variante="canard" taille="lg" className="mt-1 w-full">
            Se connecter
          </Bouton>
        </form>

        <p className="mt-6 text-center text-[0.92rem] text-gris">
          Pas encore de compte ?{" "}
          <Link href="/creer-un-compte" className="font-semibold text-canard">
            En créer un
          </Link>
        </p>
      </div>
    </PageCompte>
  );
}
