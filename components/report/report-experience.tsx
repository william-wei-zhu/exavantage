"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { DeskCards } from "./desk-cards";
import { ReportDeck } from "./report-deck";
import { Button } from "@/components/ui/button";
import { DEFAULT_FIRM_ID, firmById, type Firm } from "@/lib/firms";
import { lensFor } from "@/lib/lenses";
import { useReportStream, toReport } from "@/lib/use-report-stream";
import { useFadeUpProps } from "@/lib/motion";
import { track } from "@/lib/analytics";

export function ReportExperience() {
  const [firm, setFirm] = useState<Firm>(firmById(DEFAULT_FIRM_ID));
  const [input, setInput] = useState("");
  const { state, run, reset } = useReportStream();
  const fade = useFadeUpProps();
  const lens = lensFor(firm.lens);

  // When the report saves, reflect its shareable URL in the address bar so a
  // refresh loads the persisted /r/[id] page and the link is copy-pasteable.
  useEffect(() => {
    if (state.reportId && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/r/${state.reportId}`);
    }
  }, [state.reportId]);

  const busy = state.status === "loading";
  const showReport =
    state.status === "loading" || state.status === "done" || state.status === "error";

  const submit = (q: string) => {
    const query = q.trim();
    if (!query || busy) return;
    track("report_generated", { firm: firm.id, query });
    run(query, firm.id);
  };

  const onFirmSelect = (f: Firm) => {
    setFirm(f);
    track("firm_selected", { firm: f.id });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Desk picker + input (hidden from print) */}
      <motion.div {...fade} className="no-print flex flex-col gap-6">
        <div>
          <p className="section-label mb-3 text-primary">Choose your desk</p>
          <DeskCards selected={firm} onSelect={onFirmSelect} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="A company name, or an industry / thesis…"
                maxLength={160}
                className="h-14 w-full rounded-full border border-input bg-background pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2"
                style={{ ["--tw-ring-color" as string]: `${firm.theme.primary}55` }}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={busy || input.trim().length < 2}
              className="h-14 rounded-full px-7 text-white"
              style={{ background: busy ? undefined : firm.theme.primary }}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Building
                </>
              ) : (
                <>
                  Build the deck
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
          {!showReport && (
            <p className="px-1 text-[13px] text-muted-foreground">{lens.inputHint}</p>
          )}
        </form>

        {!showReport && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {lens.examples.map((ex) => (
              <button
                key={ex.query}
                type="button"
                onClick={() => {
                  setInput(ex.query);
                  submit(ex.query);
                }}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={{ background: `${firm.theme.primary}12`, color: firm.theme.primary }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Live progress */}
      {busy && state.phase && (
        <div className="no-print flex items-center gap-2.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: firm.accent }} />
          <span>{state.phase}…</span>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="no-print rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {state.error}
          <button
            onClick={reset}
            className="ml-3 font-medium underline underline-offset-2"
          >
            Reset
          </button>
        </div>
      )}

      {/* The branded report deck */}
      {showReport && state.status !== "error" && state.mode && (
        <ReportDeck
          firm={firm}
          report={toReport(state)}
          live={state.status === "loading"}
          shareId={state.reportId}
        />
      )}
    </div>
  );
}
