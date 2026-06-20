"use client";

import { useState } from "react";
import { Download, Link2, Check } from "lucide-react";
import { Deck, type Slide } from "@/components/deck/Deck";
import { Button } from "@/components/ui/button";
import { CoverSlide } from "./slides/cover";
import { MapSlide } from "./slides/map-slide";
import { HighlightSlide } from "./slides/highlight-slide";
import { QuantSlide } from "./slides/quant-slide";
import { SignalsSlide } from "./slides/signals-slide";
import { SynthesisSlide } from "./slides/synthesis-slide";
import type { Firm } from "@/lib/firms";
import type { Report } from "@/lib/types";
import { lensFor } from "@/lib/lenses";
import { track } from "@/lib/analytics";

/**
 * The deliverable, as a firm-branded slide deck. One shared structure; the lens
 * (from the firm) reframes every slide. Used by both the live stream and the
 * saved /r/[id] page.
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

  const slides: Slide[] = [
    { id: "cover", title: lens.product, node: <CoverSlide {...props} /> },
    { id: "map", title: lens.mapTitle, node: <MapSlide {...props} /> },
    { id: "highlight", title: lens.highlightTitle, node: <HighlightSlide {...props} /> },
    { id: "quant", title: lens.quantTitle, node: <QuantSlide {...props} /> },
    { id: "signals", title: lens.signalsTitle, node: <SignalsSlide {...props} /> },
    { id: "synthesis", title: lens.synthesisTitle, node: <SynthesisSlide {...props} /> },
  ];

  return (
    <Deck
      slides={slides}
      accent={firm.theme.primary}
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
