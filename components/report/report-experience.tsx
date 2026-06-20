"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Search } from "lucide-react";
import { ReportDeck } from "./report-deck";
import { BuildingDeck } from "./building-deck";
import { Button } from "@/components/ui/button";
import { DEFAULT_FIRM_ID, firmById } from "@/lib/firms";
import { lensFor } from "@/lib/lenses";
import { useReportStream, toReport } from "@/lib/use-report-stream";
import { useFadeUpProps } from "@/lib/motion";
import { track } from "@/lib/analytics";

// The single KKR Deal Origination desk: enter a platform company, get its
// proprietary add-on universe as a KKR-branded deck.
const firm = firmById(DEFAULT_FIRM_ID);
const lens = lensFor(firm.lens);

const PAIN_POINTS = [
  "Off-database, founder-owned targets the shared feeds never indexed",
  "Fresh readiness signals: new locations, hires, raises, so you know who to call first",
  "A fragmentation map and add-on shortlist to take to the investment committee",
];

export function ReportExperience() {
  const [input, setInput] = useState("");
  const { state, run, reset } = useReportStream();
  const fade = useFadeUpProps();

  // When the report saves, reflect its shareable URL in the address bar so a
  // refresh loads the persisted /r/[id] page and the link is copy-pasteable.
  useEffect(() => {
    if (state.reportId && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/r/${state.reportId}`);
    }
  }, [state.reportId]);

  const busy = state.status === "loading";
  const showInputs = state.status === "idle";

  const submit = (q: string) => {
    const query = q.trim();
    if (!query || busy) return;
    track("report_generated", { firm: firm.id, query });
    run(query, firm.id);
  };

  return (
    <div className="flex flex-col gap-10">
      <motion.div {...fade} className="no-print flex flex-col gap-6">
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
                placeholder="Enter a platform company, e.g. ServiceTitan"
                maxLength={160}
                disabled={busy}
                className="h-14 w-full rounded-full border border-input bg-background pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 disabled:opacity-60"
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
                  Mapping
                </>
              ) : (
                <>
                  Map the add-ons
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
          {showInputs && <p className="px-1 text-[13px] text-muted-foreground">{lens.inputHint}</p>}
        </form>

        {showInputs && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Try a platform:</span>
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

            <div className="rounded-xl px-5 py-4" style={{ background: `${firm.theme.primary}08` }}>
              <p className="text-[15px] font-semibold" style={{ color: firm.theme.primary }}>
                PitchBook tells you who already got found. Exa finds the rest.
              </p>
              <ul className="mt-3 space-y-2">
                {PAIN_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-foreground/80">
                    <Check className="mt-[3px] h-4 w-4 shrink-0" style={{ color: firm.theme.accent }} strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </motion.div>

      {/* Gated build state: show progress, not the half-built deck */}
      {busy && (
        <BuildingDeck
          phase={state.phase}
          companiesFound={state.companies.length}
          marketReady={Boolean(state.marketContext)}
          firm={firm}
        />
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="no-print rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {state.error}
          <button onClick={reset} className="ml-3 font-medium underline underline-offset-2">
            Reset
          </button>
        </div>
      )}

      {/* The finished deck, revealed on completion */}
      {state.status === "done" && state.mode && (
        <motion.div {...fade} className="flex flex-col gap-4">
          <div className="no-print flex items-center gap-2 text-sm font-semibold" style={{ color: firm.theme.green }}>
            <Check className="h-4 w-4" strokeWidth={3} /> Deck ready
          </div>
          <ReportDeck firm={firm} report={toReport(state)} shareId={state.reportId} />
        </motion.div>
      )}
    </div>
  );
}
