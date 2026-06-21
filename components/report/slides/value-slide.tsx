import type { PageInfo, SlideProps } from "./bits";
import { PRINT_EXACT, Ribbon, clip } from "./bits";
import { SlideFrame } from "./slide-frame";

/** Value creation: how the roll-up actually makes money, specific to this platform. */
export function ValueSlide({ report, firm, lens, full, page }: SlideProps & { page?: PageInfo }) {
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
      <div className="relative h-full">
        <Ribbon color={t.primary} opacity={0.08} className="pointer-events-none absolute -right-10 -top-8 h-[220px] w-[220px]" />
        <div className="relative grid content-start gap-4 sm:grid-cols-2">
          {levers.length ? (
            levers.slice(0, 4).map((l, i) => {
              const c = colors[i % colors.length];
              return (
                <div key={i} className="rounded-xl border p-4" style={{ background: t.paper, borderColor: `${t.ink}14`, ...PRINT_EXACT }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: c, ...PRINT_EXACT }}>{i + 1}</div>
                  <p className="mt-3 line-clamp-4 max-sm:line-clamp-none text-[15px] leading-relaxed" style={{ color: `${t.ink}d0` }}>{clip(full, l, 30)}</p>
                </div>
              );
            })
          ) : (
            <p className="text-[14px]" style={{ color: `${t.ink}80` }}>Analysis pending.</p>
          )}
        </div>
      </div>
    </SlideFrame>
  );
}
