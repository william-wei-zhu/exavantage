// Shared domain model for an Exavantage market-intelligence report.

export type ReportMode = "company" | "sector";

/** One company in the discovered universe (a tear sheet). */
export type Company = {
  name: string;
  domain: string;
  /** Sub-segment / cluster this company belongs to (drives the market map). */
  segment: string;
  /** One-line description of what the company does. */
  oneLiner: string;
  /** 2-4 sentence extracted profile. */
  summary: string;
  /** One recent signal (funding, launch, partnership, hiring), if found. */
  recentSignal?: string;
  recentSignalUrl?: string;
  /** 2-3 similar companies (names only) for the "similar to" row. */
  similar: string[];
  /** Whether this company reads as emerging / under-the-radar. */
  emerging: boolean;

  // --- quant (estimated from public web; left blank when not evident) ---
  /** Year founded, e.g. 2019. */
  foundedYear?: number;
  /** Total funding raised, as a human string, e.g. "$120M". */
  funding?: string;
  /** Last/round stage, e.g. "Seed", "Series C", "Public", "Bootstrapped". */
  stage?: string;
  /** Estimated headcount range, e.g. "51-200". */
  employees?: string;
  /** HQ region, e.g. "San Francisco, US". */
  region?: string;
};

/** A market-map cluster: a sub-segment label and the companies inside it. */
export type Segment = {
  label: string;
  /** One-line description of the sub-segment. */
  blurb: string;
  /** Company domains in this cluster (resolve against `companies`). */
  domains: string[];
};

export type Report = {
  mode: ReportMode;
  /** The restated input: a company name or a sector thesis. */
  query: string;
  /** Company mode only: the resolved anchor company. */
  anchor?: { name: string; domain: string };
  /** Sub-segment clusters for the market map. */
  segments: Segment[];
  /** Every profiled company (tear sheets). */
  companies: Company[];
  /** Under-the-radar subset (also flagged on each company via `emerging`). */
  emerging: Company[];
  /** AI-generated synthesis (shown last on web, first in the PDF). */
  executiveSummary: string;
  /** ISO timestamp set when the report finishes building. */
  generatedAt?: string;
};

// ---- streaming protocol (NDJSON, one JSON object per line) ----

export type StreamEvent =
  | { type: "progress"; phase: string; detail?: string }
  | { type: "meta"; mode: ReportMode; query: string; anchor?: { name: string; domain: string } }
  | { type: "segments"; segments: Segment[] }
  | { type: "company"; company: Company }
  | { type: "emerging"; companies: Company[] }
  | { type: "summary"; executiveSummary: string }
  | { type: "done"; generatedAt: string; reportId?: string }
  | { type: "error"; message: string };
