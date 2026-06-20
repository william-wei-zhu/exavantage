import type { PageInfo, SlideProps } from "./bits";
import { PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** Value creation: how the roll-up actually makes money, specific to this platform. */
export function ValueSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const levers = thesis?.valueLevers ?? [];
  const colors = [t.primary, t.secondary, t.accent, t.green];

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.valueTitle}
      title={thesis?.takeaways.value ?? lens.valueTitle}
      page={page}
      note="Value-creation logic is qualitative; no specific multiples, revenue, or synergy figures are claimed."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {levers.length ? (
          levers.map((l, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: colors[i % colors.length], ...PRINT_EXACT }}>{i + 1}</div>
              <p className="mt-2.5 text-[13.5px] leading-snug" style={{ color: `${t.ink}d0` }}>{l}</p>
            </div>
          ))
        ) : (
          <p className="text-[13px]" style={{ color: `${t.ink}80` }}>Analysis pending.</p>
        )}
      </div>
    </SlideFrame>
  );
}
