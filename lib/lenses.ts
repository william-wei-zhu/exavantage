import type { LensId } from "./firms";
import type { Report } from "./types";

// Framing for the single KKR desk: buy-and-build / roll-up add-on sourcing.
// You give the engine a platform company; it returns the proprietary add-on
// universe a deal team would walk into the Monday sourcing meeting with.

export type LensCopy = {
  id: LensId;
  /** Small deck kicker, e.g. "Deal Origination". */
  desk: string;
  /** What this report IS. */
  product: string;
  /** Cover title prefix, combined with the subject. */
  coverLine: (subject: string) => string;
  /** Slide 2: market context + catalysts. */
  whyNowTitle: string;
  mapTitle: string;
  mapIntro: string;
  /** Slide 3: the fragmentation thesis. */
  highlightTitle: string;
  highlightIntro: string;
  /** Slide 5: the platform candidate. */
  anchorTitle: string;
  quantTitle: string;
  /** Slide 7: value creation. */
  valueTitle: string;
  signalsTitle: string;
  signalsIntro: string;
  synthesisTitle: string;
  /** One sentence on the Exa edge for this desk. */
  exaEdge: string;
  // --- homepage "job to be done" ---
  /** The job, as a verb phrase. */
  jobTitle: string;
  /** One line on what the desk gets. */
  jobShort: string;
  /** Tailored example platforms (company-only). */
  examples: { label: string; query: string; domain?: string }[];
  /** Hint shown under the input. */
  inputHint: string;
};

export const LENSES: Record<LensId, LensCopy> = {
  buyout: {
    id: "buyout",
    desk: "Deal Origination",
    product: "Buy-and-Build Origination",
    coverLine: (s) => `Add-On Universe: ${s}`,
    whyNowTitle: "Why Now",
    mapTitle: "Where to Win",
    mapIntro:
      "The addressable set, clustered into the sub-segments a platform could consolidate, ranked by where to start.",
    highlightTitle: "The Fragmentation Thesis",
    highlightIntro:
      "Is this consolidatable? A fragmented field of sub-scale, mostly founder-owned players, with no dominant consolidator, is the setup for a buy-and-build.",
    anchorTitle: "The Anchor",
    quantTitle: "Priority Targets",
    valueTitle: "Value Creation",
    signalsTitle: "The Exa Edge",
    signalsIntro:
      "The proprietary names the databases never indexed, plus the fresh signals that say which target to call first.",
    synthesisTitle: "The Play",
    exaEdge:
      "Exa finds the fragmented long-tail of founder-owned targets that PitchBook and Sourcescrub never indexed.",
    jobTitle: "Source the add-ons, build the roll-up",
    jobShort:
      "Give us a platform company; we map its proprietary add-on universe for a buy-and-build.",
    examples: [
      { label: "Lululemon", query: "Lululemon", domain: "lululemon.com" },
      { label: "Sweetgreen", query: "Sweetgreen", domain: "sweetgreen.com" },
      { label: "Warby Parker", query: "Warby Parker", domain: "warbyparker.com" },
      { label: "Glossier", query: "Glossier", domain: "glossier.com" },
      { label: "Peloton", query: "Peloton", domain: "onepeloton.com" },
    ],
    inputHint: "Enter a platform company (e.g. ServiceTitan) and we map its add-on universe.",
  },
};

export function lensFor(id: LensId): LensCopy {
  return LENSES[id];
}

export function reportSubject(report: Report): string {
  return report.mode === "company" ? report.anchor?.name ?? report.query : report.query;
}
