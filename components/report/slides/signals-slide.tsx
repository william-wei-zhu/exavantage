import type { PageInfo, SlideProps } from "./bits";
import { Favicon, HeaderBand, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** The Exa edge: off-market sourcing (lower multiples) + readiness signals (timing). */
export function SignalsSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const offDatabase = report.companies.filter((c) => c.emerging).slice(0, 5);
  const withSignals = report.companies.filter((c) => c.recentSignal).slice(0, 5);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.signalsTitle}
      title={thesis?.takeaways.edge ?? lens.signalsTitle}
      intro={thesis?.edge}
      page={page}
      note="Off-database is inferred from low public-database coverage; signals are the freshest public results Exa surfaced."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <HeaderBand title="Off-database finds" t={t} right="price: off-auction" />
          <div className="mt-3 space-y-2">
            {offDatabase.length ? (
              offDatabase.map((c) => (
                <div key={c.domain} className="flex gap-2.5 rounded-md px-3 py-2" style={{ background: `${t.accent}12`, ...PRINT_EXACT }}>
                  <Favicon domain={c.domain} size={18} className="mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[13px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                    <p className="text-[11.5px] leading-snug" style={{ color: `${t.ink}a8` }}>{c.oneLiner}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12.5px]" style={{ color: `${t.ink}80` }}>Set skews to catalogued names this run.</p>
            )}
          </div>
        </div>
        <div>
          <HeaderBand title="Readiness signals" t={t} right="timing: who to call first" />
          <div className="mt-3 space-y-2">
            {withSignals.length ? (
              withSignals.map((c) => (
                <div key={c.domain} className="flex gap-2.5 rounded-md p-2.5" style={{ background: t.surface, ...PRINT_EXACT }}>
                  <Favicon domain={c.domain} size={18} className="mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[13px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                    <p className="text-[11.5px] leading-snug" style={{ color: `${t.ink}b0` }}>
                      {c.recentSignalUrl ? (
                        <a href={c.recentSignalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.recentSignal}</a>
                      ) : (
                        c.recentSignal
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12.5px]" style={{ color: `${t.ink}80` }}>No fresh signals in the trailing window.</p>
            )}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
