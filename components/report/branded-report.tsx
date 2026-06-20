"use client";

import { Download } from "lucide-react";
import { MarketMap } from "./market-map";
import { TearSheet } from "./tear-sheet";
import { ExecutiveSummary } from "./executive-summary";
import { Button } from "@/components/ui/button";
import type { Firm } from "@/lib/firms";
import type { ReportState } from "@/lib/use-report-stream";
import { track } from "@/lib/analytics";

/**
 * The deliverable: the report rendered in the SELECTED firm's brand, framed
 * inside Exa's outer shell. On screen the executive summary sits LAST (closing
 * synthesis); for print/PDF, CSS `order` moves it to the top, the convention
 * analysts expect from a leave-behind.
 */
export function BrandedReport({ firm, state }: { firm: Firm; state: ReportState }) {
  const onExport = () => {
    track("pdf_exported", { firm: firm.id, mode: state.mode, query: state.query });
    if (typeof window !== "undefined") window.print();
  };

  const title =
    state.mode === "company"
      ? `Competitive Landscape: ${state.anchor?.name ?? state.query}`
      : `Market Landscape: ${state.query}`;

  return (
    <div
      id="branded-report"
      className="overflow-hidden rounded-3xl border-2 bg-card shadow-[0_28px_70px_-28px_rgba(17,17,17,0.28)]"
      style={{ borderColor: "#c4c4c4" }}
    >
      {/* Branded header — the client's brand, not Exa's. */}
      <div
        className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        style={{ backgroundColor: firm.surface, borderBottom: `3px solid ${firm.accent}` }}
      >
        <div>
          <div
            className="font-heading text-2xl font-bold tracking-tight"
            style={{ color: firm.accent }}
          >
            {firm.wordmark}
          </div>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {firm.kind} · Market Intelligence
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onExport} className="no-print self-start sm:self-auto">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="px-6 py-8 sm:px-10">
        <h2 className="font-heading text-3xl font-bold tracking-tight">{title}</h2>

        {/* Section order: screen = map → tear sheets → emerging → summary.
            Print = summary first (leave-behind convention) via order utilities. */}
        <div className="mt-8 flex flex-col gap-12">
          {/* Market map */}
          <section className="order-1">
            <SectionLabel n="01" title="Market Map" accent={firm.accent} />
            {state.segments.length > 0 ? (
              <MarketMap
                segments={state.segments}
                companies={state.companies}
                accent={firm.accent}
              />
            ) : (
              <Placeholder text="Mapping the landscape…" />
            )}
          </section>

          {/* Tear sheets */}
          <section className="order-2">
            <SectionLabel n="02" title="Company Tear Sheets" accent={firm.accent} />
            {state.companies.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {state.companies.map((c) => (
                  <TearSheet key={c.domain} company={c} accent={firm.accent} />
                ))}
              </div>
            ) : (
              <Placeholder text="Profiling companies…" />
            )}
          </section>

          {/* Emerging */}
          {state.emerging.length > 0 && (
            <section className="order-3">
              <SectionLabel n="03" title="Emerging & Under-the-Radar" accent={firm.accent} />
              <p className="mb-4 max-w-2xl text-[15px] text-muted-foreground">
                Companies the structured databases have not catalogued yet — the
                names that are not in PitchBook.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {state.emerging.map((c) => (
                  <TearSheet key={c.domain} company={c} accent={firm.accent} />
                ))}
              </div>
            </section>
          )}

          {/* Executive summary — last on screen, first in print. */}
          <section id="summary" className="order-4 scroll-mt-24 print:order-[-1]">
            <SectionLabel n="04" title="Executive Summary" accent={firm.accent} />
            <ExecutiveSummary
              text={state.executiveSummary}
              companies={state.companies}
              accent={firm.accent}
            />
          </section>
        </div>

        <p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
          Prepared with Exa Vantage · Powered by Exa and Gemini · Informational
          only, not investment advice. Verify before relying.
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ n, title, accent }: { n: string; title: string; accent: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-mono text-xs font-semibold" style={{ color: accent }}>
        {n}
      </span>
      <h3 className="font-heading text-xl font-bold tracking-tight">{title}</h3>
      <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
