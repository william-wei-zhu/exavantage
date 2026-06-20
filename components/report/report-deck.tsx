"use client";

import { useState, type ReactNode } from "react";
import { Download, Link2, Check, RefreshCw } from "lucide-react";
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
      <Button variant="secondary" size="sm" onClick={onRegenerate}>
        <RefreshCw className="h-4 w-4" />
        Regenerate
      </Button>
      {shareId && (
        <Button variant="secondary" size="sm" onClick={onCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied" : "Copy share link"}
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export deck (PDF)
      </Button>
    </div>
  );
}
