import { Bouton } from "@/components/ui/Bouton";
import { Champ, ChampListe } from "@/components/ui/Champ";

/* `datetime-local` attend « AAAA-MM-JJTHH:MM » en heure locale. Passer par
   toISOString() donnerait de l'UTC et décalerait la valeur affichée. */
function pourChamp(d: Date | null | undefined) {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function FormulaireSession({
  action,
  programmes,
  valeurs = {},
}: {
  action: (donnees: FormData) => void | Promise<void>;
  programmes: { id: string; titre: string }[];
  valeurs?: {
    id?: string;
    programmeId?: string;
    reference?: string;
    lieu?: string;
    ville?: string;
    debutAt?: Date;
    finAt?: Date;
    clotureAt?: Date;
    capacite?: number;
    prixFcfa?: number;
    statut?: string;
  };
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      {valeurs.id && <input type="hidden" name="id" value={valeurs.id} />}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <ChampListe
          id="programme"
          name="programme"
          label="Programme"
          required
          defaultValue={valeurs.programmeId ?? ""}
        >
          <option value="" disabled>
            Choisir…
          </option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titre}
            </option>
          ))}
        </ChampListe>

        <Champ
          id="reference"
          name="reference"
          label="Référence"
          required
          maxLength={80}
          defaultValue={valeurs.reference ?? ""}
          aide="Unique. Ex. LEVEE-2026-10."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Champ
          id="debut"
          name="debut"
          type="datetime-local"
          label="Début"
          required
          defaultValue={pourChamp(valeurs.debutAt)}
        />
        <Champ
          id="fin"
          name="fin"
          type="datetime-local"
          label="Fin"
          required
          defaultValue={pourChamp(valeurs.finAt)}
        />
        <Champ
          id="cloture"
          name="cloture"
          type="datetime-local"
          label="Clôture des inscriptions"
          required
          defaultValue={pourChamp(valeurs.clotureAt)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ
          id="lieu"
          name="lieu"
          label="Lieu"
          maxLength={200}
          defaultValue={valeurs.lieu ?? ""}
          placeholder="Siège SCG, Lot 100 Tokplegbe"
        />
        <Champ
          id="ville"
          name="ville"
          label="Ville"
          maxLength={120}
          defaultValue={valeurs.ville ?? "Cotonou"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Champ
          id="capacite"
          name="capacite"
          type="number"
          label="Capacité"
          required
          min={1}
          max={500}
          defaultValue={valeurs.capacite ?? 20}
          aide="Donne le nombre de sièges de la cohorte."
        />
        <Champ
          id="prix"
          name="prix"
          type="number"
          label="Participation (FCFA)"
          min={0}
          step={1000}
          defaultValue={valeurs.prixFcfa ?? 0}
        />
        <ChampListe id="statut" name="statut" label="Statut" defaultValue={valeurs.statut ?? "brouillon"}>
          <option value="brouillon">Brouillon</option>
          <option value="ouverte">Ouverte aux inscriptions</option>
          <option value="complete">Complète</option>
          <option value="close">Close</option>
          <option value="annulee">Annulée</option>
        </ChampListe>
      </div>

      <Bouton type="submit" variante="marine" className="self-start">
        Enregistrer
      </Bouton>
    </form>
  );
}
