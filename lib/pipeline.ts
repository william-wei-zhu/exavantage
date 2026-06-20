import {
  agentDiscoverEmerging,
  discoverSimilarCompanies,
  fetchRecentSignal,
  isAgentEmergingEnabled,
  resolveCompanyDomain,
  searchCompanies,
  searchEmerging,
  type SearchHit,
} from "./exa";
import { generateJSON, generateText, Type, type Schema } from "./gemini";
import { mapLimit, brandNameFromDomain, isValidDomain, normalizeDomain } from "./util";
import type { Company, ReportMode, Segment, StreamEvent } from "./types";

type Emit = (e: StreamEvent) => void | Promise<void>;

// ---- input routing: one text field, auto-routed to company vs sector ----

const ROUTE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ["company", "sector"] },
    companyName: { type: Type.STRING },
    companyDomain: { type: Type.STRING },
    sectorThesis: { type: Type.STRING },
  },
  // All required: Flash Lite reliably populates required fields but silently
  // drops optional ones. The unused fields are returned as "" and cleaned below.
  required: ["mode", "companyName", "companyDomain", "sectorThesis"],
};

type RawRoute = {
  mode: ReportMode;
  companyName: string;
  companyDomain: string;
  sectorThesis: string;
};

type Route = {
  mode: ReportMode;
  companyName?: string;
  companyDomain?: string;
  sectorThesis?: string;
};

/** Treat "", "null", "n/a", "none" (any case) as an absent value. */
function clean(v: string | undefined): string | undefined {
  const s = (v ?? "").trim();
  if (!s || /^(null|n\/a|none|undefined)$/i.test(s)) return undefined;
  return s;
}

/**
 * Classify the single input as a specific company (company mode) or a sector
 * thesis (sector mode). In company mode, resolve the official website domain so
 * findSimilar has a seed: Gemini first (free), then an Exa lookup as fallback so
 * a missing/invalid domain never collapses the report to a flat name search.
 */
async function routeInput(query: string): Promise<Route> {
  const raw = await generateJSON<RawRoute>({
    prompt: `Classify this market-research input and resolve it.

Input: "${query}"

If it names ONE specific company: set mode="company", companyName to the official name, companyDomain to its primary website domain as a bare host (e.g. "stripe.com"), and sectorThesis to "".
If it is a sector, theme, thesis, or category (not a single company): set mode="sector", sectorThesis to a clean restatement of the thesis, and companyName and companyDomain to "".
Always fill every field (use "" where not applicable). Only output the JSON.`,
    schema: ROUTE_SCHEMA,
    system:
      "You route financial-research queries. Be decisive. A single recognizable company name → company mode with its real domain. Anything broader → sector mode.",
    temperature: 0,
  });

  const mode: ReportMode = raw.mode === "company" ? "company" : "sector";
  const companyName = clean(raw.companyName) || (mode === "company" ? query : undefined);
  let companyDomain = clean(raw.companyDomain);
  companyDomain =
    companyDomain && isValidDomain(companyDomain)
      ? normalizeDomain(companyDomain)
      : undefined;

  // Fallback: if company mode lacks a valid domain, resolve it through Exa.
  if (mode === "company" && !companyDomain && companyName) {
    companyDomain = (await resolveCompanyDomain(companyName)) ?? undefined;
  }

  return {
    mode,
    companyName,
    companyDomain,
    sectorThesis: clean(raw.sectorThesis) || (mode === "sector" ? query : undefined),
  };
}

// ---- clustering + tear-sheet synthesis (one holistic Gemini pass) ----

const LANDSCAPE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          blurb: { type: Type.STRING },
          domains: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["label", "blurb", "domains"],
      },
    },
    companies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          domain: { type: Type.STRING },
          segment: { type: Type.STRING },
          oneLiner: { type: Type.STRING },
          summary: { type: Type.STRING },
          similar: { type: Type.ARRAY, items: { type: Type.STRING } },
          emerging: { type: Type.BOOLEAN },
        },
        required: ["name", "domain", "segment", "oneLiner", "summary", "similar", "emerging"],
      },
    },
  },
  required: ["segments", "companies"],
};

type Landscape = {
  segments: Segment[];
  companies: Omit<Company, "recentSignal" | "recentSignalUrl">[];
};

function candidateBlock(hits: SearchHit[]): string {
  return hits
    .map(
      (h, i) =>
        `${i + 1}. ${h.title || brandNameFromDomain(h.domain)} (${h.domain})\n   <UNTRUSTED_CONTENT>${(h.summary || "").slice(0, 500)}</UNTRUSTED_CONTENT>`,
    )
    .join("\n");
}

async function synthesizeLandscape(
  query: string,
  mode: ReportMode,
  hits: SearchHit[],
  anchorDomain: string | undefined,
  emergingDomains: Set<string>,
): Promise<Landscape> {
  const anchorLine = anchorDomain
    ? `\nThe anchor company is ${anchorDomain}; cluster the rest as its competitive set and adjacents.`
    : "";
  const land = await generateJSON<Landscape>({
    prompt: `You are mapping a market for an analyst. ${
      mode === "company"
        ? `The seed is the company "${query}".`
        : `The thesis is: "${query}".`
    }${anchorLine}

Here are companies Exa discovered (name, domain, and a short extracted summary). Build a market landscape from ONLY these companies — do not invent companies or domains.

${candidateBlock(hits)}

Produce:
1. "segments": 3-6 sub-segment clusters. Each has a short "label", a one-line "blurb", and "domains" = the exact domains (from the list above) that belong to it. Every company should appear in exactly one segment.
2. "companies": one entry per company above, with: "name", "domain" (copy exactly), "segment" (matching a segment label), "oneLiner" (<= 12 words on what it does), "summary" (2-3 evidence-based sentences), "similar" (2-3 other company NAMES from the list it most resembles), and "emerging" (true if it is a lesser-known / under-the-radar company not likely catalogued in PitchBook yet).

Domains flagged by Exa as recent/low-profile: ${[...emergingDomains].join(", ") || "(none)"} — lean toward emerging=true for these. Only output the JSON.`,
    schema: LANDSCAPE_SCHEMA,
    temperature: 0.3,
  });
  return land;
}

// ---- executive summary ----

async function writeExecutiveSummary(
  query: string,
  mode: ReportMode,
  segments: Segment[],
  companies: Company[],
): Promise<string> {
  const emerging = companies.filter((c) => c.emerging).map((c) => c.name);
  const map = segments
    .map((s) => `- ${s.label}: ${s.domains.length} companies`)
    .join("\n");
  return generateText({
    prompt: `Write a tight executive summary (about 130-170 words) for a ${
      mode === "company" ? `competitive landscape around "${query}"` : `market landscape for the thesis "${query}"`
    }, for a financial-services investment committee.

The discovered universe, clustered:
${map}

Notable under-the-radar names: ${emerging.slice(0, 6).join(", ") || "none stood out"}.

Cover: the shape of the market, where the density and the white space are, what the emerging names signal, and one crisp "so what" for an investor. Plain, confident prose. No headings, no bullet points, no em-dashes. Do not invent specific financials.`,
    temperature: 0.5,
  });
}

// ---- the unified pipeline ----

const MAX_COMPANIES = 14;

/**
 * Run the report and emit NDJSON stream events. Both modes collapse to one flow;
 * the only fork is the seed (findSimilar for a company, search for a thesis).
 */
export async function streamReport(
  query: string,
  emit: Emit,
): Promise<void> {
  await emit({ type: "progress", phase: "Routing your request" });
  const route = await routeInput(query);
  const mode: ReportMode = route.mode;

  const restated =
    mode === "company"
      ? route.companyName || query
      : route.sectorThesis || query;
  const anchorDomain =
    mode === "company" ? route.companyDomain : undefined;
  const anchor =
    mode === "company" && anchorDomain
      ? { name: route.companyName || brandNameFromDomain(anchorDomain), domain: anchorDomain }
      : undefined;

  await emit({ type: "meta", mode, query: restated, anchor });

  // 1. Discover the company set.
  await emit({
    type: "progress",
    phase:
      mode === "company"
        ? "Finding similar companies with Exa"
        : "Searching the market with Exa",
  });

  let hits: SearchHit[] = [];
  if (mode === "company" && anchorDomain) {
    hits = await discoverSimilarCompanies(anchorDomain, MAX_COMPANIES + 4);
  } else {
    hits = await searchCompanies(restated, MAX_COMPANIES + 6);
  }
  hits = hits.slice(0, MAX_COMPANIES);

  if (hits.length === 0) {
    await emit({
      type: "error",
      message:
        "Exa returned no companies for that input. Try a more specific company or thesis.",
    });
    return;
  }

  // 2. Emerging pass to flag under-the-radar names. Hybrid: when EXA_AGENT_EMERGING
  //    is on, use Exa Agent's deep research (stronger at finding hidden companies);
  //    otherwise (and on any Agent miss) use the fast freshness-tuned search.
  const useAgent = isAgentEmergingEnabled();
  await emit({
    type: "progress",
    phase: useAgent
      ? "Researching under-the-radar players with Exa Agent"
      : "Surfacing under-the-radar players",
  });
  const emergingQuery =
    mode === "company"
      ? `emerging startups similar to ${restated}, recently founded or recently funded`
      : `emerging, recently founded companies for: ${restated}`;
  let emergingHits: SearchHit[] = [];
  try {
    if (useAgent) {
      emergingHits = await agentDiscoverEmerging(restated, 6);
    }
    if (emergingHits.length === 0) {
      emergingHits = await searchEmerging(emergingQuery, 10);
    }
  } catch {
    emergingHits = [];
  }
  const knownDomains = new Set(hits.map((h) => h.domain));
  const freshEmerging = emergingHits.filter((h) => !knownDomains.has(h.domain)).slice(0, 4);
  const allHits = [...hits, ...freshEmerging].slice(0, MAX_COMPANIES + 4);
  const emergingDomainSet = new Set(freshEmerging.map((h) => h.domain));

  // 3. Cluster + synthesize tear sheets in one holistic Gemini pass.
  await emit({ type: "progress", phase: "Clustering the landscape" });
  const land = await synthesizeLandscape(
    restated,
    mode,
    allHits,
    anchorDomain,
    emergingDomainSet,
  );
  await emit({ type: "segments", segments: land.segments });

  // 4. Enrich each company with one recent signal (Exa), streaming them in.
  await emit({ type: "progress", phase: "Pulling recent signals" });
  const enriched = await mapLimit(land.companies, 4, async (c) => {
    let recentSignal: string | undefined;
    let recentSignalUrl: string | undefined;
    const sig = await fetchRecentSignal(c.name);
    if (sig) {
      recentSignal = sig.text;
      recentSignalUrl = sig.url;
    }
    const company: Company = { ...c, recentSignal, recentSignalUrl };
    await emit({ type: "company", company });
    return company;
  });

  // 5. Emerging subset.
  const emerging = enriched.filter((c) => c.emerging);
  await emit({ type: "emerging", companies: emerging });

  // 6. Executive summary (synthesis), shown last on web / first in the PDF.
  await emit({ type: "progress", phase: "Writing the executive summary" });
  const executiveSummary = await writeExecutiveSummary(
    restated,
    mode,
    land.segments,
    enriched,
  );
  await emit({ type: "summary", executiveSummary });

  await emit({ type: "done", generatedAt: new Date().toISOString() });
}
