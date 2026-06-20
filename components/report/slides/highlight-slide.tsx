import type { PageInfo, SlideProps } from "./bits";
import { BarChart, PRINT_EXACT, StatBox } from "./bits";
import { SlideFrame } from "./slide-frame";
import { exaEdge, lensIndex, stageBucket, stageMix } from "@/lib/metrics";

/** The fragmentation thesis: evidence that this market is consolidatable. */
export function HighlightSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const cos = report.companies;
  const thesis = report.thesis;
  const idx = lensIndex(firm.lens, report);
  const subScale = cos.filter((c) => ["Seed", "Early", "Growth", "Other"].includes(stageBucket(c.stage))).length;
  const founderOwned = cos.filter((c) => !c.funding).length;
  const offDb = exaEdge(report).count;
  const stages = stageMix(cos);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.highlightTitle}
      title={thesis?.takeaways.thesis ?? lens.highlightTitle}
      page={page}
      note="Fragmentation is derived from the discovered set, not a market-share figure."
    >
      <p className="max-w-3xl text-[16px] leading-snug" style={{ color: `${t.ink}c8` }}>
        {thesis?.fragmentation ?? `No single name dominates these ${cos.length} companies and no scaled consolidator exists; the field is sub-scale and built to roll up.`}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatBox value={String(report.segments.length)} label="Sub-segments" color={t.secondary} />
        <StatBox value={String(subScale)} label="Sub-scale targets" color={t.accent} />
        <StatBox value={String(founderOwned)} label="Likely founder-owned" color={t.primary} />
        <StatBox value={String(offDb)} label="Off-database finds" color={t.lavender} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="inline-flex h-fit items-center gap-2 self-start rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: `${t.primary}12`, color: t.primary, ...PRINT_EXACT }}>
          Fragmentation Index {idx.score}/100
          <span style={{ color: `${t.ink}80` }}>· illustrative composite</span>
        </div>
        {stages.length >= 2 && (
          <div>
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>Size / stage mix</div>
            <BarChart data={stages} accent={t.primary} />
          </div>
        )}
      </div>
    </SlideFrame>
  );
}
