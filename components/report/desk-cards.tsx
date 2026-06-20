"use client";

import { ArrowRight } from "lucide-react";
import { FIRMS, type Firm } from "@/lib/firms";
import { lensFor } from "@/lib/lenses";
import { FirmLogo } from "./firm-logo";
import { PRINT_EXACT } from "./slides/bits";

/**
 * The homepage "choose your desk" picker: three brand-colored cards, one per
 * institution type, each stating that desk's job-to-be-done. Picking a desk sets
 * the firm + tailors the report and the example prompts. This is what makes the
 * three workflows feel distinct from the first screen.
 */
export function DeskCards({
  selected,
  onSelect,
}: {
  selected: Firm;
  onSelect: (firm: Firm) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {FIRMS.map((firm) => {
        const lens = lensFor(firm.lens);
        const active = firm.id === selected.id;
        const t = firm.theme;
        return (
          <button
            key={firm.id}
            type="button"
            onClick={() => onSelect(firm)}
            aria-pressed={active}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              borderColor: active ? t.primary : "var(--border)",
              boxShadow: active ? `0 0 0 1px ${t.primary}` : undefined,
              background: active ? `${t.primary}08` : undefined,
              ...PRINT_EXACT,
            }}
          >
            {/* Top accent bar */}
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: t.primary, opacity: active ? 1 : 0.35, ...PRINT_EXACT }}
            />

            <div className="flex items-center justify-between">
              <FirmLogo firm={firm} height={firm.logo.kind === "svg" ? 26 : 20} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: active ? t.primary : "var(--muted-foreground)" }}
              >
                {firm.kind}
              </span>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold leading-snug tracking-tight text-foreground">
                {lens.jobTitle}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">
                {lens.jobShort}
              </p>
            </div>

            <div
              className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-semibold transition-colors"
              style={{ color: active ? t.primary : "var(--muted-foreground)" }}
            >
              {active ? "Selected" : "Use this desk"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
