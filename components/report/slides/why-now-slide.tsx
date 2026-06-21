import type { PageInfo, SlideProps } from "./bits";
import { Checklist, ConfidenceChip, HeaderBand, PRINT_EXACT, SourceChip, clip } from "./bits";
import { SlideFrame } from "./slide-frame";
import { opportunitySize } from "@/lib/metrics";

/** Why now: cited market size + the buildable prize + the catalysts driving consolidation. */
export function WhyNowSlide({ report, firm, lens, full, page }: SlideProps & { page?: PageInfo }) {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg p-4" style={{ background: `${t.secondary}0e`, ...PRINT_EXACT }}>
          <div className="text-[12.5px] font-bold uppercase tracking-wider" style={{ color: t.secondary }}>Size of the prize</div>
          {mc ? (
            <>
              <div className="mt-1.5 text-[30px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>{mc.stat}</div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px]" style={{ color: `${t.ink}99` }}>
                <SourceChip name={mc.sourceName} url={mc.sourceUrl} t={t} />
                <ConfidenceChip level={mc.confidence} t={t} />
              </div>
            </>
          ) : (
            <p className="mt-2 text-[14px] leading-snug" style={{ color: `${t.ink}99` }}>No single market-size figure was clearly sourced; the thesis rests on the fragmentation and tailwinds.</p>
          )}
        </div>

        <div className="rounded-lg p-4" style={{ background: `${t.primary}0e`, ...PRINT_EXACT }}>
          <div className="text-[12.5px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>The buildable prize</div>
          <div className="mt-1.5 text-[30px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>
            ~{opp.acquirable} acquirable
          </div>
          <p className="mt-2 text-[14px] leading-snug" style={{ color: `${t.ink}b0` }}>
            independents across {opp.segments} sub-segments
            {opp.employeesKnown > 0 ? `, combined est. headcount ${opp.headcountFloor.toLocaleString()}+ (from ${opp.employeesKnown} of ${opp.total} with data)` : ""}.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <HeaderBand title="Tailwinds driving consolidation" t={t} />
        <div className="mt-3">
          {whyNow.length ? <Checklist items={whyNow.slice(0, 3).map((w) => clip(full, w, 14))} t={t} /> : <p className="text-[14px]" style={{ color: `${t.ink}80` }}>Analysis pending.</p>}
        </div>
      </div>
    </SlideFrame>
  );
}
