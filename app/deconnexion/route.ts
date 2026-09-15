import { NextResponse, type NextRequest } from "next/server";

import { fermerSession } from "@/lib/auth";

/* La déconnexion passe par POST : un GET la rendrait déclenchable depuis une
   simple image ou un lien préchargé par le navigateur. */
export async function POST(requete: NextRequest) {
  await fermerSession();
  return NextResponse.redirect(new URL("/", requete.url), { status: 303 });
}
