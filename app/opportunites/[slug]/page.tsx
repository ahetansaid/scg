import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnTete } from "@/components/EnTete";
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
      <EnTete
        fil={[{ href: "/opportunites", libelle: "Opportunités" }]}
        sur={`${o.nature} · ${o.domaine}`}
        titre={o.titre}
        sous={
          <p>
            {o.organisation}
            {o.lieu ? ` · ${o.lieu}` : ""}
          </p>
        }
      />

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr] md:py-14">
        <div>
          {o.description && <p className="max-w-[64ch] text-[1.05rem] leading-relaxed">{o.description}</p>}

          {o.missions.length > 0 && (
            <section className="mt-10">
              <h2 className="t-h2 text-[1.5rem]">Les missions</h2>
              <ul className="mt-4 flex list-none flex-col gap-2 pl-0">
                {o.missions.map((m) => (
                  <li key={m} className="flex gap-3 text-[0.95rem]">
                    <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-canard" />
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {o.profil.length > 0 && (
            <section className="mt-10">
              <h2 className="t-h2 text-[1.5rem]">Le profil recherché</h2>
              <ul className="mt-4 flex list-none flex-col gap-2 pl-0 text-[0.95rem] text-gris">
                {o.profil.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-canard" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="md:sticky md:top-6 md:self-start">
          <div className="rounded-carte border border-ligne bg-white p-6 shadow-carte">
            {o.dateLimite && (
              <>
                <p className="text-[0.78rem] font-semibold text-gris">Date limite</p>
                <p className={`mt-1 text-[1.3rem] font-extrabold ${expiree ? "text-terre" : "text-marine"}`}>
                  {formatLong.format(o.dateLimite)}
                </p>
                {expiree && <p className="mt-1 text-[0.85rem] text-terre">Cette échéance est passée.</p>}
              </>
            )}
            <div className="mt-5 border-t border-ligne pt-5">
              {utilisateur ? (
                <form action={basculerFavori}>
                  <input type="hidden" name="nature" value="opportunite" />
                  <input type="hidden" name="cible" value={o.id} />
                  <input type="hidden" name="retour" value={`/opportunites/${slug}`} />
                  <Bouton type="submit" variante={enFavori ? "marine" : "contour"} className="w-full">
                    {enFavori ? "Retirer des favoris" : "Mettre de côté"}
                  </Bouton>
                </form>
              ) : (
                <p className="text-[0.88rem] text-gris">
                  <Link href={`/connexion?suite=/opportunites/${slug}`} className="font-semibold text-canard">
                    Connectez-vous
                  </Link>{" "}
                  pour mettre cette opportunité de côté.
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>

      <PiedDePage />
    </>
  );
}
