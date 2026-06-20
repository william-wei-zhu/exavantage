import type { Company } from "@/lib/types";
import type { PageInfo, SlideProps } from "./bits";
import { CompsTable, Favicon, TierBadge, evidenceLine } from "./bits";
import { SlideFrame } from "./slide-frame";
import { quantCoverage } from "@/lib/metrics";
import { truncateWords } from "@/lib/util";

/** Rows of the full-screen comps table per appendix slide (kept small so each
 *  appendix page fits the fixed 16:9 canvas without overflowing). */
const ROWS_PER_APPENDIX = 8;

/** Split the full company set into appendix-table pages. */
export function appendixChunks(companies: Company[]): Company[][] {
  const chunks: Company[][] = [];
  for (let i = 0; i < companies.length; i += ROWS_PER_APPENDIX) {
    chunks.push(companies.slice(i, i + ROWS_PER_APPENDIX));
  }
  return chunks;
}

/** Priority targets: the Tier-1 "call now" shortlist with why-call, angle, and
 *  grounded evidence. The full universe lives on the appendix slide(s). */
export function QuantSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const cov = quantCoverage(report.companies);
  const byDomain = new Map(report.companies.map((c) => [c.domain.toLowerCase(), c]));
  const ranked = (thesis?.targets ?? [])
    .map((tg) => ({ tg, c: byDomain.get(tg.domain.toLowerCase()) }))
    .filter((x): x is { tg: NonNullable<typeof thesis>["targets"][number]; c: Company } => Boolean(x.c));
  const tier1 = ranked.filter((x) => x.tg.tier === 1).slice(0, 4);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={`${lens.quantTitle} · Call now`}
      title={thesis?.takeaways.targets ?? lens.quantTitle}
      titleRight={`${cov.funding}/${cov.total} with funding data`}
      page={page}
      note="Figures estimated from public web sources, blank when none found; ownership inferred, not verified. Not investment advice."
    >
      <div className="grid h-full grid-cols-1 content-start gap-3 sm:grid-cols-2">
        {tier1.length ? (
          tier1.map(({ tg, c }) => (
            <div key={c.domain} className="rounded-lg border p-3.5" style={{ borderColor: `${t.ink}1f` }}>
              <div className="flex items-center gap-2">
                <Favicon domain={c.domain} size={22} />
                <span className="text-[16px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                <span className="ml-auto"><TierBadge tier={1} t={t} /></span>
              </div>
              <p className="mt-2 line-clamp-2 text-[14px] leading-snug" style={{ color: `${t.ink}d0` }}>
                <span className="font-semibold" style={{ color: t.primary }}>Why call: </span>{truncateWords(tg.whyCall, 18)}
              </p>
              <p className="mt-1.5 line-clamp-1 text-[13px] leading-snug" style={{ color: `${t.ink}a0` }}>
                <span className="font-semibold">Angle: </span>{truncateWords(tg.angle, 9)}
              </p>
              <p className="mt-1.5 truncate text-[11.5px] font-medium" style={{ color: `${t.ink}80` }}>Evidence: {evidenceLine(c)}</p>
            </div>
          ))
        ) : (
          <p className="text-[14px]" style={{ color: `${t.ink}80` }}>See the full screen on the next slide.</p>
        )}
      </div>
    </SlideFrame>
  );
}

/** Appendix: the full add-on universe as a comps table, paginated so each page
 *  stays a uniform fixed-size slide. */
export function AppendixSlide({
  report,
  firm,
  lens,
  page,
  companies,
  part,
  parts,
}: SlideProps & { page?: PageInfo; companies: Company[]; part: number; parts: number }) {
  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker="Appendix"
      title={parts > 1 ? `The Full Screen · ${part} of ${parts}` : "The Full Screen"}
      titleRight={`${report.companies.length} companies in the add-on universe`}
      page={page}
      note="Estimated from public web sources; blank cells where none found. Ownership is an estimated read, not verified."
    >
      <CompsTable companies={companies} t={firm.theme} />
    </SlideFrame>
  );
}
