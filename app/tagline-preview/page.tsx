"use client";

import { useState } from "react";

/**
 * LOCAL-ONLY mockup (not linked anywhere). Same "Stack + Rule" entrance the
 * owner picked (words rise from the baseline, staggered, then a rule draws),
 * auditioned across three font families + color systems. Accent word = "deal".
 * Visit /tagline-preview. Delete this folder once a direction is chosen.
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
    id: "vA",
    name: "A · Editorial Serif",
    font: "Fraunces",
    note: "Fraunces, a high-contrast literary serif. Mixed-case, near-black line with an italic aubergine “deal” and a teal→aubergine rule. Reads like a partner memo / annual letter.",
  },
  {
    id: "vB",
    name: "B · Modern Grotesk",
    font: "Space Grotesk",
    note: "Space Grotesk, geometric and tight. Aubergine line, teal “deal”, a teal→gold rule. Clean modern-fund energy (think a sharp new PE shop’s wordmark).",
  },
  {
    id: "vC",
    name: "C · Condensed Institutional",
    font: "Saira Condensed",
    note: "Saira Condensed, tall and uppercase. Ink line with a champagne-gold “DEAL” and an aubergine→gold rule. Letterhead / Wall-Street masthead authority.",
  },
];

export default function TaglinePreview() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="exa-theme min-h-screen bg-background px-6 py-12">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Space+Grotesk:wght@500;600;700&family=Saira+Condensed:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <div className="mx-auto max-w-[1040px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              local mockup · same rise+rule motion · accent on &quot;deal&quot;
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Three type + color systems</h2>
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
            <div key={`${c.id}-${replay}`} className={`tp-card tp-${c.id}`}>
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
          Tell me A, B, or C (or a blend / different font to try). I&apos;ll apply it to the real hero and delete this page.
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
  padding: 2.75rem 2rem 2.5rem;
  background: #fbfbfa;
}
@media (min-width: 640px) { .tp-card { padding: 3.5rem 3rem; } }
.tp-cardname { color: #53284F; }
.tp-pill { background: #f1ecf0; color: #6b6b6b; }
.tp-note { color: #525252; }

/* ===== shared Stack + Rule motion ===== */
.tline {
  position: relative;
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.5ch;
  padding-bottom: 0.22em;
  max-width: 18ch;
}
.tw { display: inline-block; overflow: hidden; vertical-align: bottom; }
.tw > span {
  display: inline-block;
  transform: translateY(118%);
  animation: tw-rise 0.62s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: inherit;
}
@keyframes tw-rise { to { transform: translateY(0); } }
.tw-rule {
  position: absolute; left: 0; bottom: 0;
  height: 3px; width: 100%;
  border-radius: 2px;
  transform: scaleX(0); transform-origin: left;
  animation: tw-rule 0.7s 0.95s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes tw-rule { to { transform: scaleX(1); } }

/* ===== A · Editorial Serif (Fraunces) ===== */
.vA {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 600;
  font-size: clamp(2.5rem, 6.8vw, 5.1rem);
  line-height: 1.0;
  letter-spacing: -0.012em;
  color: #1b1b1b;
}
.vA .tw:nth-child(5) > span { color: #53284F; font-style: italic; }
.vA .tw-rule { background: linear-gradient(90deg, #16A9C8, #53284F); }

/* ===== B · Modern Grotesk (Space Grotesk) ===== */
.vB {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(2.5rem, 6.8vw, 5.1rem);
  line-height: 1.0;
  letter-spacing: -0.022em;
  color: #53284F;
}
.vB .tw:nth-child(5) > span { color: #16A9C8; }
.vB .tw-rule { background: linear-gradient(90deg, #16A9C8 35%, #C9A24A); }

/* ===== C · Condensed Institutional (Saira Condensed) ===== */
.vC {
  font-family: 'Saira Condensed', system-ui, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: clamp(2.8rem, 8vw, 6rem);
  line-height: 0.95;
  letter-spacing: 0.012em;
  color: #161616;
}
.vC .tw:nth-child(5) > span { color: #C9A24A; }
.vC .tw-rule { background: linear-gradient(90deg, #53284F, #C9A24A); }

@media (prefers-reduced-motion: reduce) {
  .tw > span { animation: none; transform: none; }
  .tw-rule { animation: none; transform: scaleX(1); }
}
`;
