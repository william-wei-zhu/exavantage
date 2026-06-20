import type { PageInfo, SlideProps } from "./bits";
import { Checklist, ConfidenceChip, HeaderBand, PRINT_EXACT, SourceChip } from "./bits";
import { SlideFrame } from "./slide-frame";
import { opportunitySize } from "@/lib/metrics";

/** Why now: cited market size + the buildable prize + the catalysts driving consolidation. */
export function WhyNowSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const mc = report.marketContext;
  const opp = opportunitySize(report);
  const whyNow = thesis?.whyNow ?? [];

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.whyNowTitle}
      title={thesis?.takeaways.whyNow ?? lens.whyNowTitle}
      page={page}
      note="Market figure is from a cited public source; the buildable prize is derived from the discovered set; catalysts are analyst judgment."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg p-5" style={{ background: `${t.secondary}0e`, ...PRINT_EXACT }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.secondary }}>Size of the prize</div>
          {mc ? (
            <>
              <div className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>{mc.stat}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: `${t.ink}99` }}>
                <SourceChip name={mc.sourceName} url={mc.sourceUrl} t={t} />
                <ConfidenceChip level={mc.confidence} t={t} />
              </div>
            </>
          ) : (
            <p className="mt-2 text-[12.5px]" style={{ color: `${t.ink}99` }}>No single market-size figure was clearly sourced; the thesis rests on the fragmentation and tailwinds.</p>
          )}
        </div>

        <div className="rounded-lg p-5" style={{ background: `${t.primary}0e`, ...PRINT_EXACT }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>The buildable prize</div>
          <div className="mt-1 text-[26px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>
            ~{opp.acquirable} acquirable
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: `${t.ink}b0` }}>
            independents across {opp.segments} sub-segments
            {opp.employeesKnown > 0 ? `, combined est. headcount ${opp.headcountFloor.toLocaleString()}+ (from ${opp.employeesKnown} of ${opp.total} with data)` : ""}.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HeaderBand title="Tailwinds driving consolidation" t={t} />
        <div className="mt-4">
          {whyNow.length ? <Checklist items={whyNow} t={t} /> : <p className="text-[13px]" style={{ color: `${t.ink}80` }}>Analysis pending.</p>}
        </div>
      </div>
    </SlideFrame>
  );
}
