import type { SlideProps } from "./bits";
import { BarChart, CompsTable, StatBlock } from "./bits";
import { SlideFrame } from "./slide-frame";
import { lensIndex, quantCoverage, segmentSizes, stageMix } from "@/lib/metrics";

/** Quantitative view: comps table + derived charts + the lens index. */
export function QuantSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const stages = stageMix(report.companies);
  const segs = segmentSizes(report).slice(0, 6);
  const cov = quantCoverage(report.companies);
  const idx = lensIndex(firm.lens, report);
  const chart = stages.length >= 2 ? stages : segs;
  const chartTitle = stages.length >= 2 ? "Stage mix" : "Companies per segment";

  return (
    <SlideFrame firm={firm} lens={lens} title={lens.quantTitle}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: t.headingFont, color: t.primary }}>
          {lens.quantTitle}
        </h2>
        <span className="text-[11px]" style={{ color: `${t.ink}80` }}>
          Estimated from public web · {cov.funding}/{cov.total} with funding data
        </span>
      </div>

      <div className="mt-5 grid gap-7 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <CompsTable companies={report.companies} accent={t.primary} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-7">
            <StatBlock value={String(idx.score)} label={idx.label} accent={t.primary} />
            <StatBlock value={String(report.companies.length)} label="in the set" accent={t.primary} />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>{chartTitle}</div>
            <BarChart data={chart} accent={t.primary} />
          </div>
        </div>
      </div>

      <p className="mt-6 text-[11px]" style={{ color: `${t.ink}70` }}>
        Figures are estimates extracted from public web sources and may be incomplete; blank cells indicate no public data found. Not investment advice.
      </p>
    </SlideFrame>
  );
}
