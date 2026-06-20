"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export type Slide = { id: string; title: string; node: ReactNode };

/**
 * A reusable slide-deck carousel (modeled on skatepuck's Deck): prev/next, dot
 * indicators, a "2 / 6 · Title" counter, and arrow-key nav (ignored while typing
 * in an input). Every slide stays mounted; CSS hides the inactive ones. On print
 * all slides show, one per page (see globals.css .deck-* rules), so PDF export
 * gives a real page-per-slide deck.
 *
 * `accent` colors the active dot + controls so the deck matches the firm brand.
 */
export function Deck({
  slides,
  accent = "#1f40ed",
  toolbar,
}: {
  slides: Slide[];
  accent?: string;
  toolbar?: ReactNode;
}) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const clamped = Math.min(i, Math.max(0, n - 1));
  const go = useCallback((idx: number) => setI(Math.max(0, Math.min(n - 1, idx))), [n]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      else if (e.key === "ArrowRight") setI((x) => Math.min(n - 1, x + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  if (n === 0) return null;
  const atEnd = clamped === n - 1;

  // The prev/next/dots/counter cluster, rendered both above and below the deck so
  // navigation is reachable without scrolling back to the top.
  const controls = (
    <div className="no-print flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => go(clamped - 1)}
          disabled={clamped === 0}
          className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-1 items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: idx === clamped ? 22 : 8,
                  background: idx === clamped ? accent : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => go(clamped + 1)}
          disabled={atEnd}
          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-white transition-opacity disabled:pointer-events-none disabled:opacity-40"
          style={{ background: atEnd ? "var(--muted-foreground)" : accent }}
          aria-label="Next slide"
        >
          {atEnd ? <><Check className="h-4 w-4" /> End</> : <>Next <ChevronRight className="h-4 w-4" /></>}
        </button>
      </div>

      <div className="text-center text-[12px] font-medium tracking-wide text-muted-foreground">
        <span style={{ color: accent }}>{clamped + 1}</span> / {n} · {slides[clamped].title}
      </div>
    </div>
  );

  return (
    <div className="deck">
      <div className="mb-4">{controls}</div>

      {/* Slides — all mounted; CSS controls visibility (and print). */}
      <div className="deck-slides">
        {slides.map((s, idx) => (
          <div key={s.id} className={idx === clamped ? "deck-slide-active" : "deck-slide-hidden"}>
            {s.node}
          </div>
        ))}
      </div>

      <div className="mt-5">{controls}</div>

      {toolbar && <div className="no-print mt-4">{toolbar}</div>}
    </div>
  );
}
