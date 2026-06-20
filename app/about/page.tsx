import type { Metadata } from "next";
import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What Exa Vantage is, who it is for, and the exact pipeline behind each report.",
};

const STEPS = [
  {
    n: "01",
    title: "Pick a desk, route the request",
    plain:
      "Choose Investment Bank, Private Equity, or Venture Capital, then type a company or an industry. Each desk tailors the whole report.",
    tech: "Gemini 3.1 Flash Lite classifies the input as company vs industry and resolves a company's domain. The desk sets the lens (IPO comps / buyout targets / landscape).",
  },
  {
    n: "02",
    title: "Discover, then filter for relevance",
    plain:
      "We find the companies that matter, including ones the big databases have not catalogued, and drop the look-alikes that only share a name.",
    tech: "Exa findSimilar (company) plus a semantic search built from the seed's real business; a Gemini relevance gate removes name-collisions, judging by what each company does.",
  },
  {
    n: "03",
    title: "Surface what's emerging",
    plain:
      "A deep-research pass looks for newer, lower-profile companies the structured databases lag on.",
    tech: "Exa Agent deep research (effort-dialed) finds under-the-radar names; falls back to a freshness-tuned Exa search.",
  },
  {
    n: "04",
    title: "Cluster, profile, and quantify",
    plain:
      "We group the companies into sub-segments, write a tear sheet for each, and pull the numbers: funding, founded year, stage, headcount, HQ.",
    tech: "A Gemini pass builds the clusters and tear sheets. A per-company Exa search pulls page text, and one batched Gemini pass extracts quant from evidence only (blank when unknown). No invented figures.",
  },
  {
    n: "05",
    title: "Catch recent signals",
    plain: "Each company gets a fresh signal: funding, a launch, a hire.",
    tech: "The same per-company Exa search surfaces the freshest result with content, streamed in with bounded concurrency.",
  },
  {
    n: "06",
    title: "Synthesize into a branded deck",
    plain:
      "We write the memo and render everything as a page-by-page slide deck in your firm's brand, shareable by link and exportable to PDF.",
    tech: "A Gemini synthesis call writes the closing memo; the deck saves to Firestore for a shareable /r/[id] page and prints one slide per page.",
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
            Exa as your AI research analyst
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Exa Vantage is built for the analyst or associate who assembles
            research. Pick a desk (Investment Bank, Private Equity, or Venture
            Capital) and the report is tailored to that workflow: IPO
            comparables, acquisition targets, or a competitive landscape. It
            compresses the slow first 80% of the work without replacing the
            analyst&apos;s judgment.
          </p>

          <div className="mt-6 rounded-xl bg-secondary px-5 py-4 text-[15px] text-secondary-foreground">
            <span className="font-semibold">The whole flow in one line:</span>{" "}
            pick a desk → Exa discovers the company set → filter for relevance →
            surface the emerging names → cluster, profile, and quantify → Gemini
            writes the memo → a branded slide deck, shareable and exportable.
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
                search, findSimilar, content text, and Exa Agent deep research
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Gemini 3.1 Flash Lite
                </span>{" "}
                — routing, relevance, clustering, quant, synthesis (seed 7, JSON)
              </li>
              <li>
                <span className="font-medium text-foreground">Next.js on Vercel</span>{" "}
                — App Router, NDJSON streaming route
              </li>
              <li>
                <span className="font-medium text-foreground">Firestore</span> —
                saved reports for shareable links
              </li>
            </ul>
            <p className="mt-6 text-[14px] text-muted-foreground">
              Quantitative figures (funding, founded year, headcount, HQ) are
              estimated from public web sources and left blank when not evident,
              never invented. Exa Vantage wins on discovery of the unknown,
              freshness from unstructured sources, and what a company actually does.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
