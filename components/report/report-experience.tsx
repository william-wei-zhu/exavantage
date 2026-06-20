"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Search } from "lucide-react";
import { ReportDeck } from "./report-deck";
import { BuildingDeck } from "./building-deck";
import { Button } from "@/components/ui/button";
import { DEFAULT_FIRM_ID, firmById } from "@/lib/firms";
import { lensFor } from "@/lib/lenses";
import { useReportStream, toReport } from "@/lib/use-report-stream";
import { useFadeUpProps } from "@/lib/motion";
import { faviconUrl } from "@/lib/util";
import { track } from "@/lib/analytics";

// The single KKR Deal Origination desk: enter a platform company, get its
// proprietary add-on universe as a KKR-branded deck.
const firm = firmById(DEFAULT_FIRM_ID);
const lens = lensFor(firm.lens);

export function ReportExperience() {
  const [input, setInput] = useState("");
  const { state, run, reset } = useReportStream();
  const fade = useFadeUpProps();
  const router = useRouter();
  const startedFromUrl = useRef(false);

  // "Regenerate" from a saved deck lands here as /?q=<query>&fresh=1&replace=<id>.
  // Auto-start a from-scratch rebuild that overwrites the same id, then clean the
  // URL so a refresh doesn't retrigger it.
  useEffect(() => {
    if (startedFromUrl.current || typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const q = (sp.get("q") || "").trim();
    if (q && sp.get("fresh") === "1") {
      startedFromUrl.current = true;
      const replace = (sp.get("replace") || "").trim() || undefined;
      window.history.replaceState(null, "", "/");
      setInput(q);
      track("report_regenerated", { firm: firm.id, query: q });
      run(q, firm.id, { fresh: true, replaceId: replace });
    }
  }, [run]);

  // When the report saves, reflect its shareable URL in the address bar so a
  // refresh loads the persisted /r/[id] page and the link is copy-pasteable.
  useEffect(() => {
    if (state.reportId && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/r/${state.reportId}`);
    }
  }, [state.reportId]);

  // Cache hit: the company already has a saved deck, so open it instantly.
  useEffect(() => {
    if (state.cachedId) router.push(`/r/${state.cachedId}`);
  }, [state.cachedId, router]);

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
                placeholder="Enter a company name."
                maxLength={160}
                disabled={busy}
                className="h-14 w-full rounded-lg border border-input bg-background pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 disabled:opacity-60"
                style={{ ["--tw-ring-color" as string]: `${firm.theme.primary}55` }}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={busy || input.trim().length < 2}
              className="h-14 rounded-lg px-7 text-white"
              style={{ background: busy ? undefined : firm.theme.primary }}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  Generate report
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {showInputs && (
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
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-[#53284F]/40 hover:bg-[#53284F]/[0.04]"
              >
                {ex.domain && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={faviconUrl(ex.domain, 64)}
                    alt=""
                    className="h-[18px] w-[18px] rounded-[3px]"
                  />
                )}
                {ex.label}
              </button>
            ))}
          </div>
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

      {state.status === "done" && state.mode && !state.cachedId && (
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
