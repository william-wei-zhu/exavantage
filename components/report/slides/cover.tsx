import type { PageInfo, SlideProps } from "./bits";
import { PRINT_EXACT, SLIDE_FRAME_CLASS, CompanyLogo, ConfidenceChip, ConvictionBadge, Ribbon, SourceChip, StatBox, clip } from "./bits";
import { SlideFooter } from "./slide-frame";
import { reportSubject } from "@/lib/lenses";
import { exaEdge, lensIndex } from "@/lib/metrics";
import { FirmLogo } from "@/components/report/firm-logo";

/** The cover: lead with the recommendation. Verdict + conviction + three concrete proof stats + the ask. */
export function CoverSlide({ report, firm, lens, full, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const subject = reportSubject(report);
  const idx = lensIndex(firm.lens, report);
  const edge = exaEdge(report);
  const thesis = report.thesis;
  const mc = report.marketContext;
  const anchorDomain = report.anchor?.domain;
  const verdict = thesis?.recommendation ?? `A buy-and-build add-on universe for ${subject}.`;

  return (
    <div
      className={SLIDE_FRAME_CLASS}
      style={{ background: t.paper, color: t.ink, fontFamily: t.bodyFont, ...PRINT_EXACT }}
    >
      <Ribbon color={t.gold} opacity={0.6} className="pointer-events-none absolute -right-10 -top-16 h-[340px] w-[340px]" />

      <div className="flex items-center justify-between px-8 py-5 sm:px-12" style={{ borderBottom: `3px solid ${t.primary}`, ...PRINT_EXACT }}>
        <FirmLogo firm={firm} height={30} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: `${t.ink}80` }}>{lens.desk}</span>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden px-8 py-5 sm:px-12 sm:py-6 max-sm:overflow-visible">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {anchorDomain && <CompanyLogo domain={anchorDomain} size={44} />}
            <p className="text-[14px] font-bold uppercase tracking-[0.26em]" style={{ color: t.accent }}>{lens.coverLine(subject)}</p>
            {thesis && <ConvictionBadge level={thesis.conviction} t={t} />}
          </div>
          <h1 className="mt-4 line-clamp-3 max-sm:line-clamp-none max-w-4xl text-[26px] font-bold leading-[1.14] tracking-tight sm:text-[36px]" style={{ fontFamily: t.headingFont, color: t.primary }}>
            {clip(full, verdict, 24)}
          </h1>
        </div>

        <div className="mt-5">
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <StatBox value={String(report.companies.length)} label="Qualified targets" caption="small businesses to consolidate" color={t.secondary} />
            <StatBox value={String(edge.count)} label="Off-database finds" caption="not in PitchBook / Sourcescrub" color={t.accent} />
            {mc ? (
              <div className="flex flex-col">
                <div className="flex min-h-[80px] flex-col justify-center rounded-md px-4 py-3 text-white" style={{ background: t.primary, ...PRINT_EXACT }}>
                  <div className="text-[20px] font-bold leading-tight">{mc.stat}</div>
                  <div className="mt-1.5 text-[12.5px] font-semibold leading-tight">Market size</div>
                </div>
                <div className="mt-2 h-px w-full" style={{ background: `${t.primary}55`, ...PRINT_EXACT }} />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <SourceChip name={mc.sourceName} url={mc.sourceUrl} t={t} />
                  <ConfidenceChip level={mc.confidence} t={t} />
                </div>
              </div>
            ) : (
              <StatBox value={`${idx.score} / 100`} label="Fragmentation Index" caption="more sub-scale names = more runway" color={t.primary} />
            )}
          </div>
          {thesis?.ask && (
            <div className="mt-4 rounded-md p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: t.primary }}>The ask</span>
              <p className="mt-1 line-clamp-2 max-sm:line-clamp-none text-[14px] font-semibold leading-snug" style={{ color: `${t.ink}d8` }}>{clip(full, thesis.ask, 22)}</p>
            </div>
          )}
        </div>
      </div>

      <SlideFooter firm={firm} lens={lens} page={page} />
    </div>
  );
}
