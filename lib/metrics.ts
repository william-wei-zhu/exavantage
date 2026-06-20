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

/** The Exa-edge stat: how many discovered names are emerging / under-the-radar. */
export function exaEdge(report: Report): { count: number; total: number; pct: number } {
  const total = report.companies.length;
  const count = report.companies.filter((c) => c.emerging).length;
  return { count, total, pct: total ? Math.round((100 * count) / total) : 0 };
}

export type LensIndex = { score: number; label: string; caption: string };

/**
 * A per-lens headline index (0-100), derived from the discovered set. Clearly an
 * illustrative composite, not a market figure. Mirrors skatepuck's normalized
 * scoring idea so each report has one quant "verdict" number.
 */
export function lensIndex(lens: LensId, report: Report): LensIndex {
  const cos = report.companies;
  const n = cos.length || 1;
  const share = (k: number) => Math.round((100 * k) / n);

  if (lens === "ipo") {
    // IPO readiness: weight late-stage / public + funding visibility + maturity.
    const lateOrPublic = cos.filter((c) => ["Late", "Public", "Growth"].includes(stageBucket(c.stage))).length;
    const funded = cos.filter((c) => c.funding).length;
    const mature = cos.filter((c) => c.foundedYear && CURRENT_YEAR - c.foundedYear >= 7).length;
    const score = Math.round(0.5 * share(lateOrPublic) + 0.3 * share(funded) + 0.2 * share(mature));
    return {
      score,
      label: "IPO Readiness",
      caption: `${lateOrPublic} of ${n} names read as growth, late-stage, or public.`,
    };
  }

  if (lens === "buyout") {
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

  // landscape / momentum: recent founding + emerging share + fresh signals.
  const recent = recentlyFounded(cos, 6);
  const emerging = cos.filter((c) => c.emerging).length;
  const signals = cos.filter((c) => c.recentSignal).length;
  const score = Math.round(0.4 * share(recent) + 0.35 * share(emerging) + 0.25 * share(signals));
  return {
    score,
    label: "Momentum",
    caption: `${recent} founded in the last 6 years · ${emerging} under-the-radar.`,
  };
}
