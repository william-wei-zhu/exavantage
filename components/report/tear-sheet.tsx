"use client";

import { ArrowUpRight, Radio } from "lucide-react";
import type { Company } from "@/lib/types";
import { faviconUrl, urlForDomain } from "@/lib/util";

/** A single company tear sheet: the format analysts already trust. */
export function TearSheet({ company, accent }: { company: Company; accent: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(company.domain, 64)}
          alt=""
          width={32}
          height={32}
          className="mt-0.5 h-8 w-8 shrink-0 rounded-md border border-border bg-white"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-semibold leading-tight">
              {company.name}
            </h3>
            {company.emerging && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
              >
                Emerging
              </span>
            )}
          </div>
          <a
            href={urlForDomain(company.domain)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-sm text-muted-foreground hover:text-primary"
          >
            {company.domain}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <p className="text-[15px] font-medium text-foreground">{company.oneLiner}</p>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{company.summary}</p>

      {company.recentSignal && (
        <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2">
          <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
          <p className="text-[13px] leading-snug text-foreground">
            {company.recentSignalUrl ? (
              <a
                href={company.recentSignalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {company.recentSignal}
              </a>
            ) : (
              company.recentSignal
            )}
          </p>
        </div>
      )}

      {company.similar.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-xs font-medium text-muted-foreground">Similar to</span>
          {company.similar.map((s) => (
            <span
              key={s}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
