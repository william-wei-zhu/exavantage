import type { PageInfo, SlideProps } from "./bits";
import { CompanyLogo, HeaderBand, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { truncateWords } from "@/lib/format";

/** The play: first calls, sequencing, risks, and the ask. Final slide. */
export function SynthesisSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const calls = (thesis?.firstCalls ?? []).slice(0, 3);
  const risks = (thesis?.risks ?? []).slice(0, 3);
  const byName = new Map(report.companies.map((c) => [c.name.toLowerCase(), c]));

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
            {calls.map((c, i) => {
              const domain = byName.get(c.name.toLowerCase())?.domain;
              return (
                <li key={i} className="flex items-center gap-3 rounded-md px-3 py-2" style={{ background: t.surface, ...PRINT_EXACT }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: t.primary, ...PRINT_EXACT }}>{i + 1}</span>
                  {domain && <CompanyLogo domain={domain} size={30} />}
                  <div className="min-w-0">
                    <span className="text-[14px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                    <p className="line-clamp-1 text-[12.5px] leading-snug" style={{ color: `${t.ink}b0` }}>{truncateWords(c.why, 10)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <HeaderBand title="Key risks · diligence" t={t} />
          <ul className="mt-3 space-y-2.5">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-snug" style={{ color: `${t.ink}c8` }}>
                <span className="mt-0.5 shrink-0" style={{ color: t.gold }}>&#9650;</span>
                <span className="line-clamp-3">{truncateWords(r, 40)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {thesis?.ask && (
        <div className="mt-5 rounded-md p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: t.primary }}>The ask</span>
          <p className="mt-1 line-clamp-3 text-[15px] font-semibold leading-snug" style={{ color: `${t.ink}d8` }}>{thesis.ask}</p>
        </div>
      )}
    </SlideFrame>
  );
}
