import type { PageInfo, SlideProps } from "./bits";
import { Favicon, groupBySegment, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { truncateWords } from "@/lib/util";

/** Where to win: sub-segments ranked by consolidation attractiveness, beachhead named. */
export function MapSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const groups = groupBySegment(report);
  const reads = new Map((thesis?.segmentReads ?? []).map((r) => [r.label, r]));
  const ordered = [...groups].sort(
    (a, b) => (reads.get(a.segment.label)?.rank ?? 99) - (reads.get(b.segment.label)?.rank ?? 99),
  );
  const palette = [t.primary, t.secondary, t.accent, t.lavender, t.green, t.gold];

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.mapTitle}
      title={thesis?.takeaways.where ?? lens.mapTitle}
      page={page}
      note="Sub-segments ranked by consolidation attractiveness. Off-database targets marked with a teal dot."
    >
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.slice(0, 6).map((g, gi) => {
          const r = reads.get(g.segment.label);
          const beachhead = r?.rank === 1;
          const c = palette[gi % palette.length];
          return (
            <div
              key={g.segment.label}
              className="rounded-xl border p-4"
              style={{
                background: t.paper,
                borderColor: beachhead ? t.primary : `${t.ink}14`,
                boxShadow: beachhead ? `0 0 0 1px ${t.primary}` : undefined,
                ...PRINT_EXACT,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c, ...PRINT_EXACT }} />
                <h3 className="text-[15px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>{g.segment.label}</h3>
                {beachhead && (
                  <span className="rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white" style={{ background: t.primary, ...PRINT_EXACT }}>Start here</span>
                )}
                <span className="ml-auto shrink-0 text-[13px] font-bold tabular-nums" style={{ color: c }}>{g.companies.length}</span>
              </div>
              <p className="mt-2 line-clamp-6 text-[13px] font-medium leading-relaxed" style={{ color: `${t.ink}c8` }}>{truncateWords(r?.read ?? g.segment.blurb, 52)}</p>
              <ul className="mt-3 space-y-1">
                {g.companies.slice(0, 4).map((co) => (
                  <li key={co.domain} className="flex items-center gap-2 text-[13px]">
                    <Favicon domain={co.domain} size={14} />
                    <span className="truncate font-medium">{co.name}</span>
                    {co.emerging && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.accent, ...PRINT_EXACT }} />}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SlideFrame>
  );
}
