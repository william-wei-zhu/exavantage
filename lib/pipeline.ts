import {
  agentDiscoverEmerging,
  discoverSimilarCompanies,
  fetchCompanyIntel,
  fetchSiteContent,
  isAgentEmergingEnabled,
  resolveCompanyDomain,
  searchCompanies,
  searchEmerging,
  searchMarketSize,
  type SearchHit,
} from "./exa";
import { generateJSON, Type, type Schema } from "./gemini";
import { mapLimit, brandNameFromDomain, domainOf, isValidDomain, normalizeDomain } from "./util";
import { saveReport } from "./store";
import type { Company, DealThesis, MarketContext, Report, ReportMode, Segment, StreamEvent } from "./types";

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
    ? `\nThe platform company is ${anchorDomain} (${seedContext.slice(0, 300)}); treat the rest as candidate add-on / consolidation targets around it.`
    : "";
  const land = await generateJSON<Landscape>({
    prompt: `You are a private-equity deal-origination analyst mapping the add-on universe for a buy-and-build (roll-up). ${
      mode === "company"
        ? `The platform seed is the company "${query}".`
        : `The consolidation thesis is: "${query}".`
    }${anchorLine}

Here are companies Exa discovered (name, domain, and a short extracted summary). Build the target universe from ONLY these companies — do not invent companies or domains.

Produce:
1. "segments": 3-6 consolidation sub-segments. Prefer the buckets a deal team thinks in: core add-ons (do the same thing), adjacent capabilities (expand the platform's offering), and geographic expansion (same model, new region). Each has a short "label", a one-line "blurb", and "domains" = the exact domains (from the list above) that belong to it. Every company appears in exactly one segment.
2. "companies": one entry per company above, written as an acquisition-target qualification, with: "name", "domain" (copy exactly), "segment" (matching a segment label), "oneLiner" (<= 12 words on what it does), "summary" (2-3 evidence-based sentences on fit as an add-on), "similar" (2-3 other company NAMES from the list it most resembles), and "emerging" (true if it is a small / founder-owned / under-the-radar target NOT likely catalogued in PitchBook or Sourcescrub yet — these are the proprietary finds).
3. Quant fields per company, filled ONLY when the evidence is in the content above; otherwise use an empty string "". Do NOT guess or invent numbers. "founded" (4-digit year), "funding" (total raised as a short string like "$120M" or "$1.2B"), "stage" (e.g. "Seed", "Series B", "Public", "Bootstrapped", "Acquired"), "employees" (a range like "11-50", "201-500"), "region" (HQ city/country).

Candidates:
${candidateBlock(hits)}

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

// ---- cited market context (evidence-only, sourced from Exa) ----

const MARKET_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    stat: { type: Type.STRING },
    detail: { type: Type.STRING },
    sourceUrl: { type: Type.STRING },
  },
  required: ["stat", "detail", "sourceUrl"],
};

/**
 * Pull ONE cited market-size / growth stat for the thesis: Exa retrieves industry
 * pages, then Gemini extracts a figure that is EXPLICITLY stated, copying the
 * exact source URL. The number + URL come from the retrieved page, never invented;
 * the source URL must match a retrieved result (no hallucinated citation).
 * Returns undefined when nothing clear is found, so the deck simply omits it.
 */
async function fetchMarketContext(
  sectorHint: string,
  excludeCompany?: string,
): Promise<MarketContext | undefined> {
  const hits = await searchMarketSize(sectorHint, 8).catch(() => []);
  if (hits.length === 0) return undefined;
  try {
    const block = hits
      .map((h) => `${h.url}\n<UNTRUSTED_CONTENT>${h.text}</UNTRUSTED_CONTENT>`)
      .join("\n\n");
    const excludeLine = excludeCompany
      ? `\nCRITICAL: extract the size of the OVERALL MARKET / INDUSTRY, NOT the revenue, ARR, or valuation of any single company. If a snippet only gives one company's figure (e.g. "${excludeCompany}'s ARR" or a stock/earnings page), IGNORE it. Only accept a total addressable market / industry size.`
      : `\nExtract the OVERALL MARKET / INDUSTRY size, never a single company's revenue or valuation.`;
    const out = await generateJSON<{ stat: string; detail: string; sourceUrl: string }>({
      prompt: `From the market-research snippets below, extract ONE headline TOTAL MARKET size for the industry "${sectorHint}" that is EXPLICITLY stated in the text, ideally a market size in dollars plus a growth rate (CAGR).${excludeLine}
"stat": a short string like "~$14B market, growing ~11%/yr" (include only what the text states; drop the growth rate if it is not stated; always frame it as a market, e.g. "~$14B market").
"detail": one short clause of extra context if present, else "".
"sourceUrl": copy the exact URL the figure came from.
If NO clear overall-market figure is stated in any snippet, return "" for all three. Never invent, estimate, or round a number that is not in the text.

${block}

Only output the JSON.`,
      schema: MARKET_SCHEMA,
      system:
        "You extract a single, explicitly-stated TOTAL MARKET / INDUSTRY size from provided web text for a research analyst, never a single company's revenue. Accuracy over completeness: if an overall-market figure is not clearly stated, return empty. Never invent figures.",
      temperature: 0,
    });
    const stat = clean(out.stat);
    const url = clean(out.sourceUrl);
    if (!stat || !url) return undefined;
    // The cited URL must be one we actually retrieved (no hallucinated source).
    const match = hits.find((h) => h.url === url) ?? hits.find((h) => url.includes(h.domain));
    if (!match) return undefined;
    return { stat, detail: clean(out.detail), sourceName: match.domain, sourceUrl: match.url, confidence: match.tier };
  } catch {
    return undefined;
  }
}

// ---- strategic analysis: the partner-grade deal thesis ----

const DEAL_THESIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendation: { type: Type.STRING },
    conviction: { type: Type.STRING, enum: ["High", "Medium", "Exploratory"] },
    whyNow: { type: Type.ARRAY, items: { type: Type.STRING } },
    fragmentation: { type: Type.STRING },
    segmentReads: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          read: { type: Type.STRING },
          rank: { type: Type.NUMBER },
        },
        required: ["label", "read", "rank"],
      },
    },
    beachhead: { type: Type.STRING },
    anchor: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        why: { type: Type.STRING },
        brings: { type: Type.STRING },
        needs: { type: Type.STRING },
      },
      required: ["name", "why", "brings", "needs"],
    },
    targets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING },
          tier: { type: Type.NUMBER },
          whyCall: { type: Type.STRING },
          angle: { type: Type.STRING },
        },
        required: ["domain", "tier", "whyCall", "angle"],
      },
    },
    valueLevers: { type: Type.ARRAY, items: { type: Type.STRING } },
    edge: { type: Type.STRING },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
    firstCalls: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING }, why: { type: Type.STRING } },
        required: ["name", "why"],
      },
    },
    sequencing: { type: Type.STRING },
    ask: { type: Type.STRING },
    takeaways: {
      type: Type.OBJECT,
      properties: {
        whyNow: { type: Type.STRING },
        thesis: { type: Type.STRING },
        where: { type: Type.STRING },
        anchor: { type: Type.STRING },
        targets: { type: Type.STRING },
        value: { type: Type.STRING },
        edge: { type: Type.STRING },
        play: { type: Type.STRING },
      },
      required: ["whyNow", "thesis", "where", "anchor", "targets", "value", "edge", "play"],
    },
  },
  required: [
    "recommendation", "conviction", "whyNow", "fragmentation", "segmentReads", "beachhead",
    "anchor", "targets", "valueLevers", "edge", "risks", "firstCalls", "sequencing", "ask",
    "takeaways",
  ],
};

/** One Gemini pass turning the discovered set into a partner-grade recommendation. */
async function analyzeOpportunity(
  query: string,
  mode: ReportMode,
  segments: Segment[],
  companies: Company[],
  market: MarketContext | undefined,
  seedContext: string,
): Promise<DealThesis> {
  const segBlock = segments.map((s) => `- ${s.label} (${s.domains.length}): ${s.blurb}`).join("\n");
  const coBlock = companies
    .map(
      (c) =>
        `- ${c.name} | ${c.domain} | ${c.oneLiner} | stage: ${c.stage || "?"} | funding: ${c.funding || "?"} | employees: ${c.employees || "?"} | HQ: ${c.region || "?"} | founded: ${c.foundedYear || "?"} | ${c.emerging ? "off-database" : "catalogued"}`,
    )
    .join("\n");
  const marketLine = market
    ? `\nCited market stat (use this EXACT string for any market figure, do not restate a number differently): "${market.stat}"${market.detail ? `, ${market.detail}` : ""} (source: ${market.sourceName}).`
    : "\nNo cited market figure is available; refer to market size only qualitatively (large, fragmented), never with a dollar number.";
  const anchorLine = seedContext
    ? `\nThe platform's actual capabilities (use these to make value levers specific): ${seedContext.slice(0, 400)}`
    : "";

  return generateJSON<DealThesis>({
    prompt: `Build the buy-and-build (roll-up) thesis for ${
      mode === "company" ? `the platform "${query}"` : `the consolidation thesis "${query}"`
    }.${marketLine}${anchorLine}

Sub-segments:
${segBlock}

Discovered targets:
${coBlock}

Produce a structured recommendation. Rules:
- Base every claim ONLY on the targets / segments / market above. NEVER invent revenue, valuations, multiples, growth rates, or market-share percentages. Recommendation and conviction are your judgment.
- NUMBERS: use compact notation only ($150B, not "150 billion dollar"). Any market-size figure must be the EXACT cited stat string above, or omitted. No other dollar figures.
- "recommendation": ONE punchy sentence, max 22 words. State the NON-OBVIOUS wedge (the specific consolidation insight, e.g. which sub-scale point-solutions the platform cross-sells into), not the generic category.
- "conviction": High, Medium, or Exploratory.
- "whyNow": exactly 3 grounded catalysts / tailwinds (founder succession, technology forcing scale, end-market demand). Briefly note if other consolidators are already active.
- "fragmentation": one evidence sentence from the SET (no single name dominates these N; no scaled consolidator; many sub-scale / founder-owned).
- "segmentReads": for EACH sub-segment above, a one-line consolidation read and a "rank" (1 = most attractive to start).
- "beachhead": which sub-segment to start in and why (one line).
- "anchor": the platform candidate. Be REALISTIC about its role: if the input is a large/public company, frame it as "back a [name]-like scaled player" or "[name] as the consolidation vehicle", not "acquire [name]". "name", "why" it anchors, what it "brings", what it "needs".
- "targets": EVERY company above, each with its exact "domain", a "tier" (1 = call now, 2 = next, 3 = watch), a one-line "whyCall", and an "angle" GROUNDED in that company's own data above (e.g. "founded 2004, no disclosed funding, ~50-200 staff -> likely founder-owned succession seller"; "sub-scale tuck-in adding [capability]"). Reserve tier 1 for the best 3 to 5 fits.
- "valueLevers": 3 to 4 levers SPECIFIC to this platform and these sub-segments, naming the platform's capabilities and the segment names (e.g. "cross-sell [platform]'s payments module into acquired [segment] bases"; "consolidate overlapping [segment] tools"). Include multiple arbitrage (buy sub-scale below the platform's exit multiple) as one lever, stated qualitatively.
- "edge": one line turning off-database / proprietary sourcing into return logic (off-auction, lower entry multiples, protected returns).
- "risks": 2 to 3 specific things to diligence or what could kill it (e.g. saturated TAM, integration across codebases, competing buyers bidding up quality assets).
- "firstCalls": the top 3 to 5 names to approach first, each with a one-line "why".
- "sequencing": one line on order (anchor first, then which add-ons).
- "ask": the concrete decision requested of the investment committee.
- "takeaways": one crisp CONCLUSION line for each slide key (whyNow, thesis, where, anchor, targets, value, edge, play). Each is a so-what a partner acts on, max ~16 words, not a restatement of the slide title.
Only output the JSON.`,
    schema: DEAL_THESIS_SCHEMA,
    system:
      "You are a KKR private-equity deal-origination partner writing a sourcing recommendation for the investment committee. Be decisive, specific, and grounded only in the provided data. Never fabricate financial figures; frame the recommendation as analyst judgment. Do not use em-dashes.",
    temperature: 0.4,
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

  // Company-only desk: always present as a platform-anchored add-on map. When we
  // can't resolve a single company (e.g. the user typed a sector), we still run a
  // best-effort search and gently nudge toward a platform company — never error.
  const mode: ReportMode = "company";
  const anchorDomain = route.companyDomain;
  const restated = route.companyName || route.sectorThesis || query;
  const anchor = anchorDomain
    ? { name: route.companyName || brandNameFromDomain(anchorDomain), domain: anchorDomain }
    : undefined;

  await emit({ type: "meta", mode, query: restated, anchor });
  if (!anchorDomain) {
    await emit({
      type: "progress",
      phase:
        "No single platform company matched — mapping the closest target set (tip: enter one company, like ServiceTitan)",
    });
  }


  // 1. Discover the company set, grounded in what the seed actually does.
  // Company mode combines two signals so we don't over-index on the brand token:
  //   (a) Exa findSimilar on the seed domain, and
  //   (b) a semantic search built from the seed's real business description.
  // A relevance gate then drops name-collisions (the "Exa" -> "Exaforce" problem).
  let seedContext = restated;
  let rawHits: SearchHit[] = [];

  if (anchorDomain) {
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

  // Market context: search the SECTOR (from the seed's real business), not the
  // company name, and tell the extractor to ignore the anchor's own revenue.
  // Kicked off here so it overlaps the rest of the pipeline.
  const marketPromise = fetchMarketContext(seedContext, anchor?.name).catch(() => undefined);

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
  const intel = await mapLimit(land.companies, 6, async (c) => ({
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

  // 6. Cited market context (the "size of the prize") — started in parallel above.
  await emit({ type: "progress", phase: "Pulling market context" });
  const marketContext = await marketPromise;
  if (marketContext) await emit({ type: "market", marketContext });

  // 7. Strategic analysis: the partner-grade deal thesis that drives every slide.
  await emit({ type: "progress", phase: "Writing the deal thesis" });
  let thesis: DealThesis | undefined;
  try {
    thesis = await analyzeOpportunity(restated, mode, land.segments, enriched, marketContext, seedContext);
  } catch {
    thesis = undefined;
  }
  if (thesis) await emit({ type: "analysis", thesis });

  // Keep a short executiveSummary for back-compat (older /r pages / PDF metadata).
  const executiveSummary = thesis ? `${thesis.recommendation} ${thesis.ask}` : "";
  await emit({ type: "summary", executiveSummary });

  // 8. Persist the finished report (server-side, so saved content is trusted)
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
    marketContext,
    thesis,
    generatedAt,
  };
  let reportId: string | undefined;
  try {
    reportId = (await saveReport(report, opts.firmId || "kkr")) ?? undefined;
  } catch {
    reportId = undefined;
  }

  await emit({ type: "done", generatedAt, reportId });
}
