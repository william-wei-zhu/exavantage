import type { PageInfo, SlideProps } from "./bits";
import { CompanyLogo, Ribbon, PRINT_EXACT } from "./bits";
import { SlideFrame } from "./slide-frame";
import { truncateWords } from "@/lib/format";

/** The anchor: the platform candidate to build the roll-up around. */
export function AnchorSlide({ report, firm, lens, page }: SlideProps & { page?: PageInfo }) {
  const t = firm.theme;
  const thesis = report.thesis;
  const a = thesis?.anchor;
  const match = a ? report.companies.find((c) => c.name.toLowerCase() === a.name.toLowerCase()) : undefined;
  // The anchor slide is about the resolved platform company, so fall back to its
  // domain when the thesis names the anchor as a phrase rather than a clean name.
  const domain = match?.domain ?? report.anchor?.domain;

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
          <div className="relative overflow-hidden rounded-xl p-5" style={{ background: t.surface, ...PRINT_EXACT }}>
            <Ribbon color={t.primary} opacity={0.14} className="pointer-events-none absolute -right-8 -top-10 h-[200px] w-[200px]" />
            <div className="relative flex items-center gap-4">
              {domain && <CompanyLogo domain={domain} size={56} />}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>Platform candidate</div>
                <div className="mt-1 text-[28px] font-bold leading-none" style={{ fontFamily: t.headingFont, color: t.primary }}>{a.name}</div>
              </div>
            </div>
            <p className="relative mt-3.5 line-clamp-3 max-w-3xl text-[16px] leading-snug" style={{ color: `${t.ink}c8` }}>{truncateWords(a.why, 30)}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Panel title="What it brings" t={t}>{truncateWords(a.brings, 26)}</Panel>
            <Panel title="What it needs (the add-ons)" t={t}>{truncateWords(a.needs, 26)}</Panel>
          </div>
        </>
      ) : (
        <p className="text-[14px]" style={{ color: `${t.ink}80` }}>Anchor analysis unavailable for this report.</p>
      )}
    </SlideFrame>
  );
}

function Panel({ title, t, children }: { title: string; t: SlideProps["firm"]["theme"]; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: `${t.primary}0c`, ...PRINT_EXACT }}>
      <div className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: t.primary }}>{title}</div>
      <p className="mt-1.5 line-clamp-4 text-[15px] leading-snug" style={{ color: `${t.ink}c8` }}>{children}</p>
    </div>
  );
}
