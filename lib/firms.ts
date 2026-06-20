// The six pre-selected client firms. The report renders in the SELECTED firm's
// brand (logo wordmark + accent), framed inside Exa's outer shell — "Exa's tool
// producing the client's research." Benchmark and a16z are Exa investors, which
// gives the AE a natural opener.
//
// Logos are rendered as styled wordmarks (no third-party trademark image assets
// are bundled), so the deliverable reads as the client's brand without shipping
// copyrighted logo files. `accent` drives section rules, the map header, and the
// PDF; `surface` is the pale tint behind branded panels.

export type Firm = {
  id: string;
  name: string;
  /** Short wordmark shown in the branded report header. */
  wordmark: string;
  kind: "Investment Bank" | "Private Equity" | "Asset Management" | "Venture Capital";
  accent: string;
  surface: string;
  /** Optional note surfaced in the picker (e.g. Exa investor). */
  note?: string;
};

export const FIRMS: Firm[] = [
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    wordmark: "Goldman Sachs",
    kind: "Investment Bank",
    accent: "#6f86b6",
    surface: "#eef1f7",
  },
  {
    id: "jpmorgan-chase",
    name: "J.P. Morgan Chase",
    wordmark: "J.P.Morgan",
    kind: "Investment Bank",
    accent: "#5a4632",
    surface: "#f3efe9",
  },
  {
    id: "kkr",
    name: "KKR",
    wordmark: "KKR",
    kind: "Private Equity",
    accent: "#1c1c1c",
    surface: "#f0f0f0",
  },
  {
    id: "blackrock",
    name: "BlackRock",
    wordmark: "BlackRock",
    kind: "Asset Management",
    accent: "#1a1a1a",
    surface: "#efefef",
  },
  {
    id: "benchmark",
    name: "Benchmark",
    wordmark: "Benchmark",
    kind: "Venture Capital",
    accent: "#11705a",
    surface: "#e9f2ef",
    note: "Exa investor",
  },
  {
    id: "a16z",
    name: "a16z",
    wordmark: "a16z",
    kind: "Venture Capital",
    accent: "#e9573f",
    surface: "#fdeee9",
    note: "Exa investor",
  },
];

export const DEFAULT_FIRM_ID = FIRMS[0].id;

export function firmById(id: string | null | undefined): Firm {
  return FIRMS.find((f) => f.id === id) ?? FIRMS[0];
}
