import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navigation } from "@/components/Navigation";
import { PiedDePage } from "@/components/PiedDePage";
import { Bouton } from "@/components/ui/Bouton";
import { utilisateurCourant } from "@/lib/auth";
import { estEnFavori } from "@/lib/espace";
import { slugsOpportunites, trouverOpportunite } from "@/lib/publications";
import { formatLong } from "@/lib/vocabulaire";

import { basculerFavori } from "../../espace/actions";

export async function generateStaticParams() {
  return (await slugsOpportunites()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/opportunites/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const o = await trouverOpportunite(slug);
  if (!o) return { title: "Opportunité introuvable" };
  return { title: o.titre, description: o.description.slice(0, 160) };
}

export default async function Opportunite(props: PageProps<"/opportunites/[slug]">) {
  const { slug } = await props.params;
  const [o, utilisateur] = await Promise.all([trouverOpportunite(slug), utilisateurCourant()]);
  if (!o) notFound();

  const enFavori = utilisateur ? await estEnFavori(utilisateur.id, "opportunite", o.id) : false;
  const { expiree } = o;

  return (
    <>
      <div
        className="pb-10"
        style={{
          background:
            "radial-gradient(66% 60% at 88% -10%, rgba(62,143,193,.3) 0%, rgba(62,143,193,0) 66%)," +
            "linear-gradient(178deg,#04101f 0%,#0a2646 72%,#0b2e5b 100%)",
        }}
      >
        <Navigation />

        <div className="mx-auto max-w-[1010px] px-4 pt-8 sm:px-8">
          <p className="t-balise text-laiton">
            <Link href="/opportunites" className="text-laiton no-underline hover:underline">
              Opportunités
            </Link>{" "}
            · {o.nature} · {o.domaine}
          </p>
          <h1 className="t-h2 mt-2 max-w-[22ch] text-white">{o.titre}</h1>
          <p className="mt-2 text-[#b9cddf]">
            {o.organisation}
            {o.lieu ? ` · ${o.lieu}` : ""}
          </p>
        </div>
      </div>

      <main className="bg-papier">
        <div className="mx-auto grid max-w-[1010px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.5fr_1fr] md:py-14">
          <div>
            {o.description && <p className="max-w-[62ch] text-[1.02rem]">{o.description}</p>}

            {o.missions.length > 0 && (
              <>
                <h2 className="t-h3 mt-9 mb-3">Les missions</h2>
                <ul className="m-0 flex list-none flex-col gap-2 pl-0">
                  {o.missions.map((m) => (
                    <li key={m} className="flex gap-3 text-[0.94rem]">
                      <span
                        aria-hidden="true"
                        className="mt-2 block size-1.5 shrink-0 rounded-full bg-laiton-fonce"
                      />
                      {m}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {o.profil.length > 0 && (
              <>
                <h2 className="t-h3 mt-9 mb-3">Le profil recherché</h2>
                <ul className="m-0 flex list-none flex-col gap-2 pl-0 text-[0.94rem] text-gris">
                  {o.profil.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="md:sticky md:top-6 md:self-start">
            <div className="rounded-panneau border border-ligne bg-white p-5">
              {o.dateLimite && (
                <>
                  <p className="t-balise text-[0.58rem] text-gris">Date limite</p>
                  <p className={`mt-1 text-[1.1rem] font-bold ${expiree ? "text-terre" : "text-marine"}`}>
                    {formatLong.format(o.dateLimite)}
                  </p>
                  {expiree && (
                    <p className="mt-1 text-[0.82rem] text-terre">Cette échéance est passée.</p>
                  )}
                </>
              )}

              <div className="mt-5 flex flex-col gap-2 border-t border-ligne-douce pt-4">
                {utilisateur ? (
                  <form action={basculerFavori}>
                    <input type="hidden" name="nature" value="opportunite" />
                    <input type="hidden" name="cible" value={o.id} />
                    <input type="hidden" name="retour" value={`/opportunites/${slug}`} />
                    <Bouton
                      type="submit"
                      variante={enFavori ? "marine" : "fantomeClair"}
                      className="w-full justify-center"
                    >
                      {enFavori ? "Retirer des favoris" : "Mettre de côté"}
                    </Bouton>
                  </form>
                ) : (
                  <p className="m-0 text-[0.84rem] text-gris">
                    <Link href={`/connexion?suite=/opportunites/${slug}`} className="font-semibold text-marine">
                      Connectez-vous
                    </Link>{" "}
                    pour mettre cette opportunité de côté.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
