import type { PageInfo, SlideProps } from "./bits";
import { HeaderBand, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** The play: first calls, sequencing, risks, and the ask. Final slide. */
export function SynthesisSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const calls = thesis?.firstCalls ?? [];
  const risks = thesis?.risks ?? [];

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.synthesisTitle}
      title={thesis?.takeaways.play ?? lens.synthesisTitle}
      page={page}
      note="Informational only, not investment advice. Prepared with Exa Vantage · Powered by Exa and Gemini."
    >
      <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>First calls</div>
          <ol className="space-y-2">
            {calls.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-md px-3 py-2" style={{ background: t.surface, ...PRINT_EXACT }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: t.primary, ...PRINT_EXACT }}>{i + 1}</span>
                <div>
                  <span className="text-[13.5px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                  <p className="text-[12px] leading-snug" style={{ color: `${t.ink}b0` }}>{c.why}</p>
                </div>
              </li>
            ))}
          </ol>
          {thesis?.sequencing && (
            <p className="mt-3 text-[12.5px] leading-snug" style={{ color: `${t.ink}99` }}>
              <span className="font-semibold" style={{ color: t.primary }}>Sequencing: </span>{thesis.sequencing}
            </p>
          )}
        </div>
        <div>
          <HeaderBand title="Key risks · diligence" t={t} />
          <ul className="mt-3 space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-snug" style={{ color: `${t.ink}c0` }}>
                <span style={{ color: t.gold }}>&#9650;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {thesis?.ask && (
        <div className="mt-6 rounded-md px-5 py-3.5 text-white" style={{ background: t.primary, ...PRINT_EXACT }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">The ask</span>
          <p className="mt-0.5 text-[15px] font-semibold leading-snug">{thesis.ask}</p>
        </div>
      )}
    </SlideFrame>
  );
}
