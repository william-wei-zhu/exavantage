import type { SlideProps } from "./bits";
import { summaryParagraphs, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { lensIndex } from "@/lib/metrics";

/** The closing memo: the synthesis, framed for the desk. Final slide. */
export function SynthesisSlide({ report, firm, lens }: SlideProps) {
  const t = firm.theme;
  const idx = lensIndex(firm.lens, report);
  const paras = summaryParagraphs(report.executiveSummary);

  return (
    <SlideFrame firm={firm} lens={lens} title={lens.synthesisTitle}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: t.headingFont, color: t.primary }}>
        {lens.synthesisTitle}
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4 text-[15.5px] leading-relaxed" style={{ fontFamily: t.headingFont }}>
          {paras.length ? paras.map((p, i) => <p key={i}>{p}</p>) : <p style={{ color: `${t.ink}66` }}>Synthesizing…</p>}
        </div>

        <aside className="rounded-xl p-5" style={{ background: t.surface, ...PRINT_EXACT }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: `${t.ink}80` }}>{idx.label}</div>
          <div className="mt-1 text-4xl font-bold tabular-nums" style={{ color: t.primary }}>{idx.score}<span className="text-lg opacity-50"> / 100</span></div>
          <p className="mt-2 text-[12.5px] leading-snug" style={{ color: `${t.ink}99` }}>{idx.caption}</p>
          <div className="my-4 h-px" style={{ background: `${t.ink}15` }} />
          <dl className="space-y-1.5 text-[12.5px]">
            <Row k="Companies mapped" v={String(report.companies.length)} t={t} />
            <Row k="Sub-segments" v={String(report.segments.length)} t={t} />
            <Row k="Under the radar" v={String(report.companies.filter((c) => c.emerging).length)} t={t} />
          </dl>
        </aside>
      </div>

      <p className="mt-8 border-t pt-4 text-[11px]" style={{ borderColor: `${t.ink}15`, color: `${t.ink}80` }}>
        Prepared with Exa Vantage · Powered by Exa and Gemini · {lens.exaEdge} Informational only, not investment advice.
      </p>
    </SlideFrame>
  );
}

function Row({ k, v, t }: { k: string; v: string; t: SlideProps["firm"]["theme"] }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt style={{ color: `${t.ink}99` }}>{k}</dt>
      <dd className="font-bold tabular-nums" style={{ color: t.ink }}>{v}</dd>
    </div>
  );
}
