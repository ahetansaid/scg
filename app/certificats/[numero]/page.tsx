import type { Metadata } from "next";

import { Navigation } from "@/components/Navigation";
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
   nécessaire à la vérification – pas l'adresse ni le téléphone du titulaire. */
export default async function Verification(props: PageProps<"/certificats/[numero]">) {
  const { numero } = await props.params;
  const c = await verifierCertificat(numero);

  return (
    <>
      <div
        className="pb-9"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 72%,#0b2e5b 100%)",
        }}
      >
        <Navigation />
        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">Vérification</p>
          <h1 className="t-h2 mt-2 text-white">
            Certificat <em className="t-italique text-laiton">{numero}</em>
          </h1>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto max-w-[680px] px-4 py-10 sm:px-8 md:py-14">
          {c ? (
            <div className="rounded-panneau border border-vert/30 bg-white p-6">
              <p className="t-balise m-0 text-[0.6rem] text-vert">Certificat authentique</p>

              <dl className="mt-4 flex flex-col gap-4 text-[0.94rem]">
                <div>
                  <dt className="t-balise text-[0.58rem] text-gris">Délivré à</dt>
                  <dd className="m-0 mt-0.5 text-[1.15rem] font-bold tracking-[-0.02em]">
                    {[c.prenom, c.nom].filter(Boolean).join(" ") || "Titulaire"}
                  </dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-gris">Programme</dt>
                  <dd className="t-italique m-0 mt-0.5 text-[1.1rem]">{c.programme}</dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-gris">Nature</dt>
                  <dd className="m-0 mt-0.5 font-medium">
                    {LIBELLE_NATURE[c.nature as Nature]}
                    {c.dureeLibelle ? ` · ${c.dureeLibelle}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-gris">Émis le</dt>
                  <dd className="m-0 mt-0.5 font-medium">{formatLong.format(c.emisAt)}</dd>
                </div>
                <div>
                  <dt className="t-balise text-[0.58rem] text-gris">Fin de session</dt>
                  <dd className="m-0 mt-0.5 font-medium">{formatLong.format(c.finAt)}</dd>
                </div>
              </dl>

              <p className="mt-5 border-t border-ligne-douce pt-4 text-[0.84rem] text-gris">
                Ce certificat figure au registre de Strategic Consulting Group. En cas de doute,
                écrivez-nous en citant son numéro.
              </p>
            </div>
          ) : (
            <div className="rounded-panneau border border-terre/30 bg-white p-6">
              <p className="t-balise m-0 text-[0.6rem] text-terre">Certificat introuvable</p>
              <p className="mt-3 text-[0.95rem]">
                Aucun certificat ne porte le numéro <strong>{numero}</strong> dans notre registre.
              </p>
              <p className="mt-3 text-[0.88rem] text-gris">
                Vérifiez la saisie : le numéro figure en bas du document. S&apos;il est correct,
                écrivez-nous – un certificat présenté comme authentique et absent du registre est
                un signalement que nous voulons recevoir.
              </p>
            </div>
          )}
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
