import type { Metadata } from "next";

import { EnTete } from "@/components/EnTete";
import { PiedDePage } from "@/components/PiedDePage";
import { verifierCertificat } from "@/lib/espace";
import { formatLong, LIBELLE_NATURE, type Nature } from "@/lib/vocabulaire";

export const metadata: Metadata = {
  title: "Vérification d'un certificat",
  description: "Vérifier l'authenticité d'un certificat délivré par Strategic Consulting Group.",
  robots: { index: false },
};

/* Page publique et sans compte : un employeur doit pouvoir vérifier un
   certificat sans rien demander à personne. On n'affiche que ce qui est
   nécessaire, jamais l'adresse ni le téléphone du titulaire. */
export default async function Verification(props: PageProps<"/certificats/[numero]">) {
  const { numero } = await props.params;
  const c = await verifierCertificat(numero);

  return (
    <>
      <EnTete etroit sur="Vérification" titre={`Certificat ${numero}`} />

      <main className="mx-auto max-w-[680px] px-4 py-10 sm:px-6 md:py-14">
        {c ? (
          <div className="rounded-carte border-2 border-canard bg-white p-6 shadow-carte md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-canard-clair px-3 py-1 text-[0.8rem] font-bold text-canard-fonce">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Certificat authentique
            </p>
            <dl className="mt-5 flex flex-col gap-4 text-[0.95rem]">
              <div>
                <dt className="text-[0.78rem] font-semibold text-gris">Délivré à</dt>
                <dd className="mt-0.5 text-[1.3rem] font-extrabold text-marine">
                  {[c.prenom, c.nom].filter(Boolean).join(" ") || "Titulaire"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-semibold text-gris">Programme</dt>
                <dd className="mt-0.5 text-[1.05rem] font-semibold text-marine">{c.programme}</dd>
              </div>
              <div>
                <dt className="text-[0.78rem] font-semibold text-gris">Nature</dt>
                <dd className="mt-0.5 font-semibold text-marine">
                  {LIBELLE_NATURE[c.nature as Nature]}
                  {c.dureeLibelle ? ` · ${c.dureeLibelle}` : ""}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[0.78rem] font-semibold text-gris">Émis le</dt>
                  <dd className="mt-0.5 font-semibold text-marine">{formatLong.format(c.emisAt)}</dd>
                </div>
                <div>
                  <dt className="text-[0.78rem] font-semibold text-gris">Fin de session</dt>
                  <dd className="mt-0.5 font-semibold text-marine">{formatLong.format(c.finAt)}</dd>
                </div>
              </div>
            </dl>
            <p className="mt-5 border-t border-ligne pt-4 text-[0.86rem] text-gris">
              Ce certificat figure au registre de Strategic Consulting Group. En cas de doute, écrivez-nous en citant son numéro.
            </p>
          </div>
        ) : (
          <div className="rounded-carte border-2 border-terre/40 bg-white p-6 shadow-carte md:p-8">
            <p className="inline-flex rounded-full bg-pastel-corail px-3 py-1 text-[0.8rem] font-bold text-terre">
              Certificat introuvable
            </p>
            <p className="mt-4">
              Aucun certificat ne porte le numéro <strong>{numero}</strong> dans notre registre.
            </p>
            <p className="mt-3 text-[0.9rem] text-gris">
              Vérifiez la saisie : le numéro figure en bas du document. S&apos;il est correct, écrivez-nous. Un certificat
              présenté comme authentique et absent du registre est un signalement que nous voulons recevoir.
            </p>
          </div>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
