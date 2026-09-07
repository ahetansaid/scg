import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

/* Les trois voix de la charte. next/font les auto-héberge : aucune requête
   vers Google depuis le navigateur du visiteur. */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

/* Instrument Serif n'est chargée qu'en italique — c'est la règle de la
   charte, et ça évite d'embarquer un romain qu'on n'utilisera jamais. */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SCG — Strategic Consulting Group",
    template: "%s · SCG",
  },
  description:
    "Masterclasses, formations certifiantes et mentorat pour les dirigeants, cadres publics et entrepreneurs. Cotonou, Bénin.",
};

export const viewport: Viewport = {
  themeColor: "#06182f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-papier text-encre">{children}</body>
    </html>
  );
}
