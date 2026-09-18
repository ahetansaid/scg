import Link from "next/link";

import { estAdministration, type Utilisateur } from "@/lib/auth";

import { Logo } from "./Logo";

/* ============================================================================
   Ossature des zones connectées. Espace membre et back-office partagent la
   même : barre latérale blanche, plan de travail gris très clair.
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
    <div className="grid min-h-screen bg-brume md:grid-cols-[236px_1fr]">
      <aside className="flex flex-col gap-1 border-r border-ligne bg-white p-4 max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-2">
        <Link href="/" className="flex items-center gap-2 px-2 pb-4 no-underline max-md:pb-0">
          <Logo hauteur={40} />
          {zone === "admin" && (
            <span className="rounded-full bg-pastel-soleil px-2 py-0.5 text-[0.66rem] font-bold text-[#8a5f14]">Admin</span>
          )}
        </Link>

        {groupes.map((g, i) => (
          <nav key={g.titre ?? i} aria-label={g.titre ?? "Principal"} className="contents md:block">
            {g.titre && <p className="px-3 pt-4 pb-1.5 text-[0.72rem] font-bold text-gris max-md:hidden">{g.titre}</p>}
            {g.entrees.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                aria-current={actif === e.href ? "page" : undefined}
                className={`block rounded-puce px-3 py-2 text-[0.88rem] font-semibold no-underline transition-colors ${
                  actif === e.href ? "bg-canard-clair text-canard-fonce" : "text-marine hover:bg-brume"
                }`}
              >
                {e.libelle}
              </Link>
            ))}
          </nav>
        ))}

        <div className="mt-auto border-t border-ligne pt-3 max-md:mt-0 max-md:w-full max-md:border-t-0 max-md:pt-0">
          {estAdministration(utilisateur.role) && (
            <Link
              href={zone === "admin" ? "/espace" : "/admin"}
              className="block rounded-puce px-3 py-2 text-[0.85rem] font-semibold text-gris no-underline hover:text-marine"
            >
              {zone === "admin" ? "↩ Mon espace" : "→ Back-office"}
            </Link>
          )}
          <form action="/deconnexion" method="post">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-puce px-3 py-2 text-left text-[0.85rem] font-semibold text-gris hover:text-marine"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="p-5 sm:p-8">{children}</main>
    </div>
  );
}

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
        {surtitre && <p className="t-sur">{surtitre}</p>}
        <h1 className="mt-1 text-[1.7rem] leading-tight font-extrabold tracking-[-0.025em] text-marine">
          {titre}
          {accent && <span className="ml-2 text-canard">{accent}</span>}
        </h1>
        {sous && <p className="mt-2 text-[0.88rem] text-gris">{sous}</p>}
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
    <section className={`rounded-carte border border-ligne bg-white p-5 shadow-carte sm:p-6 ${className}`}>
      {titre && (
        <h2 className="mb-4 flex items-baseline justify-between gap-3 text-[0.95rem] font-bold text-marine">
          {titre}
          {extra && <span className="text-[0.78rem] font-semibold text-gris">{extra}</span>}
        </h2>
      )}
      {children}
    </section>
  );
}

/* Un état vide dit quoi faire ensuite, sinon il ressemble à une panne. */
export function Vide({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-carte border border-dashed border-ligne bg-white px-5 py-6 text-[0.92rem] text-gris">
      {children}
    </p>
  );
}
