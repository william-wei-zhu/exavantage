"use client";

import { useState, type ReactNode } from "react";
import { Download, Link2, Check, RefreshCw, FileSpreadsheet } from "lucide-react";
import { reportToCsv, csvFilename } from "@/lib/csv";
import { Deck, type Slide } from "@/components/deck/Deck";
import type { PageInfo } from "./slides/bits";
import { Button } from "@/components/ui/button";
import { CoverSlide } from "./slides/cover";
import { WhyNowSlide } from "./slides/why-now-slide";
import { HighlightSlide } from "./slides/highlight-slide";
import { MapSlide } from "./slides/map-slide";
import { AnchorSlide } from "./slides/anchor-slide";
import { QuantSlide, AppendixSlide, appendixChunks } from "./slides/quant-slide";
import { ValueSlide } from "./slides/value-slide";
import { SignalsSlide } from "./slides/signals-slide";
import { SynthesisSlide } from "./slides/synthesis-slide";
import type { Firm } from "@/lib/firms";
import type { Report } from "@/lib/types";
import { lensFor } from "@/lib/lenses";
import { track } from "@/lib/analytics";

/**
 * The deliverable, as a KKR-branded slide deck. Nine insight-first slides, each
 * ending in a takeaway. Used by both the live stream and the saved /r/[id] page.
 */
export function ReportDeck({
  report,
  firm,
  shareId,
}: {
  report: Report;
  firm: Firm;
  live?: boolean;
  shareId?: string | null;
}) {
  const lens = lensFor(firm.lens);
  const props = { report, firm, lens };

  // The full add-on universe is paginated into appendix table slides so every page
  // stays a uniform fixed-size slide; they sit right after the Tier-1 targets slide.
  const chunks = appendixChunks(report.companies);

  // Order follows the questions a partner asks: recommendation -> why now -> is it
  // consolidatable -> where to win -> the anchor -> who to buy now -> the full screen
  // -> how value is made -> why it's proprietary -> the play. Page numbers are derived
  // from the final slide count (so splits/appendix pages number correctly).
  type SlideSpec = { id: string; title: string; render: (page: PageInfo) => ReactNode };
  const specs: SlideSpec[] = [
    { id: "cover", title: lens.product, render: (page) => <CoverSlide {...props} page={page} /> },
    { id: "why-now", title: lens.whyNowTitle, render: (page) => <WhyNowSlide {...props} page={page} /> },
    { id: "thesis", title: lens.highlightTitle, render: (page) => <HighlightSlide {...props} page={page} /> },
    { id: "where", title: lens.mapTitle, render: (page) => <MapSlide {...props} page={page} /> },
    { id: "anchor", title: lens.anchorTitle, render: (page) => <AnchorSlide {...props} page={page} /> },
    { id: "targets", title: lens.quantTitle, render: (page) => <QuantSlide {...props} page={page} /> },
    ...chunks.map((companies, ci) => ({
      id: `appendix-${ci}`,
      title: "The Full Screen",
      render: (page: PageInfo) => (
        <AppendixSlide {...props} page={page} companies={companies} part={ci + 1} parts={chunks.length} />
      ),
    })),
    { id: "value", title: lens.valueTitle, render: (page) => <ValueSlide {...props} page={page} /> },
    { id: "edge", title: lens.signalsTitle, render: (page) => <SignalsSlide {...props} page={page} /> },
    { id: "play", title: lens.synthesisTitle, render: (page) => <SynthesisSlide {...props} page={page} /> },
  ];

  const total = specs.length;
  const slides: Slide[] = specs.map((s, i) => ({
    id: s.id,
    title: s.title,
    node: s.render({ n: i + 1, total }),
  }));

  return (
    <Deck
      slides={slides}
      accent={firm.theme.accent}
      toolbar={<Toolbar firm={firm} report={report} shareId={shareId} />}
    />
  );
}

function Toolbar({ firm, report, shareId }: { firm: Firm; report: Report; shareId?: string | null }) {
  const [copied, setCopied] = useState(false);

  const onExport = () => {
    track("pdf_exported", { firm: firm.id, mode: report.mode, query: report.query });
    if (typeof window !== "undefined") window.print();
  };
  const onCsv = () => {
    if (typeof window === "undefined") return;
    track("csv_exported", { firm: firm.id, mode: report.mode, query: report.query });
    // Prepend a BOM (U+FEFF) so Excel opens the UTF-8 file with correct encoding.
    const bom = String.fromCharCode(0xfeff);
    const blob = new Blob([bom + reportToCsv(report)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFilename(report);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const onRegenerate = () => {
    const q = report.query?.trim();
    if (!q || typeof window === "undefined") return;
    if (!window.confirm("Regenerate this deck from scratch? It rebuilds with fresh data and replaces the current content at this link.")) return;
    track("report_regenerate_clicked", { firm: firm.id, query: q });
    const qs = new URLSearchParams({ q, fresh: "1" });
    if (shareId) qs.set("replace", shareId);
    window.location.href = `/?${qs.toString()}`;
  };
  const onCopy = async () => {
    if (!shareId) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share_link_copied", { firm: firm.id, reportId: shareId });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" className="border-transparent bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE]" onClick={onRegenerate}>
        <RefreshCw className="h-4 w-4" />
        Regenerate
      </Button>
      {shareId && (
        <Button variant="outline" size="sm" className="border-transparent bg-[#FEF9C3] text-[#854D0E] hover:bg-[#FEF08A]" onClick={onCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied" : "Copy share link"}
        </Button>
      )}
      <Button variant="outline" size="sm" className="border-transparent bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export deck (PDF)
      </Button>
      <Button variant="outline" size="sm" className="border-transparent bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]" onClick={onCsv}>
        <FileSpreadsheet className="h-4 w-4" />
        Download CSV
      </Button>
    </div>
  );
}
