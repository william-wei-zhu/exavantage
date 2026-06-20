import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Source_Serif_4,
  Playfair_Display,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-exa-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

// Per-firm brand fonts (substitutes for the firms' proprietary typefaces),
// applied within each bespoke report template via CSS variables.
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

const FIRM_FONT_VARS = [
  sourceSerif.variable,
  playfair.variable,
  inter.variable,
  spaceGrotesk.variable,
].join(" ");

const TAGLINE = "Your vantage point on every market.";

export const metadata: Metadata = {
  metadataBase: new URL("https://exavantage.com"),
  title: {
    default: "Exa Vantage · Your vantage point on every market",
    template: "%s · Exa Vantage",
  },
  description: TAGLINE,
  applicationName: "Exa Vantage",
  openGraph: {
    title: "Exa Vantage",
    description: TAGLINE,
    url: "https://exavantage.com",
    siteName: "Exa Vantage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exa Vantage",
    description: TAGLINE,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${cormorant.variable} ${FIRM_FONT_VARS}`}>
      <body className="exa-theme antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
