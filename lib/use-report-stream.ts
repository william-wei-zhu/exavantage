"use client";

import { useCallback, useRef, useState } from "react";
import type { Company, DealThesis, MarketContext, Report, ReportMode, Segment, StreamEvent } from "./types";

export type ReportStatus = "idle" | "loading" | "done" | "error" | "invalid";

export type ReportState = {
  status: ReportStatus;
  phase: string;
  error: string | null;
  mode: ReportMode | null;
  query: string;
  anchor: { name: string; domain: string } | null;
  segments: Segment[];
  companies: Company[];
  emerging: Company[];
  executiveSummary: string;
  marketContext: MarketContext | null;
  thesis: DealThesis | null;
  generatedAt: string | null;
  reportId: string | null;
  /** Set when the company already had a saved deck (navigate to it). */
  cachedId: string | null;
};

const EMPTY: ReportState = {
  status: "idle",
  phase: "",
  error: null,
  mode: null,
  query: "",
  anchor: null,
  segments: [],
  companies: [],
  emerging: [],
  executiveSummary: "",
  marketContext: null,
  thesis: null,
  generatedAt: null,
  reportId: null,
  cachedId: null,
};

/** Consume the NDJSON report stream and expose a progressively-built report. */
export function useReportStream() {
  const [state, setState] = useState<ReportState>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(EMPTY);
  }, []);

  const run = useCallback(async (query: string, firmId?: string, opts?: { fresh?: boolean; replaceId?: string }) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setState({ ...EMPTY, status: "loading", phase: "Starting", query });

    try {
      const qs = new URLSearchParams({ q: query });
      if (firmId) qs.set("firm", firmId);
      if (opts?.fresh) qs.set("fresh", "1");
      if (opts?.replaceId) qs.set("replace", opts.replaceId);
      const res = await fetch(`/api/report/stream?${qs.toString()}`, {
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        setState((s) => ({
          ...s,
          status: "error",
          error: body?.error || "The report request failed. Please try again.",
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const apply = (e: StreamEvent) =>
        setState((s) => {
          switch (e.type) {
            case "progress":
              return { ...s, phase: e.phase };
            case "meta":
              return { ...s, mode: e.mode, query: e.query, anchor: e.anchor ?? null };
            case "cached":
              return { ...s, phase: "Opening your saved deck", cachedId: e.reportId };
            case "market":
              return { ...s, marketContext: e.marketContext };
            case "segments":
              return { ...s, segments: e.segments };
            case "company":
              return { ...s, companies: [...s.companies, e.company] };
            case "emerging":
              return { ...s, emerging: e.companies };
            case "analysis":
              return { ...s, thesis: e.thesis };
            case "summary":
              return { ...s, executiveSummary: e.executiveSummary };
            case "done":
              return {
                ...s,
                status: "done",
                phase: "",
                generatedAt: e.generatedAt,
                reportId: e.reportId ?? null,
              };
            case "error":
              return { ...s, status: "error", error: e.message };
            case "invalid":
              return { ...s, status: "invalid", error: e.message || null };
            default:
              return s;
          }
        });

      // Read NDJSON: one JSON object per line.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            apply(JSON.parse(line) as StreamEvent);
          } catch {
            /* ignore a partial / malformed line */
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setState((s) => ({
        ...s,
        status: "error",
        error: "The connection dropped while building the report. Please try again.",
      }));
    }
  }, []);

  return { state, run, reset };
}

/** Assemble the final Report object (used for PDF export / serialization). */
export function toReport(s: ReportState): Report {
  return {
    mode: s.mode ?? "sector",
    query: s.query,
    anchor: s.anchor ?? undefined,
    segments: s.segments,
    companies: s.companies,
    emerging: s.emerging,
    executiveSummary: s.executiveSummary,
    marketContext: s.marketContext ?? undefined,
    thesis: s.thesis ?? undefined,
    generatedAt: s.generatedAt ?? undefined,
  };
}
