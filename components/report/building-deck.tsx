"use client";

import { Loader2 } from "lucide-react";
import type { Firm } from "@/lib/firms";

// Ordered pipeline stages, matched against the live phase string to drive the bar.
const STAGES = [
  "Routing", "Reading", "Finding similar", "Searching", "Filtering",
  "under-the-radar", "Clustering", "signals and company facts",
  "Extracting quantitative", "market context", "deal thesis", "executive summary",
];

function progressFor(phase: string): number {
  const p = phase.toLowerCase();
  const i = STAGES.findIndex((s) => p.includes(s.toLowerCase()));
  if (i < 0) return 0.08;
  return Math.min(0.96, (i + 1) / STAGES.length);
}

/** The gated build state: progress + teasers while the backend works (~90s). */
export function BuildingDeck({
  phase,
  companiesFound,
  marketReady,
  firm,
}: {
  phase: string;
  companiesFound: number;
  marketReady: boolean;
  firm: Firm;
}) {
  const t = firm.theme;
  const pct = Math.round(progressFor(phase) * 100);
  const onThesis = phase.toLowerCase().includes("thesis");
  return (
    <div className="no-print rounded-2xl border border-border bg-card p-8 sm:p-10">
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: t.primary }} />
        <h3 className="font-heading text-xl font-bold">Building your deck</h3>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{phase || "Starting"}…</p>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: t.primary }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
        <span>{companiesFound > 0 ? `${companiesFound} companies found` : "Discovering companies…"}</span>
        {marketReady && <span style={{ color: t.primary }}>market context pulled</span>}
        {onThesis && <span style={{ color: t.primary }}>writing the deal thesis</span>}
      </div>

      <p className="mt-5 text-[12px] text-muted-foreground">
        Deep research over the live web takes about 90 seconds. The deck reveals when it is ready.
      </p>
    </div>
  );
}
