import type { Metadata } from "next";

import { Application, Panneau, TitrePage } from "@/components/Application";
import { FormulaireProgramme } from "@/components/FormulaireProgramme";
import { exigerRole } from "@/lib/auth";

import { enregistrerProgramme } from "../../actions";

export const metadata: Metadata = { title: "Nouveau programme" };

export default async function NouveauProgramme() {
  const utilisateur = await exigerRole("admin", "formateur");

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/programmes">
      <TitrePage
        surtitre="Back-office"
        titre="Nouveau"
        accent="programme"
        sous="Créez-le en brouillon, ajoutez son déroulé, puis publiez-le quand il est prêt."
      />
      <Panneau>
        <FormulaireProgramme action={enregistrerProgramme} />
      </Panneau>
    </Application>
  );
}
