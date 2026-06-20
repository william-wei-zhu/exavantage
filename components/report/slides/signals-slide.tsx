import type { PageInfo, SlideProps } from "./bits";
import { Favicon, HeaderBand, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { truncateWords } from "@/lib/util";

/** The Exa Vantage: proprietary, off-database sourcing. The names PitchBook and
 *  Sourcescrub never indexed mean fewer bidders, off-auction conversations, and
 *  lower entry multiples. */
export function SignalsSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const offDatabase = report.companies.filter((c) => c.emerging).slice(0, 4);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.signalsTitle}
      title={thesis?.takeaways.edge ?? lens.signalsTitle}
      page={page}
      note="Off-database is inferred from low public-database coverage; these are the proprietary names Exa surfaced."
    >
      <HeaderBand title="Off-database finds" t={t} right="proprietary sourcing · off-auction" />
      <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
        {offDatabase.length ? (
          offDatabase.map((c) => (
            <div key={c.domain} className="flex gap-3 rounded-lg px-3.5 py-2.5" style={{ background: `${t.accent}12`, ...PRINT_EXACT }}>
              <Favicon domain={c.domain} size={22} className="mt-0.5" />
              <div className="min-w-0">
                <span className="text-[14px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                <p className="line-clamp-2 text-[12.5px] leading-snug" style={{ color: `${t.ink}a8` }}>{truncateWords(c.oneLiner, 14)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[13px]" style={{ color: `${t.ink}80` }}>The set skews to catalogued names this run.</p>
        )}
      </div>

      <div className="mt-3.5 rounded-md p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: t.primary }}>Why it matters</span>
        <p className="mt-1 text-[14px] font-semibold leading-snug" style={{ color: `${t.ink}d8` }}>
          Names the databases never indexed mean fewer bidders, off-auction conversations, and lower entry multiples.
        </p>
      </div>
    </SlideFrame>
  );
}
