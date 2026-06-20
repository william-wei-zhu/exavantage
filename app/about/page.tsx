import type { Metadata } from "next";
import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What Exa Vantage is, who it is for, and the exact pipeline behind each deck.",
};

const STEPS = [
  {
    n: "01",
    title: "Enter a platform company",
    plain:
      "Type one platform company. Exa Vantage maps the proprietary add-on universe a deal team would build a roll-up around.",
    tech: "Gemini resolves the company and its domain. Company-only with a soft guard: if no single company resolves, it nudges and still returns a best-effort set, never an error.",
  },
  {
    n: "02",
    title: "Discover, then filter for relevance",
    plain:
      "We find the companies that matter, including the founder-owned long tail the big databases never catalogued, and drop the look-alikes that only share a name.",
    tech: "Exa findSimilar plus a semantic search built from the seed's real business; a Gemini relevance gate removes name-collisions, judging by what each company does.",
  },
  {
    n: "03",
    title: "Surface what's emerging",
    plain:
      "A deep-research pass looks for newer, lower-profile companies the structured databases lag on: the proprietary, off-auction targets.",
    tech: "Exa Agent deep research (effort-dialed) finds under-the-radar names; falls back to a freshness-tuned Exa search.",
  },
  {
    n: "04",
    title: "Cluster, profile, and quantify",
    plain:
      "We group targets into consolidation sub-segments, write a qualification for each, and pull the numbers: funding, founded year, stage, headcount, HQ.",
    tech: "A Gemini pass builds the clusters. A per-company Exa search pulls page text, and one batched Gemini pass extracts quant from evidence only (blank when unknown). No invented figures.",
  },
  {
    n: "05",
    title: "Pull a cited market stat",
    plain:
      "We attach one market-size number for the sector, with its source and a confidence label, never the platform company's own revenue.",
    tech: "Exa retrieves market-research pages (ranked credible-source-first); a Gemini evidence-only pass extracts a total-market figure and copies the real source URL, or omits it.",
  },
  {
    n: "06",
    title: "Write the deal thesis, render the deck",
    plain:
      "One analysis pass turns the set into a recommendation: conviction, why-now, the anchor, tiered targets with angles, value creation, risks, and the ask. It renders as a 9-slide KKR-branded deck.",
    tech: "Gemini 3.5 Flash produces a structured DealThesis grounded only in the discovered data. The deck builds behind a progress view, saves to Firestore for a shareable /r/[id] page, and prints one slide per page.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        <div className="mx-auto w-full max-w-[820px] px-5 py-12 md:px-6 md:py-16">
          <p className="section-label mb-4 text-primary">How it works</p>
          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Exa as your AI deal-origination analyst
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Exa Vantage is built for the private-equity associate sourcing a
            buy-and-build. Enter one platform company and it returns the
            proprietary add-on universe as a partner-grade recommendation: the
            tiered targets, the value-creation thesis, the risks, and the ask. It
            compresses the slow first 80% of origination without replacing the
            associate&apos;s judgment.
          </p>

          <div className="mt-6 rounded-xl bg-secondary px-5 py-4 text-[15px] text-secondary-foreground">
            <span className="font-semibold">The whole flow in one line:</span>{" "}
            enter a platform → Exa discovers the targets → filter for relevance →
            surface the off-database names → cluster, profile, and quantify →
            cite the market → Gemini writes the deal thesis → a 9-slide KKR deck,
            shareable and exportable.
          </div>

          <div className="mt-12 space-y-px overflow-hidden rounded-xl border border-border">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-card px-5 py-6 sm:px-7">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold text-primary">
                    {s.n}
                  </span>
                  <h2 className="font-heading text-xl font-bold">{s.title}</h2>
                </div>
                <p className="mt-2 text-[16px] text-foreground">{s.plain}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {s.tech}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold">What it runs on</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-[15px] text-muted-foreground sm:grid-cols-2">
              <li>
                <span className="font-medium text-foreground">Exa</span> — neural
                search, findSimilar, content text, Exa Agent deep research, and
                cited market sources
              </li>
              <li>
                <span className="font-medium text-foreground">Gemini 3.5 Flash</span>{" "}
                — routing, relevance, clustering, quant, market extraction, and the
                deal thesis (seed 7, JSON)
              </li>
              <li>
                <span className="font-medium text-foreground">Next.js on Vercel</span>{" "}
                — App Router, NDJSON streaming route
              </li>
              <li>
                <span className="font-medium text-foreground">Firestore</span> —
                saved decks for shareable links
              </li>
            </ul>
            <p className="mt-6 text-[14px] text-muted-foreground">
              Quantitative figures (funding, founded year, headcount, HQ) are
              estimated from public web sources and left blank when not evident,
              never invented; the market stat is attributed to its source. Exa
              Vantage wins on discovery of the unknown, freshness from
              unstructured sources, and what a company actually does.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
