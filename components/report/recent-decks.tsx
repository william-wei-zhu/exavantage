import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { faviconUrl } from "@/lib/util";
import type { DeckListing } from "@/lib/store";

const AUB = "#53284F";

/** Homepage gallery of recently generated decks (one per company). */
export function RecentDecks({ decks }: { decks: DeckListing[] }) {
  if (!decks.length) return null;
  return (
    <section className="no-print mt-16">
      <p className="section-label mb-4" style={{ color: AUB }}>Recent decks</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((d) => (
          <Link
            key={d.id}
            href={`/r/${d.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#53284F]/40"
          >
            {d.domain ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconUrl(d.domain, 64)}
                alt=""
                className="h-9 w-9 shrink-0 rounded-md border border-black/5 bg-white"
              />
            ) : (
              <span className="h-9 w-9 shrink-0 rounded-md" style={{ background: `${AUB}14` }} />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{d.name}</p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {d.marketStat || "Buy-and-build deck"}
              </p>
            </div>
            <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
