import { Fragment, type CSSProperties } from "react";

/*
 * Clean, precise line-art for the /architecture deep dive (a more technical
 * register than the sketchy docs-art on the lay About page, same aubergine +
 * teal palette). Pure SVG, no diagram library. Each piece paints once when its
 * <Reveal> ancestor gets `.is-visible` (globals.css). Decorative, aria-hidden.
 */

const AUB = "#53284F";
const TEAL = "#16A9C8";
const v = (vars: Record<string, string>) => vars as CSSProperties;
const svgClass = "h-auto w-full overflow-visible text-foreground";

/* Two-pass discovery: findSimilar (off a domain) + Exa Agent (off the thesis)
 * converge and dedupe into one universe. */
export function TwoPassArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 180" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {/* source A: findSimilar */}
      <g className="fade-art" style={v({ "--d": "0.1s" })}>
        <rect x="10" y="28" width="92" height="34" rx="8" fill="#fff" stroke={TEAL} strokeWidth="2" />
        <text x="56" y="49" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={TEAL}>findSimilar</text>
        <text x="56" y="78" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="currentColor" fillOpacity="0.5">off a domain</text>
      </g>
      {/* source B: Exa Agent */}
      <g className="fade-art" style={v({ "--d": "0.25s" })}>
        <rect x="10" y="116" width="92" height="34" rx="8" fill="#fff" stroke={TEAL} strokeWidth="2" />
        <text x="56" y="137" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={TEAL}>Exa Agent</text>
        <text x="56" y="166" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="currentColor" fillOpacity="0.5">off the thesis</text>
      </g>
      {/* converging connectors */}
      <path className="draw" pathLength={1} style={{ animationDelay: "0.5s" }} d="M102 45 C 150 45 150 80 196 80" fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2" />
      <path className="draw" pathLength={1} style={{ animationDelay: "0.6s" }} d="M102 133 C 150 133 150 96 196 96" fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2" />
      {/* deduped universe */}
      <g className="press">
        <rect x="196" y="58" width="74" height="60" rx="10" fill={AUB} />
        <text x="233" y="84" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#fff">deduped</text>
        <text x="233" y="99" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#fff">universe</text>
      </g>
    </svg>
  );
}

/* Two-layer independence funnel: candidates narrow as parent-owned sub-brands
 * drop at gate 1 (world knowledge) then gate 2 (evidence from fetched text). */
export function IndependenceFunnelArt({ className = "" }: { className?: string }) {
  const drop = (x: number, y: number, d: string) => (
    <g className="fade-art" style={v({ "--d": d })}>
      <circle cx={x} cy={y} r="11" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.8" />
      <path d={`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`} stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 280 180" role="img" aria-hidden className={`${svgClass} ${className}`}>
      {/* candidates in */}
      {[24, 48, 72, 96, 120].map((x, i) => (
        <rect key={x} className="fade-art" style={v({ "--d": `${0.1 + i * 0.05}s` })} x={x} y="14" width="16" height="16" rx="3" fill="#fff" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.8" />
      ))}
      {/* gate 1 */}
      <line className="draw" pathLength={1} style={{ animationDelay: "0.4s" }} x1="20" y1="52" x2="150" y2="52" stroke={AUB} strokeOpacity="0.55" strokeWidth="2" />
      <text className="fade-art" style={v({ "--d": "0.6s" })} x="156" y="56" fontFamily="var(--font-mono)" fontSize="9" fill={AUB}>gate 1 · world knowledge</text>
      {drop(210, 72, "0.7s")}
      {/* gate 2 */}
      <line className="draw" pathLength={1} style={{ animationDelay: "0.6s" }} x1="40" y1="104" x2="130" y2="104" stroke={AUB} strokeOpacity="0.55" strokeWidth="2" />
      <text className="fade-art" style={v({ "--d": "0.85s" })} x="156" y="108" fontFamily="var(--font-mono)" fontSize="9" fill={AUB}>gate 2 · evidence from text</text>
      {drop(210, 124, "0.95s")}
      {/* funnel walls */}
      <path className="draw" pathLength={1} style={{ animationDelay: "0.3s" }} d="M20 40 L150 40 L100 150 L70 150 Z" fill={TEAL} fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeLinejoin="round" />
      {/* survivors out, with a check */}
      <g className="press">
        <circle cx="85" cy="164" r="13" fill={TEAL} />
        <path d="M78 164 l5 5 l9 -11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Fragment />
    </svg>
  );
}
