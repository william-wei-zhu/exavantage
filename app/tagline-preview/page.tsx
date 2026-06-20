"use client";

import { useState } from "react";

/**
 * LOCAL-ONLY mockup (not linked anywhere). Option B's design — Stack+Rule entrance,
 * smaller / one-row, KKR aubergine, accent on "deal", no blue — auditioned across
 * fonts that approximate KKR's (proprietary, geometric-engraved) brand type.
 * Visit /tagline-preview. Delete this folder once a font is chosen.
 */

const WORDS = ["Your", "vantage", "on", "every", "deal."];
const DELAYS = [80, 230, 380, 500, 650];

function TLine({ variant }: { variant: string }) {
  return (
    <h1 className={`tline ${variant}`}>
      {WORDS.map((w, i) => (
        <span key={i} className="tw" style={{ animationDelay: `${DELAYS[i]}ms` }}>
          <span>{w}</span>
        </span>
      ))}
      <span className="tw-rule" aria-hidden />
    </h1>
  );
}

const CARDS = [
  {
    id: "vHanken",
    name: "1 · Hanken Grotesk",
    font: "Hanken Grotesk",
    note: "The app's existing KKR-corporate stand-in (already loaded for the deck). Neutral, professional, the safest match to KKR's house style. Recommended default.",
  },
  {
    id: "vJost",
    name: "2 · Jost",
    font: "Jost",
    note: "Geometric / Futura-like. Echoes the geometric construction of the KKR logo while staying clean and modern. A touch more characterful than Hanken.",
  },
  {
    id: "vJosefin",
    name: "3 · Josefin Sans (UPPERCASE)",
    font: "Josefin Sans",
    note: "High-waisted, engraved-geometric caps: the closest free echo of the actual KKR wordmark. Set in uppercase to mirror the logo. Most distinctive / most 'KKR logo'.",
  },
  {
    id: "vSpace",
    name: "4 · Space Grotesk",
    font: "Space Grotesk",
    note: "Your original B pick, for reference. A grotesk (not geometric), slightly quirkier than KKR's actual type.",
  },
];

export default function TaglinePreview() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="exa-theme min-h-screen bg-background px-6 py-12">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800&family=Jost:wght@500;600;700&family=Josefin+Sans:wght@600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <div className="mx-auto max-w-[1040px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              local mockup · option B · one row · KKR aubergine · fonts matched to KKR
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Which font reads most KKR?</h2>
          </div>
          <button
            onClick={() => setReplay((n) => n + 1)}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Replay entrance
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {CARDS.map((c) => (
            <div key={`${c.id}-${replay}`} className="tp-card">
              <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
                <span className="tp-cardname font-mono text-sm font-semibold">{c.name}</span>
                <span className="tp-pill rounded-full px-2.5 py-0.5 font-mono text-[11px]">{c.font}</span>
              </div>

              <TLine variant={c.id} />

              <p className="tp-note mt-7 max-w-2xl text-sm leading-relaxed">{c.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-xs text-muted-foreground">
          Tell me 1–4 (or another font). I&apos;ll apply it to the real hero, wire it via next/font, and delete this page.
        </p>
      </div>
    </div>
  );
}

const css = `
.tp-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--border);
  padding: 2.5rem 2rem;
  background: #ffffff;
}
@media (min-width: 640px) { .tp-card { padding: 3rem; } }
.tp-cardname { color: #53284F; }
.tp-pill { background: #f1ecf0; color: #6b6b6b; }
.tp-note { color: #525252; }

/* ===== shared Stack + Rule, smaller, one row, KKR aubergine ===== */
.tline {
  position: relative;
  display: flex; flex-wrap: nowrap; align-items: baseline; gap: 0 0.4ch;
  white-space: nowrap;
  padding-bottom: 0.22em;
  color: #1b1b1b;
  font-weight: 700;
  font-size: clamp(1.4rem, 3.9vw, 2.7rem);
  line-height: 1.0;
}
.tw { display: inline-block; overflow: hidden; vertical-align: bottom; }
.tw > span {
  display: inline-block;
  transform: translateY(118%);
  animation: tw-rise 0.62s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: inherit;
}
@keyframes tw-rise { to { transform: translateY(0); } }
.tline .tw:nth-child(5) > span { color: #53284F; } /* "deal" = KKR aubergine */
.tw-rule {
  position: absolute; left: 0; bottom: 0;
  height: 3px; width: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #53284F, #8a5285);
  transform: scaleX(0); transform-origin: left;
  animation: tw-rule 0.7s 0.95s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes tw-rule { to { transform: scaleX(1); } }

/* ===== font variants ===== */
.vHanken { font-family: 'Hanken Grotesk', system-ui, sans-serif; letter-spacing: -0.018em; }
.vJost   { font-family: 'Jost', system-ui, sans-serif; letter-spacing: -0.005em; }
.vJosefin {
  font-family: 'Josefin Sans', system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.015em;
  font-size: clamp(1.45rem, 4vw, 2.8rem);
}
.vSpace  { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.022em; }

@media (prefers-reduced-motion: reduce) {
  .tw > span { animation: none; transform: none; }
  .tw-rule { animation: none; transform: scaleX(1); }
}
`;
