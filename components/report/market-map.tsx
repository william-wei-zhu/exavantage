"use client";

import type { Company, Segment } from "@/lib/types";
import { faviconUrl } from "@/lib/util";

/**
 * The market map: discovered companies organized by sub-segment. This is the
 * screenshot-able centerpiece, the slide that gets shared around a firm.
 */
export function MarketMap({
  segments,
  companies,
  accent,
}: {
  segments: Segment[];
  companies: Company[];
  accent: string;
}) {
  const byDomain = new Map(companies.map((c) => [c.domain, c]));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {segments.map((seg) => {
        const members = seg.domains
          .map((d) => byDomain.get(d))
          .filter((c): c is Company => Boolean(c));
        // Fall back to companies whose segment label matches (model may name a
        // segment without listing every domain).
        const fallback = companies.filter(
          (c) => c.segment === seg.label && !seg.domains.includes(c.domain),
        );
        const all = [...members, ...fallback];
        if (all.length === 0) return null;

        return (
          <div
            key={seg.label}
            className="flex flex-col rounded-xl border border-border bg-card"
            style={{ borderTop: `3px solid ${accent}` }}
          >
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-heading text-base font-semibold leading-tight">
                {seg.label}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {seg.blurb}
              </p>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {all.map((c) => (
                <li key={c.domain} className="flex items-center gap-2.5 px-4 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={faviconUrl(c.domain, 64)}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 rounded border border-border bg-white"
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  {c.emerging && (
                    <span
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                      title="Emerging"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
