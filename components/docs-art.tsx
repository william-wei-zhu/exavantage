import { Fragment, type CSSProperties } from "react";
import { Building2, Search, Filter, Sparkles, FileText } from "lucide-react";

/*
 * Hand-drawn, on-brand line-art for the How-it-works walk-through. Pure SVG in
 * KKR aubergine + teal, no images, no diagram library. Each piece paints /
 * settles once when its <Reveal> ancestor gets `.is-visible` (classes in
 * globals.css). Decorative, so aria-hidden.
 */

const AUB = "#53284F";
const TEAL = "#16A9C8";
const v = (vars: Record<string, string>) => vars as CSSProperties;
const svgClass = "h-auto w-full overflow-visible text-foreground";

/* 01 - small companies merging into one platform: buy-and-build. */
export function RollupArt({ className = "" }: { className?: string }) {
  const ys = [26, 70, 114];
  return (
    <svg viewBox="0 0 240 170" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {ys.map((y, i) => (
        <Fragment key={y}>
          <rect
            className="fade-art"
            style={v({ "--d": `${0.1 + i * 0.12}s` })}
            x="18" y={y} width="46" height="30" rx="6"
            fill="#fff" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2"
          />
          <path
            className="draw" pathLength={1} style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            d={`M64 ${y + 15} C 104 ${y + 15} 110 85 150 85`}
            fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2"
          />
        </Fragment>
      ))}
      <g className="press">
        <rect x="150" y="50" width="70" height="70" rx="10" fill={AUB} />
        <Building2 x="170" y="70" width="30" height="30" color="#fff" strokeWidth={1.7} />
      </g>
      <text className="fade-art" style={v({ "--d": "0.95s" })} x="185" y="135" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="currentColor" fillOpacity="0.6">platform</text>
    </svg>
  );
}

/* 02 - a field of companies, most faint (not in any database). */
export function HiddenArt({ className = "" }: { className?: string }) {
  const cells: { x: number; y: number; on: boolean }[] = [];
  const cols = [16, 62, 108, 154, 200];
  const rows = [22, 74, 126];
  rows.forEach((y, r) =>
    cols.forEach((x, c) => cells.push({ x, y, on: (r === 1 && c === 1) || (r === 0 && c === 3) })),
  );
  return (
    <svg viewBox="0 0 240 170" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {/* dashed "databases" boundary around the few that are listed */}
      <rect
        className="draw" pathLength={1} style={{ animationDelay: "0.6s" }}
        x="150" y="14" width="78" height="60" rx="10"
        fill="none" stroke={TEAL} strokeWidth="2" strokeDasharray="4 4"
      />
      <text className="fade-art" style={v({ "--d": "1.1s" })} x="189" y="9" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill={TEAL}>databases</text>
      {cells.map(({ x, y, on }, i) => (
        <rect
          key={i}
          className="fade-art"
          style={v({ "--d": `${0.1 + i * 0.04}s` })}
          x={x} y={y} width="34" height="32" rx="5"
          fill={on ? AUB : "#fff"}
          stroke={on ? AUB : "currentColor"}
          strokeOpacity={on ? 1 : 0.16}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

/* 03 - a magnifier sweeping the live web; matches light up teal. */
export function ExaArt({ className = "" }: { className?: string }) {
  const docs = [40, 100, 160];
  return (
    <svg viewBox="0 0 250 180" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {docs.map((x, i) => (
        <g key={x}>
          <rect
            className="fade-art" style={v({ "--d": `${0.1 + i * 0.12}s` })}
            x={x} y="50" width="50" height="78" rx="6"
            fill="#fff" stroke="currentColor" strokeOpacity="0.32" strokeWidth="2"
          />
          <line x1={x + 10} y1="68" x2={x + 40} y2="68" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2.6" strokeLinecap="round" />
          <line x1={x + 10} y1="80" x2={x + 40} y2="80" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2.6" strokeLinecap="round" />
          <line
            className="fade-art" style={v({ "--d": `${0.8 + i * 0.28}s` })}
            x1={x + 10} y1="110" x2={x + 38} y2="110" stroke={TEAL} strokeWidth="3.4" strokeLinecap="round"
          />
        </g>
      ))}
      <g className="sweep">
        <circle cx="52" cy="90" r="25" fill={TEAL} fillOpacity="0.1" stroke={AUB} strokeWidth="2.6" />
        <line x1="70" y1="108" x2="88" y2="126" stroke={AUB} strokeWidth="4.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* 04 - a gate: look-alikes dropped (x), real matches pass (check), facts pulled. */
export function FilterArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 170" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {/* funnel */}
      <path
        className="draw" pathLength={1}
        d="M40 38 H200 L150 96 V132 H90 V96 Z"
        fill={AUB} fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2.2" strokeLinejoin="round"
      />
      {/* dropped look-alike */}
      <g className="fade-art" style={v({ "--d": "0.7s" })}>
        <circle cx="206" cy="64" r="12" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.8" />
        <path d="M201 59 l10 10 M211 59 l-10 10" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* passes, with a clean check */}
      <g className="press">
        <circle cx="120" cy="150" r="15" fill={TEAL} />
        <path d="M112 150 l5 6 l11 -13" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* facts ticks above the funnel */}
      {[60, 100, 140, 180].map((x, i) => (
        <rect key={x} className="fade-art" style={v({ "--d": `${0.15 + i * 0.08}s` })} x={x} y="20" width="20" height="10" rx="3" fill="#fff" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6" />
      ))}
    </svg>
  );
}

/* 05 - a slide deck with a teal "ready" stamp. */
export function DeckArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 170" role="img" aria-hidden className={`${svgClass} ${className}`}>
      <rect className="fade-art" style={v({ "--d": "0.15s" })} x="44" y="46" width="120" height="84" rx="8" fill="#fff" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
      <rect className="fade-art" style={v({ "--d": "0.3s" })} x="54" y="38" width="120" height="84" rx="8" fill="#fff" stroke="currentColor" strokeOpacity="0.32" strokeWidth="2" />
      <rect className="draw" pathLength={1} x="64" y="30" width="120" height="84" rx="8" fill="#fff" stroke="currentColor" strokeWidth="2.2" />
      <rect className="fade-art" style={v({ "--d": "0.55s" })} x="64" y="30" width="120" height="16" rx="8" fill={AUB} />
      <line className="fade-art" style={v({ "--d": "0.7s" })} x1="78" y1="64" x2="150" y2="64" stroke="currentColor" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
      <line className="fade-art" style={v({ "--d": "0.8s" })} x1="78" y1="78" x2="134" y2="78" stroke="currentColor" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
      <line className="fade-art" style={v({ "--d": "0.9s" })} x1="78" y1="92" x2="120" y2="92" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
      <g className="press">
        <circle cx="176" cy="120" r="22" fill={TEAL} fillOpacity="0.12" stroke={TEAL} strokeWidth="2.4" />
        <path d="M166 120 l7 8 l14 -17" fill="none" stroke={TEAL} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* The opening one-line overview: five steps, connectors grow in from the left. */
const STEPS = [
  { icon: Building2, label: "One company" },
  { icon: Search, label: "Find similar" },
  { icon: Filter, label: "Filter" },
  { icon: Sparkles, label: "Research" },
  { icon: FileText, label: "Recommend" },
] as const;

export function MiniPipeline() {
  return (
    <div className="flex items-start justify-between gap-1 sm:gap-2">
      {STEPS.map((s, i) => (
        <Fragment key={s.label}>
          <div className="flex shrink-0 flex-col items-center gap-1.5 text-center sm:gap-2">
            <span
              className="flex size-10 items-center justify-center rounded-full border bg-card sm:size-14"
              style={{ borderColor: `${AUB}33`, color: AUB }}
            >
              <s.icon className="size-[1.05rem] sm:size-6" strokeWidth={1.6} />
            </span>
            <span className="text-[0.56rem] font-semibold uppercase tracking-[0.04em] text-muted-foreground sm:text-[0.7rem] sm:tracking-[0.1em]">
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 ? (
            <span
              className="pipe-line mt-5 h-px flex-1 sm:mt-7"
              style={{ background: `${TEAL}99`, ...v({ "--d": `${0.2 + i * 0.18}s` }) }}
              aria-hidden
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
