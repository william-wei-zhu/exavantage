import type { SlideProps } from "./bits";
import { Favicon, groupBySegment, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** The market map: discovered companies clustered by sub-segment. */
export function MapSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const groups = groupBySegment(report);

  return (
    <SlideFrame firm={firm} lens={lens} title={lens.mapTitle}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: t.headingFont, color: t.primary }}>
        {lens.mapTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-snug" style={{ color: `${t.ink}99` }}>{lens.mapIntro}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.segment.label} className="rounded-xl p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-bold leading-tight" style={{ fontFamily: t.headingFont, color: t.primary }}>
                {g.segment.label}
              </h3>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: `${t.ink}80` }}>{g.companies.length}</span>
            </div>
            <p className="mt-1 text-[12px] leading-snug" style={{ color: `${t.ink}99` }}>{g.segment.blurb}</p>
            <ul className="mt-2.5 space-y-1.5">
              {g.companies.map((c) => (
                <li key={c.domain} className="flex items-center gap-2 text-[13.5px]">
                  <Favicon domain={c.domain} size={15} />
                  <span className="truncate font-medium">{c.name}</span>
                  {c.emerging && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.primary, ...PRINT_EXACT }} title="Emerging" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
