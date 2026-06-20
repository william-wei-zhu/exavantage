import type { Company } from "@/lib/types";
import type { PageInfo, SlideProps } from "./bits";
import { CompsTable, Favicon, TierBadge, evidenceLine } from "./bits";
import { SlideFrame } from "./slide-frame";
import { quantCoverage } from "@/lib/metrics";

/** Priority targets: the tiered shortlist with why-call, angle, and grounded evidence. */
export function QuantSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const cov = quantCoverage(report.companies);
  const byDomain = new Map(report.companies.map((c) => [c.domain.toLowerCase(), c]));
  const ranked = (thesis?.targets ?? [])
    .map((tg) => ({ tg, c: byDomain.get(tg.domain.toLowerCase()) }))
    .filter((x): x is { tg: NonNullable<typeof thesis>["targets"][number]; c: Company } => Boolean(x.c));
  const tier1 = ranked.filter((x) => x.tg.tier === 1).slice(0, 5);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.quantTitle}
      title={thesis?.takeaways.targets ?? lens.quantTitle}
      titleRight={`Estimated from public web · ${cov.funding}/${cov.total} with funding data`}
      page={page}
      note="Figures estimated from public web sources, blank when none found; ownership inferred, not verified. Not investment advice."
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>Tier 1 · Call now</div>
          <div className="space-y-2.5">
            {tier1.length ? (
              tier1.map(({ tg, c }) => (
                <div key={c.domain} className="rounded-md border p-3" style={{ borderColor: `${t.ink}16` }}>
                  <div className="flex items-center gap-2">
                    <Favicon domain={c.domain} size={18} />
                    <span className="text-[14px] font-bold" style={{ fontFamily: t.headingFont }}>{c.name}</span>
                    <span className="ml-auto"><TierBadge tier={1} t={t} /></span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: `${t.ink}c8` }}>
                    <span className="font-semibold" style={{ color: t.primary }}>Why call: </span>{tg.whyCall}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug" style={{ color: `${t.ink}99` }}>
                    <span className="font-semibold">Angle: </span>{tg.angle}
                  </p>
                  <p className="mt-1.5 text-[10.5px] font-medium" style={{ color: `${t.ink}80` }}>Evidence: {evidenceLine(c)}</p>
                </div>
              ))
            ) : (
              <p className="text-[13px]" style={{ color: `${t.ink}80` }}>See the full screen at right.</p>
            )}
          </div>
        </div>
        <div>
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>The full screen</div>
          <CompsTable companies={report.companies} t={t} />
        </div>
      </div>
    </SlideFrame>
  );
}
