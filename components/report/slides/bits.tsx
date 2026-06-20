import { Check } from "lucide-react";
import type { Company, Report, Segment } from "@/lib/types";
import type { Firm, FirmTheme } from "@/lib/firms";
import type { LensCopy } from "@/lib/lenses";
import { faviconUrl, urlForDomain } from "@/lib/util";
import { ownershipSignal } from "@/lib/metrics";

export type SlideProps = { report: Report; firm: Firm; lens: LensCopy };

/** Position of a slide in the deck, for the KKR-style footer page number. */
export type PageInfo = { n: number; total: number };

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

/**
 * KKR's signature ribbon/swoosh motif: a bundle of flowing parallel strokes.
 * Decorative, tone-on-tone, placed in a corner and clipped by the slide frame.
 */
export function Ribbon({
  color,
  className = "",
  opacity = 0.5,
  strokeWidth = 2.4,
}: {
  color: string;
  className?: string;
  opacity?: number;
  strokeWidth?: number;
}) {
  const strokes = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden className={className} style={PRINT_EXACT}>
      {strokes.map((i) => {
        const o = i * 8.5;
        return (
          <path
            key={i}
            d={`M -20 ${110 + o} C 90 ${50 + o}, 110 ${250 + o}, 200 ${165 + o} S 345 ${30 + o}, 360 ${150 + o}`}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

/** KKR-style in-slide section header: a solid aubergine band with white title. */
export function HeaderBand({
  title,
  t,
  right,
}: {
  title: string;
  t: FirmTheme;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-md px-4 py-2.5 sm:px-5"
      style={{ background: t.primary, ...PRINT_EXACT }}
    >
      <h2 className="text-[15px] font-bold tracking-tight text-white sm:text-[17px]" style={{ fontFamily: t.headingFont }}>
        {title}
      </h2>
      {right && <div className="shrink-0 text-[11px] font-semibold text-white/85">{right}</div>}
    </div>
  );
}

/**
 * KKR-style colored stat box: a solid-color block with a big white number + label,
 * a thin rule, and a caption beneath (cf. their "48 Years / $638bn" metric row).
 */
export function StatBox({
  value,
  label,
  caption,
  color,
}: {
  value: string;
  label: string;
  caption?: string;
  color: string;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="flex min-h-[88px] flex-col justify-center rounded-md px-4 py-3 text-white"
        style={{ background: color, ...PRINT_EXACT }}
      >
        <div className="text-3xl font-bold leading-none tabular-nums">{value}</div>
        <div className="mt-1.5 text-[12.5px] font-semibold leading-tight">{label}</div>
      </div>
      {caption && (
        <>
          <div className="mt-2 h-px w-full" style={{ background: `${color}55`, ...PRINT_EXACT }} />
          <p className="mt-2 text-[11.5px] leading-snug" style={{ color: `${color}` }}>{caption}</p>
        </>
      )}
    </div>
  );
}

/** A list with KKR-green circle checkmarks. */
export function Checklist({ items, t }: { items: string[]; t: FirmTheme }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
          <span
            className="mt-[1px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
            style={{ background: t.green, ...PRINT_EXACT }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          <span style={{ color: `${t.ink}d0` }}>{it}</span>
        </li>
      ))}
    </ul>
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

/** A big number with a label; the number carries a teal accent underline. */
export function StatBlock({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent: string }) {
  return (
    <div>
      <div className="text-4xl font-bold tabular-nums leading-none" style={{ color: accent }}>{value}</div>
      <div className="mt-1.5 text-[12px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      {sub && <div className="mt-0.5 text-[12px] opacity-60">{sub}</div>}
    </div>
  );
}

/**
 * The add-on shortlist comps table, styled like a KKR data table: aubergine
 * header row, alternating tinted rows. Blank cells where no public data was found;
 * ownership is a clearly-estimated read, never asserted.
 */
export function CompsTable({ companies, t }: { companies: Company[]; t: FirmTheme }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr style={{ background: t.primary, ...PRINT_EXACT }}>
            <Th first>Company</Th>
            <Th>Stage</Th>
            <Th>Funding</Th>
            <Th>Founded</Th>
            <Th>Employees</Th>
            <Th>HQ</Th>
            <Th>Ownership (est.)</Th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => (
            <tr key={c.domain} style={i % 2 === 1 ? { background: t.surface, ...PRINT_EXACT } : undefined}>
              <td className="py-2 pl-3 pr-3">
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
              <td className="py-2 pr-3">
                <span className="font-medium" style={{ color: t.primary }}>{ownershipSignal(c)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, first = false }: { children: React.ReactNode; first?: boolean }) {
  return (
    <th className={`py-2 pr-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-white ${first ? "pl-3" : ""}`}>
      {children}
    </th>
  );
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="py-2 pr-3 tabular-nums">{children ? children : <span className="opacity-25">—</span>}</td>;
}

/** Small "what Exa surfaced" badge, in KKR teal. */
export function ExaEdge({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md px-3 py-2 text-[12.5px] leading-snug" style={{ background: `${accent}14`, ...PRINT_EXACT }}>
      <span className="mt-[3px] inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: accent, ...PRINT_EXACT }} />
      <span><span className="font-semibold" style={{ color: accent }}>Exa edge: </span>{children}</span>
    </div>
  );
}
