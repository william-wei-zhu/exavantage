import type { Report } from "./types";
import { ownershipSignal } from "./metrics";
import { urlForDomain } from "./format";

/** CSV-escape one cell: collapse whitespace/newlines to single spaces (so every
 *  cell stays one tidy line), then wrap in quotes and double any internal quotes. */
function cell(v: string | number | undefined | null): string {
  const s = (v === undefined || v === null ? "" : String(v)).replace(/\s+/g, " ").trim();
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "Name",
  "Domain",
  "Website",
  "Segment",
  "Tier",
  "One-liner",
  "Stage",
  "Funding",
  "Founded",
  "Employees",
  "HQ",
  "Ownership (est.)",
  "Off-database",
  "Recent signal",
];

/**
 * Serialize the deck's full company universe to CSV text (one row per company),
 * mirroring the data shown across the slides: identity, sub-segment, target tier,
 * the estimated-from-web quant columns, the derived ownership read, and the
 * off-database (proprietary) flag. Pure and client-safe.
 */
export function reportToCsv(report: Report): string {
  const tierByDomain = new Map(
    (report.thesis?.targets ?? []).map((t) => [t.domain.toLowerCase(), t.tier]),
  );
  const rows = report.companies.map((c) => {
    const tier = tierByDomain.get(c.domain.toLowerCase());
    return [
      c.name,
      c.domain,
      urlForDomain(c.domain),
      c.segment,
      tier ? `Tier ${tier}` : "",
      c.oneLiner,
      c.stage ?? "",
      c.funding ?? "",
      c.foundedYear ?? "",
      c.employees ?? "",
      c.region ?? "",
      ownershipSignal(c),
      c.emerging ? "Yes" : "No",
      // Recent signal can carry large scraped text; keep it to a tidy snippet.
      (c.recentSignal ?? "").replace(/\s+/g, " ").trim().slice(0, 180),
    ]
      .map(cell)
      .join(",");
  });
  return [HEADERS.map(cell).join(","), ...rows].join("\r\n");
}

/** A filesystem-safe CSV filename for a report, e.g. "exa-vantage-warby-parker.csv". */
export function csvFilename(report: Report): string {
  const base =
    (report.anchor?.name || report.query || "report")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "report";
  return `exa-vantage-${base}.csv`;
}
