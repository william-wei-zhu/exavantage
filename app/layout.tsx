import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
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
    <html lang="en" className={`${geist.variable} ${cormorant.variable}`}>
      <body className="exa-theme antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
