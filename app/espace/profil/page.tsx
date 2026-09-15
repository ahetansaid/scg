import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { Application, Panneau, TitrePage } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Alerte, Champ, ChampTexte } from "@/components/ui/Champ";
import { exigerUtilisateur } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { LIBELLE_ROLE } from "@/lib/vocabulaire";

import { enregistrerMonProfil } from "../actions";

export const metadata: Metadata = { title: "Mon profil" };

export default async function Profil(props: PageProps<"/espace/profil">) {
  const utilisateur = await exigerUtilisateur();

  const lignes = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, utilisateur.id))
    .limit(1);
  const p = lignes[0];

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/profil">
      <TitrePage
        surtitre="Compte"
        titre="Mon"
        accent="profil"
        sous={`${utilisateur.email} · ${LIBELLE_ROLE[utilisateur.role]}`}
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Votre profil est à jour.</Alerte>}
      {lire("erreur") === "identite" && (
        <Alerte nature="erreur">
          Indiquez votre prénom et votre nom, au moins deux caractères chacun.
        </Alerte>
      )}

      <Panneau>
        <form action={enregistrerMonProfil} className="flex max-w-[640px] flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              id="prenom"
              name="prenom"
              label="Prénom"
              required
              maxLength={120}
              defaultValue={p?.prenom ?? ""}
            />
            <Champ
              id="nom"
              name="nom"
              label="Nom"
              required
              maxLength={120}
              defaultValue={p?.nom ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              id="telephone"
              name="telephone"
              type="tel"
              label="Téléphone"
              maxLength={40}
              defaultValue={p?.telephone ?? ""}
            />
            <Champ
              id="ville"
              name="ville"
              label="Ville"
              maxLength={120}
              defaultValue={p?.ville ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Champ
              id="structure"
              name="structure"
              label="Structure"
              maxLength={160}
              defaultValue={p?.structure ?? ""}
            />
            <Champ
              id="fonction"
              name="fonction"
              label="Fonction"
              maxLength={160}
              defaultValue={p?.fonction ?? ""}
            />
          </div>

          <ChampTexte
            id="bio"
            name="bio"
            label="Présentation"
            rows={5}
            maxLength={2000}
            defaultValue={p?.bio ?? ""}
            aide="Visible par les mentors auxquels vous adressez une demande. Cela leur évite de vous demander votre contexte."
          />

          <Bouton type="submit" variante="marine" className="self-start">
            Enregistrer
          </Bouton>
        </form>
      </Panneau>

      <Panneau titre="Adresse e-mail" className="mt-3.5">
        <p className="m-0 text-[0.9rem] text-gris">
          Votre adresse de connexion est <strong className="text-encre">{utilisateur.email}</strong>.
          Pour la changer, écrivez-nous : elle sert d&apos;identifiant, et la modifier sans
          vérification ouvrirait la porte à une prise de contrôle du compte.
        </p>
      </Panneau>
    </Application>
  );
}
