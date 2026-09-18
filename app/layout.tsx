import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/* Une seule famille, auto-hébergée par next/font : aucune requête vers
   Google depuis le navigateur du visiteur. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SCG – Strategic Consulting Group",
    template: "%s · SCG",
  },
  description:
    "Masterclasses, formations certifiantes et mentorat pour les dirigeants, cadres publics et entrepreneurs. Cotonou, Bénin.",
};

export const viewport: Viewport = {
  themeColor: "#0b2e5b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-blanc text-encre">{children}</body>
    </html>
  );
}
