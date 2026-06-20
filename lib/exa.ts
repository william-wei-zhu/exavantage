import Exa from "exa-js";
import { domainOf, urlForDomain, withRetry } from "./util";

let _exa: Exa | null = null;
function exa(): Exa {
  if (!_exa) {
    const key = process.env.EXA_API_KEY;
    if (!key) throw new Error("EXA_API_KEY is not set");
    _exa = new Exa(key);
  }
  return _exa;
}

export type Subpage = { url: string; title?: string; summary?: string; text?: string };
export type SiteContent = {
  url: string;
  domain: string;
  title?: string;
  summary?: string;
  text?: string;
  subpages: Subpage[];
};

export type SearchHit = {
  url: string;
  domain: string;
  title?: string;
  summary?: string;
  publishedDate?: string;
};

/**
 * Sector mode lead call: semantic web search for companies matching a thesis.
 * Exa's neural index surfaces the discovered universe, including companies that
 * structured databases (PitchBook/Crunchbase) have not catalogued.
 */
export async function searchCompanies(
  query: string,
  numResults = 24,
): Promise<SearchHit[]> {
  const r = await withRetry(
    () =>
      exa().search(query, {
        type: "auto",
        numResults,
        summary: true,
        category: "company",
      } as Parameters<Exa["search"]>[1]),
    { label: `exa.search "${query.slice(0, 30)}"`, retries: 3, baseMs: 500 },
  );
  return dedupeHits((r?.results ?? []) as RawHit[]);
}

/**
 * Company mode lead call: Exa findSimilar on the seed company's site — the
 * signature move that returns lookalikes the analyst has never heard of.
 */
export async function discoverSimilarCompanies(
  targetDomain: string,
  numResults = 24,
): Promise<SearchHit[]> {
  const r = await withRetry(
    () =>
      exa().findSimilar(urlForDomain(targetDomain), {
        excludeSourceDomain: true,
        numResults,
        summary: true,
        category: "company",
      } as Parameters<Exa["findSimilar"]>[1]),
    { label: "exa.findSimilar", retries: 3, baseMs: 500 },
  );
  return dedupeHits((r?.results ?? []) as RawHit[]).filter(
    (h) => h.domain !== targetDomain,
  );
}

/**
 * Emerging / under-the-radar pass: a freshness-tuned search aimed at recent,
 * low-profile companies that the structured databases lag on. Date-filtered to
 * the trailing window so the results skew to newcomers and recent movers.
 */
export async function searchEmerging(
  query: string,
  numResults = 12,
): Promise<SearchHit[]> {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 540)
    .toISOString()
    .slice(0, 10);
  const r = await withRetry(
    () =>
      exa().search(query, {
        type: "auto",
        numResults,
        summary: true,
        category: "company",
        startPublishedDate: since,
      } as Parameters<Exa["search"]>[1]),
    { label: `exa.emerging "${query.slice(0, 30)}"`, retries: 2, baseMs: 500 },
  );
  return dedupeHits((r?.results ?? []) as RawHit[]);
}

/**
 * Resolve a company name to its official website domain via Exa, used as a
 * fallback when the LLM can't produce a reliable domain. Returns the bare host
 * of the top company-category result, or null.
 */
export async function resolveCompanyDomain(name: string): Promise<string | null> {
  try {
    const r = await withRetry(
      () =>
        exa().search(`${name} official company website`, {
          type: "auto",
          numResults: 1,
          category: "company",
        } as Parameters<Exa["search"]>[1]),
      { label: `exa.resolve ${name}`, retries: 1, baseMs: 400 },
    );
    const hit = (r?.results ?? [])[0] as { url: string } | undefined;
    return hit ? domainOf(hit.url) : null;
  } catch {
    return null;
  }
}

// ---- Exa Agent (hybrid path for the emerging / under-the-radar discovery) ----

/** Whether the Exa Agent path is enabled for emerging discovery. Off by default
 *  so the fast streaming search path stays the demo-safe spine. */
export function isAgentEmergingEnabled(): boolean {
  const v = (process.env.EXA_AGENT_EMERGING || "").toLowerCase();
  return v === "1" || v === "true" || v === "on";
}

const EMERGING_AGENT_SCHEMA = {
  type: "object",
  properties: {
    companies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          domain: { type: "string" },
          oneLiner: { type: "string" },
        },
        required: ["name", "domain"],
      },
    },
  },
  required: ["companies"],
} as Record<string, unknown>;

type AgentEmergingOutput = {
  companies?: { name?: string; domain?: string; oneLiner?: string }[];
};

/**
 * Exa Agent deep-research pass for emerging / under-the-radar companies. Agent's
 * multi-step research surfaces genuinely hidden companies better than a single
 * dated search — strengthening the report's differentiator. Runs at "low" effort
 * to keep latency bounded for a live demo; returns [] on any failure so the
 * caller can fall back to the search path.
 */
export async function agentDiscoverEmerging(
  thesis: string,
  numResults = 6,
): Promise<SearchHit[]> {
  try {
    const run = await withRetry(
      () =>
        exa().agent.runs.create({
          query: `Find ${numResults} emerging, under-the-radar companies relevant to: "${thesis}". Strongly favor recently founded or recently funded companies that are unlikely to be catalogued in PitchBook or Crunchbase yet. Exclude large incumbents. For each, return its name, primary website domain as a bare host (e.g. "acme.com"), and a one-line description of what it does.`,
          systemPrompt:
            "You are a financial-services research analyst surfacing hidden, emerging companies. Only include real companies with a working website. Prefer lesser-known names over incumbents.",
          outputSchema: EMERGING_AGENT_SCHEMA,
          effort: "low",
        }),
      { label: "exa.agent.emerging", retries: 1, baseMs: 800 },
    );
    const structured = (run as { output?: { structured?: AgentEmergingOutput } })
      ?.output?.structured;
    const companies = structured?.companies ?? [];
    return dedupeHits(
      companies
        .filter((c): c is { name: string; domain: string; oneLiner?: string } =>
          Boolean(c?.domain),
        )
        .map((c) => ({
          url: urlForDomain(c.domain),
          title: c.name,
          summary: c.oneLiner,
        })),
    );
  } catch (e) {
    console.warn(
      "[exa.agent] emerging discovery failed, falling back to search:",
      (e as Error)?.message,
    );
    return [];
  }
}

/** Pull a company's own site content (homepage + about/product subpages). */
export async function fetchSiteContent(domain: string): Promise<SiteContent> {
  const url = urlForDomain(domain);
  const r = await withRetry(
    () =>
      exa().getContents([url], {
        text: { maxCharacters: 5000 },
        summary: true,
        subpages: 4,
        subpageTarget: ["about", "product", "customers", "pricing"],
        livecrawl: "fallback",
      } as Parameters<Exa["getContents"]>[1]),
    { label: `exa.getContents ${domain}`, retries: 2, baseMs: 600 },
  );
  const res = (r?.results ?? [])[0] as
    | {
        url: string;
        title?: string;
        summary?: string;
        text?: string;
        subpages?: Array<{ url: string; title?: string; summary?: string; text?: string }>;
      }
    | undefined;
  return {
    url,
    domain,
    title: res?.title,
    summary: res?.summary,
    text: res?.text,
    subpages: (res?.subpages ?? []).map((s) => ({
      url: s.url,
      title: s.title,
      summary: s.summary,
      text: s.text?.slice(0, 2000),
    })),
  };
}

/** Recent-signal pass for a single company: latest news/announcements. */
export async function fetchRecentSignal(
  companyName: string,
): Promise<{ text: string; url?: string } | null> {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
    .toISOString()
    .slice(0, 10);
  try {
    const r = await withRetry(
      () =>
        exa().search(
          `${companyName} latest news: funding, product launch, partnership, expansion, hiring`,
          {
            type: "auto",
            numResults: 3,
            summary: true,
            highlights: true,
            startPublishedDate: since,
          } as Parameters<Exa["search"]>[1],
        ),
      { label: `exa.signal ${companyName}`, retries: 1, baseMs: 500 },
    );
    const hit = (r?.results ?? [])[0] as
      | { url?: string; title?: string; summary?: string; highlights?: string[] }
      | undefined;
    if (!hit) return null;
    const text =
      hit.summary ||
      (hit.highlights ?? []).join(" ") ||
      hit.title ||
      "";
    if (!text) return null;
    return { text: text.slice(0, 280), url: hit.url };
  } catch {
    return null;
  }
}

// ---- internals ----

type RawHit = {
  url: string;
  title?: string;
  summary?: string;
  publishedDate?: string;
};

/** Collapse to unique domains, keep first occurrence (Exa rank order). */
function dedupeHits(results: RawHit[]): SearchHit[] {
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const res of results) {
    const d = domainOf(res.url);
    if (!d || seen.has(d)) continue;
    seen.add(d);
    out.push({
      url: res.url,
      domain: d,
      title: res.title,
      summary: res.summary,
      publishedDate: res.publishedDate,
    });
  }
  return out;
}
