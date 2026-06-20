import type { Metadata } from "next";
import { ExaHeader } from "@/components/exa-header";
import { ExaFooter } from "@/components/exa-footer";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What Exa Vantage is, who it is for, and the exact pipeline behind each report.",
};

const STEPS = [
  {
    n: "01",
    title: "Route the request",
    plain:
      "You type one thing: a company name or a sector thesis. We figure out which it is.",
    tech: "Gemini 3.1 Flash Lite classifies the input as company vs sector and, for a company, resolves its official domain.",
  },
  {
    n: "02",
    title: "Discover the universe",
    plain:
      "We find the companies that matter, including ones the big databases have not catalogued.",
    tech: "Company mode: Exa findSimilar on the seed domain. Sector mode: Exa neural search (category: company). Results deduped by domain.",
  },
  {
    n: "03",
    title: "Surface the under-the-radar names",
    plain:
      "A second pass looks for newer, lower-profile companies that the structured databases lag on.",
    tech: "A freshness-tuned Exa search (startPublishedDate window) flags emerging companies not already in the core set.",
  },
  {
    n: "04",
    title: "Cluster and profile",
    plain:
      "We group the companies into sub-segments and write a tear sheet for each.",
    tech: "One holistic Gemini structured-JSON call builds the market-map clusters and per-company one-liners, summaries, similar-to rows, and emerging flags from the Exa summaries.",
  },
  {
    n: "05",
    title: "Pull recent signals",
    plain: "Each company gets one fresh signal: funding, a launch, a partnership.",
    tech: "A per-company Exa search over the trailing 180 days, run with bounded concurrency, streamed in as it resolves.",
  },
  {
    n: "06",
    title: "Synthesize and brand",
    plain:
      "We write the executive summary and render the whole thing in your firm's brand, exportable to PDF.",
    tech: "A final Gemini synthesis call writes the summary; the report renders client-branded and exports to PDF with the summary moved to the top.",
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
            research: the person who maps a sector, builds the comp set, and
            catches this week&apos;s signals. It compresses the slow first 80% of
            that work, the searching and synthesis, without replacing the
            analyst&apos;s judgment.
          </p>

          <div className="mt-6 rounded-xl bg-secondary px-5 py-4 text-[15px] text-secondary-foreground">
            <span className="font-semibold">The whole flow in one line:</span>{" "}
            seed (company or thesis) → Exa discovers the company set → cluster
            into sub-segments → profile each with a recent signal → surface the
            hidden ones → Gemini writes the synthesis → branded report, exported
            to PDF.
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
                search, findSimilar, and content summaries
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Gemini 3.1 Flash Lite
                </span>{" "}
                — routing, clustering, synthesis (seed 7, structured JSON)
              </li>
              <li>
                <span className="font-medium text-foreground">Next.js on Vercel</span>{" "}
                — App Router, NDJSON streaming route
              </li>
              <li>
                <span className="font-medium text-foreground">PostHog</span> —
                product analytics
              </li>
            </ul>
            <p className="mt-6 text-[14px] text-muted-foreground">
              What Exa is not here: structured financials, cap tables, or stock
              prices. Exa Vantage wins on discovery of the unknown, freshness from
              unstructured sources, and what a company actually does.
            </p>
          </div>
        </div>
      </main>
      <ExaFooter />
    </div>
  );
}
