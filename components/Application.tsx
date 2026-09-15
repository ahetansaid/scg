import Link from "next/link";

import { estAdministration, type Utilisateur } from "@/lib/auth";

import { Sigle } from "./Navigation";

/* ============================================================================
   Ossature des zones connectées.
   Espace membre et back-office partagent exactement la même : barre latérale
   nuit, plan de travail papier. Un seul squelette à maintenir.
   ============================================================================ */

type Entree = { href: string; libelle: string };
type Groupe = { titre?: string; entrees: Entree[] };

const MEMBRE: Groupe[] = [
  {
    entrees: [
      { href: "/espace", libelle: "Ma trajectoire" },
      { href: "/espace/programmes", libelle: "Mes programmes" },
      { href: "/espace/mentorat", libelle: "Mon mentorat" },
      { href: "/espace/certificats", libelle: "Mes certificats" },
    ],
  },
  {
    titre: "Ressources",
    entrees: [
      { href: "/publications", libelle: "Publications" },
      { href: "/opportunites", libelle: "Opportunités" },
      { href: "/espace/favoris", libelle: "Mes favoris" },
    ],
  },
  { titre: "Compte", entrees: [{ href: "/espace/profil", libelle: "Mon profil" }] },
];

const ADMIN: Groupe[] = [
  {
    entrees: [
      { href: "/admin", libelle: "Vue d'ensemble" },
      { href: "/admin/programmes", libelle: "Programmes" },
      { href: "/admin/sessions", libelle: "Sessions" },
    ],
  },
  {
    titre: "Communauté",
    entrees: [
      { href: "/admin/mentors", libelle: "Mentors" },
      { href: "/admin/demandes", libelle: "Demandes de mentorat" },
      { href: "/admin/membres", libelle: "Membres" },
    ],
  },
  {
    titre: "Contenu",
    entrees: [
      { href: "/admin/publications", libelle: "Publications" },
      { href: "/admin/opportunites", libelle: "Opportunités" },
    ],
  },
];

export function Application({
  utilisateur,
  zone,
  actif,
  children,
}: {
  utilisateur: Utilisateur;
  zone: "espace" | "admin";
  actif: string;
  children: React.ReactNode;
}) {
  const groupes = zone === "admin" ? ADMIN : MEMBRE;

  return (
    <div className="grid min-h-screen md:grid-cols-[210px_1fr]">
      <aside className="flex flex-col gap-1 border-r border-white/8 bg-nuit p-3.5 max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-2">
        <Link href="/" className="flex items-center gap-2 px-2.5 pb-3.5 text-white no-underline max-md:pb-0">
          <Sigle />
          {zone === "admin" && (
            <span className="t-balise text-[0.53rem] text-laiton-vif">Admin</span>
          )}
        </Link>

        {groupes.map((g, i) => (
          <nav key={g.titre ?? i} aria-label={g.titre ?? "Principal"} className="contents md:block">
            {g.titre && (
              <p className="t-balise px-2.5 pt-4 pb-1.5 text-[0.56rem] text-[#5f7b96] max-md:hidden">
                {g.titre}
              </p>
            )}
            {g.entrees.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                aria-current={actif === e.href ? "page" : undefined}
                className={`block rounded-[9px] px-2.5 py-2 text-[0.82rem] no-underline transition-colors ${
                  actif === e.href
                    ? "bg-laiton/16 font-semibold text-[#e0b457]"
                    : "text-[#9fb8ce] hover:bg-white/5 hover:text-white"
                }`}
              >
                {e.libelle}
              </Link>
            ))}
          </nav>
        ))}

        <div className="mt-auto border-t border-white/10 pt-3 max-md:mt-0 max-md:w-full max-md:border-t-0 max-md:pt-0">
          {estAdministration(utilisateur.role) && (
            <Link
              href={zone === "admin" ? "/espace" : "/admin"}
              className="block rounded-[9px] px-2.5 py-2 text-[0.8rem] text-[#9fb8ce] no-underline hover:text-white"
            >
              {zone === "admin" ? "↩ Mon espace" : "→ Back-office"}
            </Link>
          )}
          <form action="/deconnexion" method="post">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-[9px] px-2.5 py-2 text-left text-[0.8rem] text-[#9fb8ce] hover:text-white"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="bg-papier p-5 sm:p-7">{children}</main>
    </div>
  );
}

/* En-tête de page interne : titre, sous-titre, actions à droite. */
export function TitrePage({
  surtitre,
  titre,
  accent,
  sous,
  actions,
}: {
  surtitre?: string;
  titre: string;
  accent?: string;
  sous?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {surtitre && <p className="t-balise text-[0.6rem] text-laiton-fonce">{surtitre}</p>}
        <h1 className="mt-1.5 text-[1.65rem] leading-none font-extrabold tracking-[-0.04em]">
          {titre}
          {accent && <em className="t-italique ml-2 font-normal text-laiton-fonce">{accent}</em>}
        </h1>
        {sous && <p className="mt-2 text-[0.83rem] text-gris">{sous}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panneau({
  titre,
  extra,
  children,
  className = "",
}: {
  titre?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-carte border border-ligne bg-white p-4 sm:p-5 ${className}`}>
      {titre && (
        <h2 className="mb-3.5 flex items-baseline justify-between gap-3 text-[0.85rem] font-bold tracking-[-0.02em]">
          {titre}
          {extra && <span className="t-balise text-[0.6rem] font-normal text-gris">{extra}</span>}
        </h2>
      )}
      {children}
    </section>
  );
}

/* Un état vide dit quoi faire ensuite, sinon il ressemble à une panne. */
export function Vide({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-carte border border-dashed border-ligne bg-white/60 px-5 py-6 text-[0.9rem] text-gris">
      {children}
    </p>
  );
}
