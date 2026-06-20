// The single client desk: KKR (Private Equity). Every report renders in KKR's
// real brand (official logo + exact aubergine palette + KKR's deck grammar),
// framed inside Exa's outer shell — "Exa's tool producing KKR's deal-origination
// deck." The deck styling is cloned from KKR's own 4Q'24 overview presentation.

export type FirmTheme = {
  /** Primary brand color: KKR aubergine. Header bands, titles, the cover. */
  primary: string;
  /** Secondary brand color (KKR navy). */
  secondary: string;
  /** Bright accent (KKR teal/cyan): connectors, callouts, deck controls. */
  accent: string;
  /** Primary text color on the report. */
  ink: string;
  /** Report page background. */
  paper: string;
  /** Tinted panel / surface background. */
  surface: string;
  /** CSS variable for the heading font (loaded in layout.tsx). */
  headingFont: string;
  /** CSS variable for the body font. */
  bodyFont: string;
  // KKR stat-box palette (the colored metric boxes in their deck).
  lavender: string;
  green: string;
  gold: string;
};

export type FirmLogoSpec =
  | { kind: "svg"; src: string; ratio: number }
  | { kind: "wordmark"; transform?: "uppercase" | "lowercase" | "none"; tracking?: string };

export type FirmKind = "Investment Bank" | "Private Equity" | "Venture Capital";

/** The tailored workflow lens the deck is built around. */
export type LensId = "buyout";

export type Firm = {
  id: string;
  name: string;
  /** Short wordmark used where the SVG isn't shown. */
  wordmark: string;
  kind: FirmKind;
  /** Tailored workflow lens (drives slides, framing, quant). */
  lens: LensId;
  /** One-line brand mood, used to tune copy/tone. */
  mood: string;
  note?: string;
  theme: FirmTheme;
  logo: FirmLogoSpec;
  // Back-compat shortcuts (= theme.primary / theme.surface).
  accent: string;
  surface: string;
};

export const FIRMS: Firm[] = [
  {
    id: "kkr",
    name: "KKR",
    wordmark: "KKR",
    kind: "Private Equity",
    lens: "buyout",
    mood: "Institutional aubergine, light humanist titles, teal accents, ribbon motif.",
    theme: {
      primary: "#53284F", // KKR aubergine (exact, from the official logo)
      secondary: "#1B2A6B", // navy
      accent: "#16A9C8", // bright teal/cyan
      ink: "#171717",
      paper: "#ffffff",
      surface: "#F2EEF2", // light purple tint
      headingFont: "var(--font-hanken)",
      bodyFont: "var(--font-inter)",
      lavender: "#9598C8",
      green: "#3BA060",
      gold: "#F2C200",
    },
    logo: { kind: "svg", src: "/logos/kkr.svg", ratio: 4.02 },
    accent: "#53284F",
    surface: "#F2EEF2",
  },
];

export const DEFAULT_FIRM_ID = FIRMS[0].id;

export function firmById(id: string | null | undefined): Firm {
  return FIRMS.find((f) => f.id === id) ?? FIRMS[0];
}
