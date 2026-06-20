import type { Firm } from "@/lib/firms";
import type { LensCopy } from "@/lib/lenses";
import { FirmLogo } from "@/components/report/firm-logo";
import { PRINT_EXACT, type PageInfo } from "./bits";

/**
 * The shared slide "page", styled after KKR's own deck: aubergine humanist title
 * with a teal accent rule, a generous content area, and a KKR footer (logo +
 * desk + page number, with an optional "Note:" disclaimer line). Per-firm
 * color/font come from `firm.theme`.
 */
export function SlideFrame({
  firm,
  lens,
  title,
  intro,
  titleRight,
  children,
  page,
  note,
}: {
  firm: Firm;
  lens: LensCopy;
  title: string;
  intro?: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
  page?: PageInfo;
  note?: string;
}) {
  const t = firm.theme;
  return (
    <div
      className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl ring-1 ring-black/10"
      style={{ background: t.paper, color: t.ink, fontFamily: t.bodyFont, ...PRINT_EXACT }}
    >
      <div className="flex flex-1 flex-col px-7 py-7 sm:px-10 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]" style={{ fontFamily: t.headingFont, color: t.primary }}>
            {title}
          </h2>
          {titleRight && <div className="shrink-0 pt-1 text-right text-[11px]" style={{ color: `${t.ink}80` }}>{titleRight}</div>}
        </div>
        <div className="mt-3 h-[3px] w-12 rounded-full" style={{ background: t.accent, ...PRINT_EXACT }} />
        {intro && (
          <p className="mt-3 max-w-2xl text-[13.5px] leading-snug" style={{ color: `${t.ink}99` }}>{intro}</p>
        )}
        <div className="mt-5 flex-1">{children}</div>
      </div>

      <SlideFooter firm={firm} lens={lens} page={page} note={note} />
    </div>
  );
}

export function SlideFooter({
  firm,
  lens,
  page,
  note,
}: {
  firm: Firm;
  lens: LensCopy;
  page?: PageInfo;
  note?: string;
}) {
  const t = firm.theme;
  return (
    <div className="px-7 pb-5 sm:px-10">
      <div className="border-t pt-3" style={{ borderColor: `${t.ink}12` }}>
        {note && (
          <p className="mb-2 text-[10px] leading-snug" style={{ color: `${t.ink}66` }}>
            Note: {note}
          </p>
        )}
        <div className="flex items-end justify-between">
          <FirmLogo firm={firm} height={15} />
          <span className="text-[10px] font-semibold tracking-wide" style={{ color: `${t.ink}55` }}>
            {lens.desk} · Exa Vantage{page ? ` · ${page.n} / ${page.total}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
