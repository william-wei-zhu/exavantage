"use client";

import { Check } from "lucide-react";
import { FIRMS, type Firm } from "@/lib/firms";
import { cn } from "@/lib/utils";

/** The branded picker: choose the firm the report is prepared for. */
export function FirmPicker({
  selected,
  onSelect,
}: {
  selected: Firm;
  onSelect: (firm: Firm) => void;
}) {
  return (
    <div>
      <p className="section-label mb-3">Prepared for</p>
      <div className="flex flex-wrap gap-2">
        {FIRMS.map((firm) => {
          const active = firm.id === selected.id;
          return (
            <button
              key={firm.id}
              type="button"
              onClick={() => onSelect(firm)}
              aria-pressed={active}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? "text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
              style={
                active
                  ? { borderColor: firm.accent, backgroundColor: firm.surface }
                  : undefined
              }
            >
              {active && <Check className="h-3.5 w-3.5" style={{ color: firm.accent }} />}
              <span style={active ? { color: firm.accent } : undefined}>{firm.name}</span>
              {firm.note && (
                <span className="hidden rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground sm:inline">
                  {firm.note}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
