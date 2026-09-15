import type { Metadata } from "next";
import Link from "next/link";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { exigerUtilisateur } from "@/lib/auth";
import { mesCertificats } from "@/lib/espace";
import { formatLong } from "@/lib/vocabulaire";

export const metadata: Metadata = { title: "Mes certificats" };

export default async function Certificats() {
  const utilisateur = await exigerUtilisateur();
  const liste = await mesCertificats(utilisateur.id);

  return (
    <Application utilisateur={utilisateur} zone="espace" actif="/espace/certificats">
      <TitrePage
        surtitre="Espace membre"
        titre="Mes"
        accent="certificats"
        sous="Chaque certificat porte un numéro vérifiable publiquement – c'est ce qui le rend opposable."
      />

      {liste.length === 0 ? (
        <Vide>
          Aucun certificat pour l&apos;instant. Ils sont émis à l&apos;issue d&apos;un programme
          certifiant, sous condition de présence.{" "}
          <Link href="/programmes?nature=certification" className="font-semibold text-marine">
            Voir les certifications
          </Link>
          .
        </Vide>
      ) : (
        <div className="flex flex-col gap-3.5">
          {liste.map((c) => (
            <Panneau key={c.numero}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="t-italique text-[1.24rem] leading-tight">{c.titre}</h2>
                  <p className="mt-1.5 text-[0.83rem] text-gris">
                    Émis le {formatLong.format(c.emisAt)} · session {c.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="t-balise text-[0.58rem] text-gris">Numéro</p>
                  <p className="t-chiffres mt-0.5 font-mono text-[0.95rem] font-semibold text-marine">
                    {c.numero}
                  </p>
                  <Link
                    href={`/certificats/${c.numero}`}
                    className="mt-1.5 inline-block text-[0.8rem] font-semibold text-marine"
                  >
                    Page de vérification →
                  </Link>
                </div>
              </div>
            </Panneau>
          ))}
        </div>
      )}
    </Application>
  );
}
