import type { PageInfo, SlideProps } from "./bits";
import { Favicon, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";

/** The anchor: the platform candidate to build the roll-up around. */
export function AnchorSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const a = thesis?.anchor;
  const match = a ? report.companies.find((c) => c.name.toLowerCase() === a.name.toLowerCase()) : undefined;
  const domain =
    match?.domain ??
    (a && report.anchor && report.anchor.name.toLowerCase() === a.name.toLowerCase() ? report.anchor.domain : undefined);

  return (
    <SlideFrame
      firm={firm}
      lens={lens}
      kicker={lens.anchorTitle}
      title={thesis?.takeaways.anchor ?? lens.anchorTitle}
      page={page}
      note="The platform candidate to build the roll-up around; judgment based on the discovered set."
    >
      {a ? (
        <>
          <div className="flex items-center gap-3">
            {domain && <Favicon domain={domain} size={32} />}
            <div>
              <div className="text-[24px] font-bold leading-none" style={{ fontFamily: t.headingFont, color: t.primary }}>{a.name}</div>
              <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>Platform candidate</div>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-[14.5px] leading-snug" style={{ color: `${t.ink}c8` }}>{a.why}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Panel title="What it brings" t={t}>{a.brings}</Panel>
            <Panel title="What it needs (the add-ons)" t={t}>{a.needs}</Panel>
          </div>
        </>
      ) : (
        <p className="text-[13px]" style={{ color: `${t.ink}80` }}>Anchor analysis unavailable for this report.</p>
      )}
    </SlideFrame>
  );
}

function Panel({ title, t, children }: { title: string; t: SlideProps["firm"]["theme"]; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: t.surface, ...PRINT_EXACT }}>
      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>{title}</div>
      <p className="mt-1.5 text-[13.5px] leading-snug" style={{ color: `${t.ink}c8` }}>{children}</p>
    </div>
  );
}
