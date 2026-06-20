import type { Company, Report } from "./types";
import type { LensId } from "./firms";

// Derived analytics over a report's companies. Pure functions, no fabrication:
// everything here is computed from the discovered set + the (estimated) quant
// fields, never invented. Used to drive the quant slide's charts + the per-lens
// headline index.

export type StageBucket = "Seed" | "Early" | "Growth" | "Late" | "Public" | "Other";

const STAGE_ORDER: StageBucket[] = ["Seed", "Early", "Growth", "Late", "Public", "Other"];

/** Normalize a free-text stage into a bucket. */
export function stageBucket(stage?: string): StageBucket {
  const s = (stage || "").toLowerCase();
  if (!s) return "Other";
  if (s.includes("public") || s.includes("ipo") || s.includes("listed")) return "Public";
  if (s.includes("seed") || s.includes("pre-seed") || s.includes("angel")) return "Seed";
  if (s.includes("series a") || s.includes("series b") || s.includes("early")) return "Early";
  if (s.includes("series c") || s.includes("series d") || s.includes("growth")) return "Growth";
  if (s.includes("series e") || s.includes("series f") || s.includes("late") || s.includes("pre-ipo")) return "Late";
  if (s.includes("acquired") || s.includes("bootstrap") || s.includes("private")) return "Other";
  return "Other";
}

export type Bar = { label: string; count: number };

/** Companies per stage bucket, in canonical order, dropping empty buckets. */
export function stageMix(companies: Company[]): Bar[] {
  const m = new Map<StageBucket, number>();
  for (const c of companies) {
    const b = stageBucket(c.stage);
    m.set(b, (m.get(b) ?? 0) + 1);
  }
  return STAGE_ORDER.map((b) => ({ label: b, count: m.get(b) ?? 0 })).filter((x) => x.count > 0);
}

/** Companies per segment (the market-map distribution). */
export function segmentSizes(report: Report): Bar[] {
  return report.segments
    .map((s) => ({
      label: s.label,
      count: report.companies.filter(
        (c) => c.segment === s.label || s.domains.includes(c.domain),
      ).length,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);
}

const CURRENT_YEAR = 2026;

/** Count companies founded within the trailing `years`. */
export function recentlyFounded(companies: Company[], years = 6): number {
  return companies.filter((c) => c.foundedYear && CURRENT_YEAR - c.foundedYear <= years).length;
}

/** How many companies have each quant field (coverage, for honest labeling). */
export function quantCoverage(companies: Company[]) {
  const n = companies.length || 1;
  const has = (pred: (c: Company) => boolean) => companies.filter(pred).length;
  return {
    total: companies.length,
    funding: has((c) => Boolean(c.funding)),
    founded: has((c) => Boolean(c.foundedYear)),
    employees: has((c) => Boolean(c.employees)),
    region: has((c) => Boolean(c.region)),
    ratioFunding: has((c) => Boolean(c.funding)) / n,
  };
}

/** The Exa-edge stat: how many discovered names are off-database / proprietary
 * (the under-the-radar long tail PitchBook / Sourcescrub never catalogued). */
export function exaEdge(report: Report): { count: number; total: number; pct: number } {
  const total = report.companies.length;
  const count = report.companies.filter((c) => c.emerging).length;
  return { count, total, pct: total ? Math.round((100 * count) / total) : 0 };
}

/**
 * A coarse, clearly-estimated ownership read for a target, inferred from the
 * quant we have. No institutional funding + an established company reads as
 * likely founder-owned (the sellable add-on); anything funded reads as backed.
 * Labeled "(est.)" everywhere it shows — never asserted as fact.
 */
export function ownershipSignal(c: Company): string {
  const stage = stageBucket(c.stage);
  if (stage === "Public") return "Public";
  const backed = Boolean(c.funding) || ["Seed", "Early", "Growth", "Late"].includes(stage);
  if (backed) return "PE / VC-backed";
  if (c.foundedYear && CURRENT_YEAR - c.foundedYear >= 8) return "Founder-owned";
  return "Independent";
}

export type LensIndex = { score: number; label: string; caption: string };

/**
 * The deck's headline index (0-100), derived from the discovered set. For the KKR
 * buy-and-build desk this is the Fragmentation Index: many independent, sub-scale
 * names spread across many sub-segments = more roll-up runway. Clearly an
 * illustrative composite, not a market figure.
 */
export function lensIndex(_lens: LensId, report: Report): LensIndex {
  const cos = report.companies;
  const n = cos.length || 1;
  const share = (k: number) => Math.round((100 * k) / n);

  // Fragmentation: many independent, sub-scale names = more roll-up runway.
  const subScale = cos.filter((c) => {
    const b = stageBucket(c.stage);
    return b === "Seed" || b === "Early" || b === "Other" || b === "Growth";
  }).length;
  const segments = report.segments.length || 1;
  // More companies spread across more segments => more fragmented.
  const score = Math.min(100, Math.round(share(subScale) * 0.7 + Math.min(40, segments * 8)));
  return {
    score,
    label: "Fragmentation Index",
    caption: `${subScale} sub-scale targets across ${segments} sub-segments — buy-and-build runway.`,
  };
}

/** Count of platform-scale names (the anchor candidates), for the thesis slide. */
export function platformCount(report: Report): number {
  return report.companies.filter((c) =>
    ["Growth", "Late", "Public"].includes(stageBucket(c.stage)),
  ).length;
}

/** Low end of an employees band string like "51-200" / "1,000+" / "~200". */
function employeesLow(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.replace(/,/g, "").match(/\d+/);
  return m ? parseInt(m[0], 10) : undefined;
}

/**
 * Sizes the buildable roll-up from the discovered set (no invention): acquirable
 * independents (excludes any public name), and a conservative combined headcount
 * floor summed from the low end of each known employees band, with coverage.
 */
export function opportunitySize(report: Report): {
  acquirable: number;
  segments: number;
  employeesKnown: number;
  total: number;
  headcountFloor: number;
} {
  const cos = report.companies;
  const acquirable = cos.filter((c) => stageBucket(c.stage) !== "Public").length;
  const lows = cos.map((c) => employeesLow(c.employees)).filter((n): n is number => Boolean(n));
  return {
    acquirable,
    segments: report.segments.length,
    employeesKnown: lows.length,
    total: cos.length,
    headcountFloor: lows.reduce((a, b) => a + b, 0),
  };
}

/** Which optional comps columns to show: those with >= 30% coverage (keeps tables dense). */
export function visibleColumns(companies: Company[]): {
  stage: boolean;
  funding: boolean;
  founded: boolean;
  employees: boolean;
  region: boolean;
} {
  const n = companies.length || 1;
  const cov = (pred: (c: Company) => boolean) => companies.filter(pred).length / n;
  const ok = (frac: number) => frac >= 0.3;
  return {
    stage: ok(cov((c) => Boolean(c.stage))),
    funding: ok(cov((c) => Boolean(c.funding))),
    founded: ok(cov((c) => Boolean(c.foundedYear))),
    employees: ok(cov((c) => Boolean(c.employees))),
    region: ok(cov((c) => Boolean(c.region))),
  };
}
