import type { SlideProps } from "./bits";
import { Favicon, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** Recent signals across the set: the freshness Exa pulls from unstructured web. */
export function SignalsSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const withSignals = report.companies.filter((c) => c.recentSignal);

  return (
    <SlideFrame firm={firm} lens={lens} title={lens.signalsTitle}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: t.headingFont, color: t.primary }}>
        {lens.signalsTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-snug" style={{ color: `${t.ink}99` }}>{lens.signalsIntro}</p>

      {withSignals.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {withSignals.map((c) => (
            <div key={c.domain} className="flex gap-3 rounded-xl p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
              <Favicon domain={c.domain} size={26} className="mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                  {c.stage && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: t.primary }}>{c.stage}</span>}
                </div>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: `${t.ink}c0` }}>
                  {c.recentSignalUrl ? (
                    <a href={c.recentSignalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{c.recentSignal}</a>
                  ) : (
                    c.recentSignal
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-[14px]" style={{ color: `${t.ink}80` }}>No fresh signals surfaced in the trailing window.</p>
      )}
    </SlideFrame>
  );
}
