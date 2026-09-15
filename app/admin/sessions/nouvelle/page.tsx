import type { Metadata } from "next";
import Link from "next/link";
import { asc, ne } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { FormulaireSession } from "@/components/FormulaireSession";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { programmes } from "@/lib/db/schema";

import { enregistrerSession } from "../../actions";

export const metadata: Metadata = { title: "Nouvelle session" };

export default async function NouvelleSession() {
  const utilisateur = await exigerRole("admin", "formateur");

  const liste = await db
    .select({ id: programmes.id, titre: programmes.titre })
    .from(programmes)
    .where(ne(programmes.statut, "archive"))
    .orderBy(asc(programmes.titre));

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/sessions">
      <TitrePage
        surtitre="Back-office"
        titre="Nouvelle"
        accent="session"
        sous="Une session est une occurrence datée d'un programme. C'est elle qui porte la capacité et le tarif."
      />
      <Panneau>
        {liste.length === 0 ? (
          <Vide>
            Aucun programme à rattacher.{" "}
            <Link href="/admin/programmes/nouveau" className="font-semibold text-marine">
              Créez d&apos;abord un programme
            </Link>
            .
          </Vide>
        ) : (
          <FormulaireSession action={enregistrerSession} programmes={liste} />
        )}
      </Panneau>
    </Application>
  );
}
