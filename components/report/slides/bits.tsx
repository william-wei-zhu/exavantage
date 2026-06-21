import { ArrowUpRight, Check } from "lucide-react";
import type { Company, Report, Segment } from "@/lib/types";
import type { Firm, FirmTheme } from "@/lib/firms";
import type { LensCopy } from "@/lib/lenses";
import { faviconUrl, truncateWords, urlForDomain } from "@/lib/format";
import { ownershipSignal, visibleColumns } from "@/lib/metrics";

/** `full` is set on phone-width viewports so slides render their complete text. */
export type SlideProps = { report: Report; firm: Firm; lens: LensCopy; full?: boolean };

/**
 * Word-cap a string for the fixed desktop frame, but pass it through untouched when
 * `full` (mobile), where the slide grows to fit and nothing should be truncated.
 */
export function clip(full: boolean | undefined, text: string | undefined, words: number): string {
  return full ? (text ?? "").trim() : truncateWords(text, words);
}

/** Position of a slide in the deck, for the KKR-style footer page number. */
export type PageInfo = { n: number; total: number };

/** Make backgrounds/colors render in printed PDFs. */
export const PRINT_EXACT: React.CSSProperties = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

/**
 * The shared slide canvas: a fixed 16:9 box so every slide is exactly the same
 * width/height and prints one-per-page (landscape) as a real slide deck. Overflow
 * is clipped, which forces each slide to be curated to fit. A stronger aubergine
 * ring frames the slide. Phones fall back to natural height (fonts are fixed-px).
 */
export const SLIDE_FRAME_CLASS =
  "relative flex aspect-[16/9] w-full flex-col overflow-hidden rounded-2xl ring-2 ring-[#53284F]/35 max-sm:aspect-auto max-sm:min-h-[560px] max-sm:overflow-visible";

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
 * A prominent company logo tile (hi-res Google favicon, sz=128) for the hero
 * spots on the cover, anchor, and first-call slides. Rendered as a clean rounded
 * white tile so it reads as a logo, not a list bullet. For dense lists use `Favicon`.
 */
export function CompanyLogo({ domain, size = 48, className = "" }: { domain: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(domain, 128)}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-lg border border-black/10 bg-white object-contain p-1.5 shadow-sm ${className}`}
      style={{ width: size, height: size, ...PRINT_EXACT }}
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
        className="flex min-h-[80px] flex-col justify-center rounded-md px-4 py-3 text-white"
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
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-snug">
          <span
            className="mt-[1px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
            style={{ background: t.green, ...PRINT_EXACT }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          <span className="line-clamp-2 max-sm:line-clamp-none" style={{ color: `${t.ink}d0` }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** A grounded one-line evidence string from a target's own data (justifies the angle). */
export function evidenceLine(c: Company): string {
  return [
    c.foundedYear ? `Founded ${c.foundedYear}` : null,
    c.funding ? c.funding : "no disclosed funding",
    c.employees ? `~${c.employees} staff` : null,
    ownershipSignal(c),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Small credibility label shown next to a cited source. */
export function ConfidenceChip({ level, t }: { level: "research firm" | "secondary"; t: FirmTheme }) {
  const high = level === "research firm";
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
      style={{ background: high ? `${t.green}1f` : `${t.ink}10`, color: high ? t.green : `${t.ink}80`, ...PRINT_EXACT }}
    >
      {high ? "research firm" : "secondary source"}
    </span>
  );
}

/** Conviction pill, colored by level (High = green, Medium = gold, Exploratory = lavender). */
export function ConvictionBadge({ level, t }: { level: "High" | "Medium" | "Exploratory"; t: FirmTheme }) {
  const color = level === "High" ? t.green : level === "Medium" ? t.gold : t.lavender;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
      style={{ background: color, ...PRINT_EXACT }}
    >
      {level} conviction
    </span>
  );
}

/** Target tier label: Tier 1 = call now, 2 = next, 3 = watch. */
export function TierBadge({ tier, t }: { tier: number; t: FirmTheme }) {
  const bg = tier === 1 ? t.primary : tier === 2 ? t.secondary : `${t.ink}55`;
  const label = tier === 1 ? "Tier 1 · Call now" : tier === 2 ? "Tier 2 · Next" : "Watch";
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white"
      style={{ background: bg, ...PRINT_EXACT }}
    >
      {label}
    </span>
  );
}

/** A small cited-source chip linking to the page a stat came from. */
export function SourceChip({ name, url, t }: { name: string; url: string; t: FirmTheme }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium hover:underline"
      style={{ background: `${t.accent}1a`, color: t.secondary, ...PRINT_EXACT }}
    >
      source: {name}
    </a>
  );
}

/** Horizontal bar chart, hand-built (no chart library). */
export function BarChart({ data, accent }: { data: { label: string; count: number }[]; accent: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-[12.5px] font-medium max-sm:whitespace-normal max-sm:overflow-visible" title={d.label}>
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
  const cols = visibleColumns(companies);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr style={{ background: t.primary, ...PRINT_EXACT }}>
            <Th first>Company</Th>
            {cols.stage && <Th>Stage</Th>}
            {cols.funding && <Th>Funding</Th>}
            {cols.founded && <Th>Founded</Th>}
            {cols.employees && <Th>Employees</Th>}
            {cols.region && <Th>HQ</Th>}
            <Th>Ownership (est.)</Th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => (
            <tr key={c.domain} style={i % 2 === 1 ? { background: t.surface, ...PRINT_EXACT } : undefined}>
              <td className="py-2 pl-3 pr-3">
                <span className="inline-flex items-center gap-2">
                  <Favicon domain={c.domain} size={16} />
                  <a href={urlForDomain(c.domain)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline">
                    {c.name}
                    <ArrowUpRight className="h-2.5 w-2.5 shrink-0 opacity-50" />
                  </a>
                </span>
              </td>
              {cols.stage && <Td>{c.stage}</Td>}
              {cols.funding && <Td>{c.funding}</Td>}
              {cols.founded && <Td>{c.foundedYear ? String(c.foundedYear) : ""}</Td>}
              {cols.employees && <Td>{c.employees}</Td>}
              {cols.region && <Td>{c.region}</Td>}
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
