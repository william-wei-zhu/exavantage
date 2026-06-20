import type { SlideProps } from "./bits";
import { PRINT_EXACT, ExaEdge } from "./bits";
import { reportSubject } from "@/lib/lenses";
import { exaEdge, lensIndex } from "@/lib/metrics";
import { FirmLogo } from "@/components/report/firm-logo";

/** The cover: brand-forward title page with the lens framing + headline index. */
export function CoverSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const subject = reportSubject(report);
  const idx = lensIndex(firm.lens, report);
  const edge = exaEdge(report);
  const date = report.generatedAt
    ? new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div
      className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl ring-1 ring-black/10"
      style={{ background: t.paper, color: t.ink, fontFamily: t.bodyFont, ...PRINT_EXACT }}
    >
      {/* Top brand bar */}
      <div className="flex items-center justify-between px-8 py-6 sm:px-12" style={{ borderBottom: `3px solid ${t.primary}`, ...PRINT_EXACT }}>
        <FirmLogo firm={firm} height={firm.logo.kind === "svg" ? 34 : 26} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: `${t.ink}80` }}>
          {lens.desk}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between px-8 py-10 sm:px-12">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: t.primary }}>
            {lens.product}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl" style={{ fontFamily: t.headingFont, color: t.ink }}>
            {subject}
          </h1>
          <p className="mt-4 text-[15px]" style={{ color: `${t.ink}99` }}>
            Prepared for {firm.name} · {firm.kind}{date ? ` · ${date}` : ""}
          </p>
        </div>

        <div className="mt-8 grid items-end gap-6 sm:grid-cols-[auto_1fr] sm:gap-12">
          {/* Headline index */}
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl text-white" style={{ background: t.primary, ...PRINT_EXACT }}>
              <span className="text-3xl font-bold tabular-nums leading-none">{idx.score}</span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider opacity-80">/ 100</span>
            </div>
            <div>
              <div className="text-[15px] font-bold" style={{ color: t.primary }}>{idx.label}</div>
              <div className="mt-1 max-w-xs text-[12.5px] leading-snug" style={{ color: `${t.ink}99` }}>{idx.caption}</div>
            </div>
          </div>

          {/* Counts + Exa edge */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-8">
              <Count value={report.companies.length} label="companies" t={t} />
              <Count value={report.segments.length} label="segments" t={t} />
              <Count value={edge.count} label="under the radar" t={t} />
            </div>
            <ExaEdge accent={t.primary}>{lens.exaEdge}</ExaEdge>
          </div>
        </div>
      </div>
    </div>
  );
}

function Count({ value, label, t }: { value: number; label: string; t: SlideProps["firm"]["theme"] }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: t.headingFont }}>{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>{label}</div>
    </div>
  );
}
