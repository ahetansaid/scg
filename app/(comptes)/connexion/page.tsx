import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ } from "@/components/ui/Champ";
import { utilisateurCourant } from "@/lib/auth";

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
            Reprendre votre <em className="t-italique text-laiton">trajectoire</em>
          </h1>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[520px] px-4 py-10 sm:px-8 md:py-14">
          {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "La connexion a échoué."}</Alerte>}

          <form
            action={seConnecter}
            className="flex flex-col gap-4 rounded-panneau border border-ligne bg-white p-6"
          >
            <input type="hidden" name="suite" value={suite} />
            <Champ
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              maxLength={180}
            />
            <Champ
              id="motDePasse"
              name="motDePasse"
              type="password"
              label="Mot de passe"
              autoComplete="current-password"
              required
              maxLength={200}
            />
            <Bouton type="submit" variante="marine" className="mt-1 w-full justify-center">
              Se connecter
            </Bouton>
          </form>

          <p className="mt-5 text-center text-[0.9rem] text-gris">
            Pas encore de compte ?{" "}
            <Link href="/creer-un-compte" className="font-semibold text-marine">
              En créer un
            </Link>
          </p>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
