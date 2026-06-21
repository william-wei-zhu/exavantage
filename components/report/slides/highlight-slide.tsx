import type { PageInfo, SlideProps } from "./bits";
import { BarChart, PRINT_EXACT, clip } from "./bits";
import { SlideFrame } from "./slide-frame";
import { lensIndex, ownershipSignal, stageBucket, stageMix } from "@/lib/metrics";

/** The fragmentation thesis: the argument (not duplicate stats) that this market
 *  is consolidatable. Lead with the claim, then prove it with the Fragmentation
 *  Index, the size/stage mix, and the two reads that matter: how sub-scale and how
 *  founder-owned the field is. All derived from the existing Report. */
export function HighlightSlide({ report, firm, lens, full, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const cos = report.companies;
  const thesis = report.thesis;
  const idx = lensIndex(firm.lens, report);
  const total = Math.max(1, cos.length);
  const subScale = cos.filter((c) => ["Seed", "Early", "Growth", "Other"].includes(stageBucket(c.stage))).length;
  // Stricter than "no disclosed funding": ownershipSignal only reads "Founder-owned"
  // when a company is unfunded AND old enough, so this count is realistic, not 100%.
  const founderOwned = cos.filter((c) => ownershipSignal(c) === "Founder-owned").length;
  const stages = stageMix(cos);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.highlightTitle}
      title={thesis?.takeaways.thesis ?? lens.highlightTitle}
      page={page}
      note="Fragmentation is derived from the discovered set, not a market-share figure. The index is an illustrative composite."
    >
      <p className="line-clamp-3 max-sm:line-clamp-none max-w-4xl text-[18px] font-semibold leading-snug" style={{ color: t.primary }}>
        {clip(
          full,
          thesis?.fragmentation ??
            `No single name dominates these ${cos.length} companies and no scaled consolidator exists; the field is sub-scale and built to roll up.`,
          30,
        )}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>Fragmentation Index</span>
              <span className="text-[22px] font-bold tabular-nums" style={{ color: t.primary }}>
                {idx.score}
                <span className="text-[13px] font-semibold" style={{ color: `${t.ink}60` }}>/100</span>
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ background: `${t.primary}14`, ...PRINT_EXACT }}>
              <div className="h-3 rounded-full" style={{ width: `${idx.score}%`, background: t.primary, ...PRINT_EXACT }} />
            </div>
            <div className="mt-1 flex justify-between text-[10.5px] font-medium" style={{ color: `${t.ink}66` }}>
              <span>Consolidated</span>
              <span>Fragmented = more runway</span>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <ProofStat value={`${subScale} of ${total}`} label="Sub-scale targets" color={t.accent} t={t} />
              <ProofStat value={`${founderOwned} of ${total}`} label="Founder-owned" color={t.secondary} t={t} />
            </div>
            <p className="mt-2 text-[11px] leading-snug" style={{ color: `${t.ink}66` }}>
              Across the discovered set; stage and ownership are inferred where disclosed.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>Size / stage mix</div>
          {stages.length >= 2 ? (
            <BarChart data={stages} accent={t.primary} />
          ) : (
            <p className="text-[13.5px]" style={{ color: `${t.ink}80` }}>Stage data is sparse for this set.</p>
          )}
        </div>
      </div>
    </SlideFrame>
  );
}

function ProofStat({ value, label, color, t }: { value: string; label: string; color: string; t: SlideProps["firm"]["theme"] }) {
  return (
    <div className="rounded-lg p-3.5" style={{ background: `${color}10`, ...PRINT_EXACT }}>
      <div className="text-[28px] font-bold leading-none tabular-nums" style={{ color }}>{value}</div>
      <div className="mt-1.5 text-[12.5px] font-semibold leading-tight" style={{ color: `${t.ink}b0` }}>{label}</div>
    </div>
  );
}
