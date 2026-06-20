import type { Firm } from "@/lib/firms";
import type { LensCopy } from "@/lib/lenses";
import { FirmLogo } from "@/components/report/firm-logo";
import { PRINT_EXACT } from "./bits";

/**
 * The shared slide "page": firm-branded paper, a header band with the firm logo +
 * desk on the left and the slide title on the right, and a generous content area
 * sized like a presentation slide. Per-firm color/font come from `firm.theme`, so
 * each deck looks bespoke while sharing one structure.
 */
export function SlideFrame({
  firm,
  lens,
  title,
  children,
  pad = true,
}: {
  firm: Firm;
  lens: LensCopy;
  title: string;
  children: React.ReactNode;
  pad?: boolean;
}) {
  const t = firm.theme;
  return (
    <div
      className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl ring-1 ring-black/10"
      style={{ background: t.paper, color: t.ink, fontFamily: t.bodyFont, ...PRINT_EXACT }}
    >
      {/* Header band */}
      <div
        className="flex items-center justify-between px-7 py-4 sm:px-10"
        style={{ borderBottom: `1px solid ${t.primary}22` }}
      >
        <div className="flex items-center gap-3">
          <FirmLogo firm={firm} height={firm.logo.kind === "svg" ? 26 : 20} />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:inline" style={{ color: `${t.ink}80` }}>
            {firm.kind} · {lens.desk}
          </span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: t.primary }}>
          {title}
        </span>
      </div>

      {/* Content */}
      <div className={`flex-1 ${pad ? "px-7 py-8 sm:px-10 sm:py-9" : ""}`}>{children}</div>
    </div>
  );
}
