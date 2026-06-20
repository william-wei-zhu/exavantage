// The six pre-selected client firms. Each report renders in the SELECTED firm's
// real brand (logo + exact palette + font pairing + bespoke template), framed
// inside Exa's outer shell — "Exa's tool producing the client's research."
// Benchmark and a16z are Exa investors (the AE's natural opener).
//
// Palettes + type are from brand research. Goldman & J.P. Morgan use their real
// SVG wordmarks (public sources, demo use); the other four are wordmark logos
// recreated faithfully in their brand font + color.

export type FirmTheme = {
  /** Primary brand color (headers, rules, the cover). */
  primary: string;
  /** Secondary brand color. */
  secondary: string;
  /** Accent for small highlights. */
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
};

export type FirmLogoSpec =
  | { kind: "svg"; src: string; ratio: number }
  | { kind: "wordmark"; transform?: "uppercase" | "lowercase" | "none"; tracking?: string };

export type FirmKind = "Investment Bank" | "Private Equity" | "Venture Capital";

/** The tailored workflow lens each firm's report is built around. */
export type LensId = "ipo" | "buyout" | "landscape";

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
    id: "goldman-sachs",
    name: "Goldman Sachs",
    wordmark: "Goldman Sachs",
    kind: "Investment Bank",
    lens: "ipo",
    mood: "Institutional, navy-and-serif, gravitas through restraint.",
    theme: {
      primary: "#00355F",
      secondary: "#7399C6",
      accent: "#ACD4F1",
      ink: "#1b1b1b",
      paper: "#ffffff",
      surface: "#eef3f8",
      headingFont: "var(--font-source-serif)",
      bodyFont: "var(--font-inter)",
    },
    logo: { kind: "svg", src: "/logos/goldman-sachs.svg", ratio: 1 },
    accent: "#00355F",
    surface: "#eef3f8",
  },
  {
    id: "blackstone",
    name: "Blackstone",
    wordmark: "Blackstone",
    kind: "Private Equity",
    lens: "buyout",
    mood: "Austere, monochrome black, high-contrast serif, institutional weight.",
    theme: {
      primary: "#0a0a0a",
      secondary: "#3a3a3a",
      accent: "#8a6d3b",
      ink: "#111111",
      paper: "#ffffff",
      surface: "#f2f2f2",
      headingFont: "var(--font-playfair)",
      bodyFont: "var(--font-inter)",
    },
    logo: { kind: "wordmark", transform: "none", tracking: "-0.01em" },
    accent: "#0a0a0a",
    surface: "#f2f2f2",
  },
  {
    id: "a16z",
    name: "a16z",
    wordmark: "a16z",
    kind: "Venture Capital",
    lens: "landscape",
    mood: "Editorial, burgundy on cream with gold, tech-optimist media-house.",
    note: "Exa investor",
    theme: {
      primary: "#4A0315",
      secondary: "#977270",
      accent: "#C98A3B",
      ink: "#241015",
      paper: "#F6F1E7",
      surface: "#ece3d2",
      headingFont: "var(--font-space-grotesk)",
      bodyFont: "var(--font-space-grotesk)",
    },
    logo: { kind: "wordmark", transform: "lowercase", tracking: "-0.03em" },
    accent: "#4A0315",
    surface: "#ece3d2",
  },
];

export const DEFAULT_FIRM_ID = FIRMS[0].id;

export function firmById(id: string | null | undefined): Firm {
  return FIRMS.find((f) => f.id === id) ?? FIRMS[0];
}
