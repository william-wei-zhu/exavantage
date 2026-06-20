"use client";

import type { Company } from "@/lib/types";

/** AI-generated synthesis of the landscape and the takeaway. */
export function ExecutiveSummary({
  text,
  companies,
  accent,
}: {
  text: string;
  companies: Company[];
  accent: string;
}) {
  const total = companies.length;
  const emerging = companies.filter((c) => c.emerging).length;

  return (
    <div
      className="rounded-xl p-6 ring-1 ring-foreground/10"
      style={{ backgroundColor: `${accent}0d` }}
    >
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-border pb-4">
        <Stat value={String(total)} label="companies mapped" />
        <Stat value={String(emerging)} label="under-the-radar" />
      </div>
      {text ? (
        <div className="mt-4 space-y-3">
          {text
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-foreground">
                {para.trim()}
              </p>
            ))}
        </div>
      ) : (
        <p className="mt-4 text-[15px] text-muted-foreground">
          Synthesizing the takeaway…
        </p>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-heading text-2xl font-bold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
