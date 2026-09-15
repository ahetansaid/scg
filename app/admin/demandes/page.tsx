import type { Metadata } from "next";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Bouton } from "@/components/ui/Bouton";
import { Etiquette } from "@/components/ui/Etiquette";
import { exigerRole } from "@/lib/auth";
import { toutesLesDemandes } from "@/lib/mentorat";
import { formatDateHeure, LIBELLE_FORMAT } from "@/lib/vocabulaire";

import { clorreDemande } from "../actions";

export const metadata: Metadata = { title: "Demandes de mentorat · back-office" };

const ETAT = {
  envoyee: { etat: "bientot", texte: "En attente" },
  acceptee: { etat: "ouvert", texte: "Acceptée" },
  declinee: { etat: "complet", texte: "Déclinée" },
  close: { etat: "certifiante", texte: "Close" },
} as const;

export default async function AdminDemandes() {
  const utilisateur = await exigerRole("admin");
  const liste = await toutesLesDemandes();

  const enAttente = liste.filter((d) => d.statut === "envoyee");

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/demandes">
      <TitrePage
        surtitre="Back-office"
        titre="Demandes de"
        accent="mentorat"
        sous={`${enAttente.length} en attente sur ${liste.length}. Seul le mentor destinataire accepte ou décline – l'administration ne peut que clore.`}
      />

      <Panneau>
        {liste.length === 0 ? (
          <Vide>Aucune demande de mentorat.</Vide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.84rem]">
              <thead>
                <tr>
                  {["Objet", "Demandeur", "Mentor", "Envoyée le", "Statut", ""].map((t) => (
                    <th
                      key={t}
                      className="t-balise border-b border-ligne px-3 pb-2.5 text-left text-[0.56rem] font-medium whitespace-nowrap text-gris"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liste.map((d) => (
                  <tr key={d.id}>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <b className="font-semibold">{d.objet}</b>
                      <span className="block text-[0.76rem] text-gris">
                        {LIBELLE_FORMAT[d.format]}
                        {d.creneauAt ? ` · ${formatDateHeure.format(d.creneauAt)}` : ""}
                      </span>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      {d.demandeurNom}
                      <span className="block font-mono text-[0.72rem] text-gris">
                        {d.demandeurEmail}
                      </span>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">{d.mentorTitre}</td>
                    <td className="border-b border-ligne-douce px-3 py-2.5 whitespace-nowrap">
                      {formatDateHeure.format(d.creeAt)}
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5">
                      <Etiquette etat={ETAT[d.statut].etat}>{ETAT[d.statut].texte}</Etiquette>
                    </td>
                    <td className="border-b border-ligne-douce px-3 py-2.5 text-right">
                      {d.statut !== "close" && (
                        <form action={clorreDemande}>
                          <input type="hidden" name="demande" value={d.id} />
                          <Bouton type="submit" variante="fantomeClair" taille="sm">
                            Clore
                          </Bouton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panneau>
    </Application>
  );
}
