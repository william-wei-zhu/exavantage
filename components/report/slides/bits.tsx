import type { Company, Report, Segment } from "@/lib/types";
import type { Firm } from "@/lib/firms";
import type { LensCopy } from "@/lib/lenses";
import { faviconUrl, urlForDomain } from "@/lib/util";

export type SlideProps = { report: Report; firm: Firm; lens: LensCopy };

/** Make backgrounds/colors render in printed PDFs. */
export const PRINT_EXACT: React.CSSProperties = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

export function groupBySegment(report: Report): { segment: Segment; companies: Company[] }[] {
  const byDomain = new Map(report.companies.map((c) => [c.domain, c]));
  return report.segments
    .map((segment) => {
      const inList = segment.domains.map((d) => byDomain.get(d)).filter((c): c is Company => Boolean(c));
      const byLabel = report.companies.filter(
        (c) => c.segment === segment.label && !segment.domains.includes(c.domain),
      );
      return { segment, companies: [...inList, ...byLabel] };
    })
    .filter((g) => g.companies.length > 0);
}

export function summaryParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export function companyUrl(domain: string): string {
  return urlForDomain(domain);
}

export function Favicon({ domain, size = 20, className = "" }: { domain: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(domain, 64)}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-sm border border-black/5 bg-white ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Horizontal bar chart, hand-built (no chart library). */
export function BarChart({ data, accent }: { data: { label: string; count: number }[]; accent: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-[12.5px] font-medium" title={d.label}>
            {d.label}
          </div>
          <div className="h-5 flex-1 rounded-sm" style={{ background: `${accent}14`, ...PRINT_EXACT }}>
            <div
              className="flex h-5 items-center justify-end rounded-sm pr-1.5 text-[11px] font-bold text-white"
              style={{ width: `${Math.max(10, (100 * d.count) / max)}%`, background: accent, ...PRINT_EXACT }}
            >
              {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A donut-free ring stat: a big number with a label. */
export function StatBlock({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent: string }) {
  return (
    <div>
      <div className="text-4xl font-bold tabular-nums leading-none" style={{ color: accent }}>{value}</div>
      <div className="mt-1.5 text-[12px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      {sub && <div className="mt-0.5 text-[12px] opacity-60">{sub}</div>}
    </div>
  );
}

/** A compact comps/quant table over companies. Blank cells where data is unknown. */
export function CompsTable({ companies, accent }: { companies: Company[]; accent: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left" style={{ color: accent }}>
            <Th>Company</Th>
            <Th>Stage</Th>
            <Th>Funding</Th>
            <Th>Founded</Th>
            <Th>Employees</Th>
            <Th>HQ</Th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.domain} className="border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <td className="py-2 pr-3">
                <span className="inline-flex items-center gap-2">
                  <Favicon domain={c.domain} size={16} />
                  <span className="font-semibold">{c.name}</span>
                </span>
              </td>
              <Td>{c.stage}</Td>
              <Td>{c.funding}</Td>
              <Td>{c.foundedYear ? String(c.foundedYear) : ""}</Td>
              <Td>{c.employees}</Td>
              <Td>{c.region}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="py-1.5 pr-3 text-[11px] font-bold uppercase tracking-wider">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="py-2 pr-3 tabular-nums">{children ? children : <span className="opacity-25">—</span>}</td>;
}

/** Small "what Exa surfaced" badge. */
export function ExaEdge({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px] leading-snug" style={{ background: `${accent}10`, color: "inherit", ...PRINT_EXACT }}>
      <span className="mt-[3px] inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: accent, ...PRINT_EXACT }} />
      <span><span className="font-semibold">Exa edge: </span>{children}</span>
    </div>
  );
}
