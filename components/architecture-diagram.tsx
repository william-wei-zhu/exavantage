import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/reveal";

/**
 * The hero pipeline diagram for /architecture: a vertical dual-rail flow.
 * Center column = the pipeline stage; left rail = the external call that fires
 * (color-coded by system); right rail = the NDJSON event streamed to the client
 * at that stage. Built in HTML/CSS (not SVG) so it stays responsive: the rails
 * sit beside the node on desktop and stack under it on mobile. Each row fades in
 * staggered once the <Reveal> wrapper scrolls into view (globals.css .fade-art).
 */

const AUB = "#53284F";
const TEAL = "#16A9C8";
const SLATE = "#64748B";

type Sys = "exa" | "agent" | "gemini" | "infra";

const SYS: Record<Sys, { label: string; color: string }> = {
  exa: { label: "Exa", color: TEAL },
  agent: { label: "Exa Agent", color: TEAL },
  gemini: { label: "Gemini", color: AUB },
  infra: { label: "Google", color: SLATE },
};

type Stage = {
  n: number;
  calls: Sys[];
  title: string;
  sub: string;
  stream?: string;
};

const STAGES: Stage[] = [
  { n: 1, calls: ["infra"], title: "Ingest", sub: "GET /api/report/stream · validate · rate limit · budget", stream: "opens NDJSON" },
  { n: 2, calls: ["gemini"], title: "Route input", sub: "company vs sector · resolve the domain", stream: "meta" },
  { n: 3, calls: ["exa", "exa"], title: "Discover (two-pass)", sub: "findSimilar + semantic search, merged", stream: "" },
  { n: 4, calls: ["gemini"], title: "Relevance + independence gates", sub: "drop name-collisions and parent-owned sub-brands", stream: "" },
  { n: 5, calls: ["agent"], title: "Emerging discovery", sub: "Exa Agent deep research for the long tail", stream: "" },
  { n: 6, calls: ["gemini"], title: "Cluster + tear sheets", sub: "one pass into 3-6 segments, evidence-only", stream: "segments" },
  { n: 7, calls: ["exa", "gemini"], title: "Per-company intel + quant", sub: "Exa facts, then one batched extraction", stream: "company…" },
  { n: 8, calls: ["exa", "gemini"], title: "Market context", sub: "one cited stat, or omitted", stream: "market" },
  { n: 9, calls: ["gemini"], title: "Deal thesis", sub: "the partner-grade recommendation", stream: "analysis" },
  { n: 10, calls: ["infra"], title: "Persist", sub: "Firestore save → shareable /r/[id]", stream: "done" },
];

function Chip({ sys }: { sys: Sys }) {
  const { label, color } = SYS[sys];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-semibold leading-none"
      style={{ borderColor: `${color}40`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

function LegendItem({ sys }: { sys: Sys }) {
  const { label, color } = SYS[sys];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2.5 rounded-sm" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

const GRID = "sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)_7rem] sm:items-center sm:gap-3";

export function ArchitectureDiagram() {
  return (
    <Reveal>
      {/* legend */}
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Legend</span>
        <LegendItem sys="exa" />
        <LegendItem sys="gemini" />
        <LegendItem sys="infra" />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-sm" style={{ background: "#0f172a" }} aria-hidden />
          streams to client
        </span>
      </div>

      {/* column headers (desktop) */}
      <div className={`hidden ${GRID} sm:grid`}>
        <p className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Call</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pipeline stage</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Stream</p>
      </div>

      <div className="mt-3 flex flex-col">
        {STAGES.map((s, i) => (
          <Fragment key={s.n}>
            <div className={`fade-art ${GRID} max-sm:flex max-sm:flex-col max-sm:gap-2`} style={{ ["--d" as string]: `${0.05 + i * 0.06}s` }}>
              {/* left rail: call chips */}
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {s.calls.map((c, k) => (
                  <Chip key={k} sys={c} />
                ))}
              </div>

              {/* center: stage node */}
              <div className="lift flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: AUB }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="font-heading text-[15px] font-bold leading-tight">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{s.sub}</p>
                </div>
              </div>

              {/* right rail: streamed event */}
              <div className="sm:text-left">
                {s.stream ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground/70">
                    <span style={{ color: TEAL }} aria-hidden>▸</span>
                    {s.stream}
                  </span>
                ) : (
                  <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>·</span>
                )}
              </div>
            </div>

            {i < STAGES.length - 1 ? (
              <div className={GRID} aria-hidden>
                <span />
                <span className="flex justify-center py-1 text-muted-foreground/30">
                  <ChevronDown className="size-4" strokeWidth={2} />
                </span>
                <span />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </Reveal>
  );
}
