"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ListChecks, Loader2, Search, Telescope, TrendingUp } from "lucide-react";
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

const BENEFITS = [
  { icon: Telescope, text: "Finds the small, founder-owned companies no database lists." },
  { icon: TrendingUp, text: "Spots who's growing right now, so you know who to call first." },
  { icon: ListChecks, text: "Hands back a ranked shortlist, ready for the deal meeting." },
];

export function ReportExperience() {
  const [input, setInput] = useState("");
  const { state, run, reset } = useReportStream();
  const fade = useFadeUpProps();

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
          {showInputs && (
            <p className="px-1 text-[13px] text-muted-foreground">
              Enter one company. We find the smaller ones worth acquiring around it.
            </p>
          )}
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

            <div className="flex flex-col gap-3">
              <p className="text-[15px] font-semibold" style={{ color: firm.theme.primary }}>
                PitchBook shows who's already been found. Exa finds the rest.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {BENEFITS.map((b) => (
                  <div key={b.text} className="rounded-xl border border-border bg-card p-4">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ background: `${firm.theme.accent}1a` }}
                    >
                      <b.icon className="h-[18px] w-[18px]" style={{ color: firm.theme.accent }} strokeWidth={2} />
                    </span>
                    <p className="mt-2.5 text-[13.5px] leading-snug text-foreground/80">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {busy && (
        <BuildingDeck
          phase={state.phase}
          companiesFound={state.companies.length}
          marketReady={Boolean(state.marketContext)}
          firm={firm}
        />
      )}

      {state.status === "error" && (
        <div className="no-print rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {state.error}
          <button onClick={reset} className="ml-3 font-medium underline underline-offset-2">
            Reset
          </button>
        </div>
      )}

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
