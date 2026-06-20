import {
  agentDiscoverEmerging,
  discoverSimilarCompanies,
  fetchCompanyIntel,
  fetchSiteContent,
  isAgentEmergingEnabled,
  resolveCompanyDomain,
  searchCompanies,
  searchEmerging,
  type SearchHit,
} from "./exa";
import { generateJSON, generateText, Type, type Schema } from "./gemini";
import { mapLimit, brandNameFromDomain, isValidDomain, normalizeDomain } from "./util";
import { saveReport } from "./store";
import type { Company, Report, ReportMode, Segment, StreamEvent } from "./types";

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

// ---- candidate merge + relevance gate (fixes name-collision results) ----

/** Merge candidate lists, dedupe by domain (first occurrence wins), drop a domain. */
function mergeHits(lists: SearchHit[][], exclude?: string): SearchHit[] {
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const list of lists) {
    for (const h of list) {
      if (!h.domain || seen.has(h.domain) || h.domain === exclude) continue;
      seen.add(h.domain);
      out.push(h);
    }
  }
  return out;
}

const RELEVANCE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    relevantDomains: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["relevantDomains"],
};

/**
 * Drop candidates that merely share a similar NAME with the seed but operate in
 * a different business (Exa findSimilar over-indexes on short brand tokens, e.g.
 * "Exa" -> Exaforce/Exabits/Expa). Judges by what each company DOES. Falls back
 * to the unfiltered set if the filter would leave too few.
 */
async function filterRelevant(
  seedLabel: string,
  seedContext: string,
  hits: SearchHit[],
): Promise<SearchHit[]> {
  if (hits.length <= 5) return hits;
  try {
    const { relevantDomains } = await generateJSON<{ relevantDomains: string[] }>({
      prompt: `Research target: ${seedLabel}
What the target actually does: <UNTRUSTED_CONTENT>${seedContext.slice(0, 900)}</UNTRUSTED_CONTENT>

Below are candidate companies a search returned. Some are genuine peers, competitors, or adjacents; others are NAME-COLLISIONS or unrelated companies that merely share a similar name or word-stem with the target. Return "relevantDomains": the exact domains of ONLY the companies that genuinely operate in the same market or an adjacent one as the target. Drop name-collisions and off-topic results. Judge strictly by what each company DOES, never by how similar its name is. Keep every genuinely relevant company.

Candidates:
${candidateBlock(hits)}

Only output the JSON.`,
      schema: RELEVANCE_SCHEMA,
      system:
        "You are a precise market analyst filtering a candidate set for genuine business relevance. A similar name is NOT relevance; only the actual line of business counts.",
      temperature: 0,
    });
    const keep = new Set(relevantDomains.map((d) => normalizeDomain(d)));
    const filtered = hits.filter((h) => keep.has(h.domain));
    // If the gate over-filters (e.g. weak context), keep the original order.
    return filtered.length >= 4 ? filtered : hits;
  } catch {
    return hits;
  }
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
          // Quant — fill ONLY from evidence in the provided content; "" if unknown.
          founded: { type: Type.STRING },
          funding: { type: Type.STRING },
          stage: { type: Type.STRING },
          employees: { type: Type.STRING },
          region: { type: Type.STRING },
        },
        required: [
          "name", "domain", "segment", "oneLiner", "summary", "similar", "emerging",
          "founded", "funding", "stage", "employees", "region",
        ],
      },
    },
  },
  required: ["segments", "companies"],
};

type RawCompany = {
  name: string;
  domain: string;
  segment: string;
  oneLiner: string;
  summary: string;
  similar: string[];
  emerging: boolean;
  founded: string;
  funding: string;
  stage: string;
  employees: string;
  region: string;
};

type Landscape = {
  segments: Segment[];
  companies: RawCompany[];
};

/** Map a raw Gemini company (string quant, "" = unknown) to Company quant. */
function toQuant(c: RawCompany): Pick<Company, "foundedYear" | "funding" | "stage" | "employees" | "region"> {
  const fy = parseInt(c.founded, 10);
  return {
    foundedYear: Number.isFinite(fy) && fy > 1900 && fy < 2100 ? fy : undefined,
    funding: clean(c.funding),
    stage: clean(c.stage),
    employees: clean(c.employees),
    region: clean(c.region),
  };
}

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
  seedContext: string,
): Promise<Landscape> {
  const anchorLine = anchorDomain
    ? `\nThe anchor company is ${anchorDomain} (${seedContext.slice(0, 300)}); cluster the rest as its competitive set and adjacents.`
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
3. Quant fields per company, filled ONLY when the evidence is in the content above; otherwise use an empty string "". Do NOT guess or invent numbers. "founded" (4-digit year), "funding" (total raised as a short string like "$120M" or "$1.2B"), "stage" (e.g. "Seed", "Series B", "Public", "Bootstrapped", "Acquired"), "employees" (a range like "11-50", "201-500"), "region" (HQ city/country).

Domains flagged by Exa as recent/low-profile: ${[...emergingDomains].join(", ") || "(none)"} — lean toward emerging=true for these. Only output the JSON.`,
    schema: LANDSCAPE_SCHEMA,
    temperature: 0.3,
  });
  return land;
}

// ---- quant extraction (one batched Gemini pass over per-company facts) ----

const QUANT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    companies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING },
          founded: { type: Type.STRING },
          funding: { type: Type.STRING },
          stage: { type: Type.STRING },
          employees: { type: Type.STRING },
          region: { type: Type.STRING },
        },
        required: ["domain", "founded", "funding", "stage", "employees", "region"],
      },
    },
  },
  required: ["companies"],
};

type QuantRow = { domain: string; founded: string; funding: string; stage: string; employees: string; region: string };

/** Extract structured quant for many companies in one call, evidence-only. */
async function extractQuant(
  facts: { domain: string; name: string; text: string }[],
): Promise<Map<string, Pick<Company, "foundedYear" | "funding" | "stage" | "employees" | "region">>> {
  const usable = facts.filter((f) => f.text.trim().length > 0);
  if (usable.length === 0) return new Map();
  try {
    const block = usable
      .map((f) => `${f.name} (${f.domain})\n<UNTRUSTED_CONTENT>${f.text.slice(0, 1200)}</UNTRUSTED_CONTENT>`)
      .join("\n\n");
    const out = await generateJSON<{ companies: QuantRow[] }>({
      prompt: `For each company below, extract quantitative facts ONLY where they appear in that company's text. Never guess or invent numbers; use "" for anything not clearly stated.

For each: "domain" (copy exactly), "founded" (4-digit year), "funding" (total raised, short string like "$120M" or "$1.2B"), "stage" (e.g. "Seed", "Series B", "Public", "Bootstrapped", "Acquired"), "employees" (a range like "11-50", "201-500"), "region" (HQ city/country).

${block}

Only output the JSON.`,
      schema: QUANT_SCHEMA,
      system:
        "You extract company financials from provided text for a research analyst. Accuracy over completeness: leave a field empty rather than guess.",
      temperature: 0,
    });
    const map = new Map<string, Pick<Company, "foundedYear" | "funding" | "stage" | "employees" | "region">>();
    for (const row of out.companies ?? []) {
      const d = normalizeDomain(row.domain);
      const fy = parseInt(row.founded, 10);
      map.set(d, {
        foundedYear: Number.isFinite(fy) && fy > 1900 && fy < 2100 ? fy : undefined,
        funding: clean(row.funding),
        stage: clean(row.stage),
        employees: clean(row.employees),
        region: clean(row.region),
      });
    }
    return map;
  } catch {
    return new Map();
  }
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
  opts: { firmId?: string } = {},
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

  // 1. Discover the company set, grounded in what the seed actually does.
  // Company mode combines two signals so we don't over-index on the brand token:
  //   (a) Exa findSimilar on the seed domain, and
  //   (b) a semantic search built from the seed's real business description.
  // A relevance gate then drops name-collisions (the "Exa" -> "Exaforce" problem).
  let seedContext = restated;
  let rawHits: SearchHit[] = [];

  if (mode === "company" && anchorDomain) {
    await emit({ type: "progress", phase: `Reading ${anchor?.name ?? anchorDomain}` });
    const site = await fetchSiteContent(anchorDomain).catch(() => null);
    seedContext =
      [site?.title, site?.summary].filter(Boolean).join(" — ") ||
      site?.text?.slice(0, 400) ||
      restated;

    await emit({ type: "progress", phase: "Finding similar companies with Exa" });
    const [similar, semantic] = await Promise.all([
      discoverSimilarCompanies(anchorDomain, MAX_COMPANIES + 6).catch(() => []),
      searchCompanies(
        `Companies that compete with or are similar to ${anchor?.name ?? restated}: ${seedContext.slice(0, 200)}`,
        MAX_COMPANIES,
      ).catch(() => []),
    ]);
    rawHits = mergeHits([similar, semantic], anchorDomain);
  } else {
    await emit({ type: "progress", phase: "Searching the market with Exa" });
    rawHits = await searchCompanies(restated, MAX_COMPANIES + 10);
  }

  if (rawHits.length === 0) {
    await emit({
      type: "error",
      message:
        "Exa returned no companies for that input. Try a more specific company or thesis.",
    });
    return;
  }

  // Relevance gate: drop name-collisions / off-topic candidates by business.
  await emit({ type: "progress", phase: "Filtering for genuine market relevance" });
  const relevant = await filterRelevant(
    mode === "company" ? (anchor?.name ?? restated) : restated,
    seedContext,
    rawHits,
  );
  let hits = relevant.slice(0, MAX_COMPANIES);

  if (hits.length === 0) {
    await emit({
      type: "error",
      message: "No clearly relevant companies came back. Try a more specific input.",
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
    seedContext,
  );
  await emit({ type: "segments", segments: land.segments });

  // 4. Per-company intel (Exa): one search each yields a recent signal + facts.
  await emit({ type: "progress", phase: "Pulling signals and company facts" });
  const intel = await mapLimit(land.companies, 4, async (c) => ({
    company: c,
    intel: await fetchCompanyIntel(c.name),
  }));

  // 5. Quant: one batched Gemini pass over the collected facts (evidence-only).
  await emit({ type: "progress", phase: "Extracting quantitative data" });
  const quantMap = await extractQuant(
    intel.map(({ company, intel }) => ({ domain: company.domain, name: company.name, text: intel.facts })),
  );

  const enriched = await mapLimit(intel, 8, async ({ company: c, intel: info }) => {
    // Prefer freshly-extracted quant; fall back to anything in the discovery pass.
    const fromClustering = toQuant(c);
    const fromIntel = quantMap.get(normalizeDomain(c.domain)) ?? {};
    const company: Company = {
      name: c.name,
      domain: c.domain,
      segment: c.segment,
      oneLiner: c.oneLiner,
      summary: c.summary,
      similar: c.similar,
      emerging: c.emerging,
      foundedYear: fromIntel.foundedYear ?? fromClustering.foundedYear,
      funding: fromIntel.funding ?? fromClustering.funding,
      stage: fromIntel.stage ?? fromClustering.stage,
      employees: fromIntel.employees ?? fromClustering.employees,
      region: fromIntel.region ?? fromClustering.region,
      recentSignal: info.signal,
      recentSignalUrl: info.signalUrl,
    };
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

  // 7. Persist the finished report (server-side, so saved content is trusted)
  //    and hand back its id so the client can offer a shareable link.
  const generatedAt = new Date().toISOString();
  const report: Report = {
    mode,
    query: restated,
    anchor,
    segments: land.segments,
    companies: enriched,
    emerging,
    executiveSummary,
    generatedAt,
  };
  let reportId: string | undefined;
  try {
    reportId = (await saveReport(report, opts.firmId || "goldman-sachs")) ?? undefined;
  } catch {
    reportId = undefined;
  }

  await emit({ type: "done", generatedAt, reportId });
}
