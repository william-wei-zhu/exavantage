"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { FirmPicker } from "./firm-picker";
import { BrandedReport } from "./branded-report";
import { Button } from "@/components/ui/button";
import { DEFAULT_FIRM_ID, firmById, type Firm } from "@/lib/firms";
import { useReportStream } from "@/lib/use-report-stream";
import { useFadeUpProps } from "@/lib/motion";
import { track } from "@/lib/analytics";

// Generic example seeds — no specific company names in the placeholder.
const EXAMPLES = [
  "AI compliance tools for mid-market banks",
  "embedded payments infrastructure",
  "climate risk analytics for insurers",
];

export function ReportExperience() {
  const [firm, setFirm] = useState<Firm>(firmById(DEFAULT_FIRM_ID));
  const [input, setInput] = useState("");
  const { state, run, reset } = useReportStream();
  const fade = useFadeUpProps();

  const busy = state.status === "loading";
  const showReport =
    state.status === "loading" || state.status === "done" || state.status === "error";

  const submit = (q: string) => {
    const query = q.trim();
    if (!query || busy) return;
    track("report_generated", { firm: firm.id, query });
    run(query);
  };

  const onFirmSelect = (f: Firm) => {
    setFirm(f);
    track("firm_selected", { firm: f.id });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Hero + input (hidden from print) */}
      <motion.div {...fade} className="no-print flex flex-col gap-6">
        <FirmPicker selected={firm} onSelect={onFirmSelect} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="A company name, or a sector thesis…"
              maxLength={160}
              className="h-14 w-full rounded-full border border-input bg-background pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <Button
            type="submit"
            variant="dark"
            size="lg"
            disabled={busy || input.trim().length < 2}
            className="h-14 rounded-full px-7"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building
              </>
            ) : (
              <>
                Build report
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {!showReport && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setInput(ex);
                  submit(ex);
                }}
                className="rounded-full bg-secondary px-3.5 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-foreground/10"
              >
                {ex}
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

      {/* The branded report */}
      {showReport && state.status !== "error" && state.mode && (
        <BrandedReport firm={firm} state={state} />
      )}
    </div>
  );
}
