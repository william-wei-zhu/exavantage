import type { LensId } from "./firms";
import type { Report } from "./types";

// Framing for each tailored workflow. One shared discovery engine; the lens
// reframes titles, the cover, the highlight slide, and the synthesis so a
// Goldman ECM deck, a Blackstone buyout deck, and an a16z landscape deck read as three
// genuinely different products built for three different desks.

export type LensCopy = {
  id: LensId;
  /** Small deck kicker, e.g. "Equity Capital Markets". */
  desk: string;
  /** What this report IS, e.g. "IPO Candidates & Comparables". */
  product: string;
  /** Cover title prefix, combined with the subject. */
  coverLine: (subject: string) => string;
  mapTitle: string;
  mapIntro: string;
  /** The lens-specific highlight slide. */
  highlightTitle: string;
  highlightIntro: string;
  quantTitle: string;
  signalsTitle: string;
  signalsIntro: string;
  synthesisTitle: string;
  /** One sentence on the Exa edge for this desk. */
  exaEdge: string;
  // --- homepage "job to be done" ---
  /** The job, as a verb phrase, e.g. "Find IPO candidates & comparables". */
  jobTitle: string;
  /** One line on what the desk gets. */
  jobShort: string;
  /** Tailored example prompts (mix of company + sector). */
  examples: { label: string; query: string }[];
  /** Hint shown under the input for this desk. */
  inputHint: string;
};

export const LENSES: Record<LensId, LensCopy> = {
  ipo: {
    id: "ipo",
    desk: "Equity Capital Markets",
    product: "IPO Candidates & Comparables",
    coverLine: (s) => `IPO Candidates & Comparables: ${s}`,
    mapTitle: "Comparable Universe",
    mapIntro: "The peer set, clustered by sub-segment — the comparables that frame a pricing conversation.",
    highlightTitle: "IPO Watch",
    highlightIntro: "Late-stage and well-capitalized names that read as the nearest public-market candidates.",
    quantTitle: "Comparables",
    signalsTitle: "Capital-Markets Signals",
    signalsIntro: "Recent funding, capital raises, and strategic moves across the peer set.",
    synthesisTitle: "The Memo",
    exaEdge: "Exa surfaces private and recently-funded comparables that PitchBook and Bloomberg lag on.",
    jobTitle: "Find IPO candidates & comparables",
    jobShort: "Build a comp set and spot the late-stage names nearing the public markets.",
    examples: [
      { label: "Stripe", query: "Stripe" },
      { label: "Databricks", query: "Databricks" },
      { label: "AI infrastructure", query: "AI infrastructure for enterprises" },
    ],
    inputHint: "Try a company to comp (e.g. Stripe) or a sector to scan for IPO candidates.",
  },
  buyout: {
    id: "buyout",
    desk: "Deal Origination",
    product: "Acquisition Targets & Buy-and-Build",
    coverLine: (s) => `Acquisition Targets: ${s}`,
    mapTitle: "Target Universe",
    mapIntro: "The addressable set, clustered into the sub-segments a platform could consolidate.",
    highlightTitle: "Platform & Add-Ons",
    highlightIntro: "The most established names read as platform candidates; the long tail are add-on targets for a buy-and-build.",
    quantTitle: "Target Screen",
    signalsTitle: "Deal Signals",
    signalsIntro: "Recent funding, leadership, and consolidation activity that move a target up or down the list.",
    synthesisTitle: "The Deal Thesis",
    exaEdge: "Exa finds the fragmented long-tail of sub-scale targets that structured databases never catalogued.",
    jobTitle: "Source targets & build a roll-up",
    jobShort: "Find a platform plus the add-on targets to consolidate a fragmented market.",
    examples: [
      { label: "Veterinary software", query: "veterinary practice management software" },
      { label: "ServiceTitan", query: "ServiceTitan" },
      { label: "Managed IT services", query: "managed IT services providers for SMBs" },
    ],
    inputHint: "Try a fragmented sector (e.g. dental software) or a company to build around.",
  },
  landscape: {
    id: "landscape",
    desk: "Investment Team",
    product: "Competitive Landscape & Emerging",
    coverLine: (s) => `Competitive Landscape: ${s}`,
    mapTitle: "The Landscape",
    mapIntro: "The competitive map, clustered by sub-segment, with the white space between the clusters.",
    highlightTitle: "Emerging & White Space",
    highlightIntro: "The under-the-radar names a thesis hangs on — early, fast, and not yet on most lists.",
    quantTitle: "Momentum",
    signalsTitle: "Recent Signals",
    signalsIntro: "Fresh launches, funding, and hiring that show where the energy is moving.",
    synthesisTitle: "The Thesis",
    exaEdge: "Exa Agent's deep research surfaces emerging startups the moment they appear, before the databases catch up.",
    jobTitle: "Map the landscape & find what's emerging",
    jobShort: "Chart a market, surface the under-the-radar startups, and spot the white space.",
    examples: [
      { label: "AI agents for support", query: "AI agents for customer support" },
      { label: "Vertical SaaS for construction", query: "vertical SaaS for construction" },
      { label: "Perplexity", query: "Perplexity" },
    ],
    inputHint: "Try a thesis (e.g. AI agents for support) or a company to map around.",
  },
};

export function lensFor(id: LensId): LensCopy {
  return LENSES[id];
}

export function reportSubject(report: Report): string {
  return report.mode === "company" ? report.anchor?.name ?? report.query : report.query;
}
