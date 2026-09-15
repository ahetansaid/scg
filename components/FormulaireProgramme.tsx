import { Bouton } from "@/components/ui/Bouton";
import { Champ, ChampListe, ChampTexte } from "@/components/ui/Champ";
import { DOMAINES, FORMATS, LIBELLE_FORMAT, LIBELLE_NATURE, NATURES } from "@/lib/vocabulaire";

type Valeurs = {
  id?: string;
  slug?: string;
  titre?: string;
  nature?: string;
  domaine?: string;
  format?: string;
  accroche?: string;
  description?: string;
  dureeLibelle?: string;
  objectifs?: string[];
  prerequis?: string[];
  statut?: string;
};

/* Le même formulaire sert à créer et à modifier : un champ caché porte
   l'identifiant quand il existe. Deux formulaires divergent toujours. */
export function FormulaireProgramme({
  action,
  valeurs = {},
}: {
  action: (donnees: FormData) => void | Promise<void>;
  valeurs?: Valeurs;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      {valeurs.id && <input type="hidden" name="id" value={valeurs.id} />}

      <Champ
        id="titre"
        name="titre"
        label="Titre"
        required
        maxLength={200}
        defaultValue={valeurs.titre ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ChampListe id="nature" name="nature" label="Nature" defaultValue={valeurs.nature ?? "masterclass"}>
          {NATURES.map((n) => (
            <option key={n} value={n}>
              {LIBELLE_NATURE[n]}
            </option>
          ))}
        </ChampListe>

        <ChampListe id="domaine" name="domaine" label="Domaine" defaultValue={valeurs.domaine ?? DOMAINES[0]}>
          {DOMAINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </ChampListe>

        <ChampListe id="format" name="format" label="Format" defaultValue={valeurs.format ?? "presentiel"}>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {LIBELLE_FORMAT[f]}
            </option>
          ))}
        </ChampListe>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ
          id="dureeLibelle"
          name="dureeLibelle"
          label="Durée affichée"
          maxLength={80}
          placeholder="6 séances"
          defaultValue={valeurs.dureeLibelle ?? ""}
        />
        <Champ
          id="slug"
          name="slug"
          label="Adresse (slug)"
          maxLength={90}
          defaultValue={valeurs.slug ?? ""}
          aide="Laissez vide pour la déduire du titre."
        />
      </div>

      <Champ
        id="accroche"
        name="accroche"
        label="Accroche"
        maxLength={400}
        defaultValue={valeurs.accroche ?? ""}
        aide="Une phrase. Elle apparaît dans le catalogue et sur l'accueil."
      />

      <ChampTexte
        id="description"
        name="description"
        label="Description"
        rows={6}
        maxLength={6000}
        defaultValue={valeurs.description ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampTexte
          id="objectifs"
          name="objectifs"
          label="Objectifs"
          rows={5}
          defaultValue={(valeurs.objectifs ?? []).join("\n")}
          aide="Un par ligne."
        />
        <ChampTexte
          id="prerequis"
          name="prerequis"
          label="Prérequis"
          rows={5}
          defaultValue={(valeurs.prerequis ?? []).join("\n")}
          aide="Un par ligne. Laissez vide s'il n'y en a pas."
        />
      </div>

      <ChampListe id="statut" name="statut" label="Statut" defaultValue={valeurs.statut ?? "brouillon"}>
        <option value="brouillon">Brouillon – invisible du public</option>
        <option value="publie">Publié – visible dans le catalogue</option>
        <option value="archive">Archivé</option>
      </ChampListe>

      <Bouton type="submit" variante="marine" className="self-start">
        Enregistrer
      </Bouton>
    </form>
  );
}
