import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq, inArray } from "drizzle-orm";

import { Application, Panneau, TitrePage, Vide } from "@/components/Application";
import { Cohorte, type EtatSiege } from "@/components/motifs/Cohorte";
import { BoutonLien } from "@/components/ui/Bouton";
import { Alerte } from "@/components/ui/Champ";
import { exigerRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { inscriptions, programmes, sessions } from "@/lib/db/schema";
import { formatLong, montant } from "@/lib/vocabulaire";

export const metadata: Metadata = { title: "Sessions · back-office" };

const ERREURS: Record<string, string> = {
  dates: "Une des dates n'est pas valide.",
  ordre: "La fin doit venir après le début.",
  cloture: "La clôture des inscriptions ne peut pas tomber après la fin de la session.",
  capacite: "La capacité ne peut pas descendre en dessous du nombre de places déjà confirmées.",
  reference: "Cette référence est déjà utilisée par une autre session. Choisissez-en une autre.",
};

export default async function AdminSessions(props: PageProps<"/admin/sessions">) {
  const utilisateur = await exigerRole("admin", "formateur");

  const liste = await db
    .select({
      id: sessions.id,
      reference: sessions.reference,
      debut: sessions.debutAt,
      capacite: sessions.capacite,
      prixFcfa: sessions.prixFcfa,
      statut: sessions.statut,
      titre: programmes.titre,
    })
    .from(sessions)
    .innerJoin(programmes, eq(programmes.id, sessions.programmeId))
    .orderBy(asc(sessions.debutAt));

  const parSession = new Map<string, { confirmees: number; attente: number }>();
  if (liste.length > 0) {
    const lignes = await db
      .select({ sessionId: inscriptions.sessionId, statut: inscriptions.statut, n: count() })
      .from(inscriptions)
      .where(
        inArray(
          inscriptions.sessionId,
          liste.map((s) => s.id),
        ),
      )
      .groupBy(inscriptions.sessionId, inscriptions.statut);

    for (const l of lignes) {
      const e = parSession.get(l.sessionId) ?? { confirmees: 0, attente: 0 };
      if (l.statut === "confirmee" || l.statut === "terminee") e.confirmees += Number(l.n);
      if (l.statut === "en_attente") e.attente += Number(l.n);
      parSession.set(l.sessionId, e);
    }
  }

  const params = await props.searchParams;
  const lire = (c: string) => {
    const v = params[c];
    return Array.isArray(v) ? v[0] : v;
  };
  const erreur = lire("erreur");

  return (
    <Application utilisateur={utilisateur} zone="admin" actif="/admin/sessions">
      <TitrePage
        surtitre="Back-office"
        titre="Les"
        accent="sessions"
        sous={`${liste.length} au calendrier.`}
        actions={
          <BoutonLien href="/admin/sessions/nouvelle" variante="marine" taille="sm">
            Nouvelle session
          </BoutonLien>
        }
      />

      {lire("enregistre") === "1" && <Alerte nature="succes">Session enregistrée.</Alerte>}
      {erreur && <Alerte nature="erreur">{ERREURS[erreur] ?? "L'enregistrement a échoué."}</Alerte>}

      <Panneau>
        {liste.length === 0 ? (
          <Vide>
            Aucune session.{" "}
            <Link href="/admin/sessions/nouvelle" className="font-semibold text-marine">
              Créez la première
            </Link>{" "}
            – c&apos;est elle qui fait apparaître un programme dans le calendrier public.
          </Vide>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-4 pl-0">
            {liste.map((s) => {
              const e = parSession.get(s.id) ?? { confirmees: 0, attente: 0 };
              const sieges: EtatSiege[] = [
                ...Array<EtatSiege>(Math.min(e.confirmees, s.capacite)).fill("solde"),
                ...Array<EtatSiege>(
                  Math.max(0, Math.min(e.attente, s.capacite - e.confirmees)),
                ).fill("acompte"),
              ];
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-ligne pb-4 last:border-b-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/admin/sessions/${s.id}`}
                      className="text-[0.95rem] font-semibold text-encre no-underline hover:text-marine"
                    >
                      {s.titre}
                    </Link>
                    <span className="t-etiquette mt-0.5 block text-[0.56rem] text-gris">
                      {s.reference} · {formatLong.format(s.debut)} · {montant(s.prixFcfa)} FCFA ·{" "}
                      {s.statut}
                    </span>
                  </div>
                  <Cohorte capacite={s.capacite} sieges={sieges} compteur />
                </li>
              );
            })}
          </ul>
        )}
      </Panneau>
    </Application>
  );
}
