import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  Repeat2,
  ShieldCheck,
  BadgeCheck,
  LifeBuoy,
  Gauge,
  Zap,
  Globe,
  Sparkles,
  Triangle,
  Code2,
  Database,
  LineChart,
} from "lucide-react";
import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";
import { GithubMark } from "@/components/github-mark";
import { Reveal } from "@/components/reveal";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { TwoPassArt, IndependenceFunnelArt } from "@/components/architecture-art";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "The Exa Vantage backend, end to end: how one company becomes a streamed, cited deal-origination deck. Built for KKR.",
};

const AUB = "#53284F";
const REPO = "https://github.com/william-wei-zhu/exavantage";

function SourceChip() {
  return (
    <a
      href={REPO}
      target="_blank"
      rel="noopener noreferrer"
      className="lift inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30"
    >
      <GithubMark className="size-4" />
      View source
      <ArrowUpRight className="size-3.5 text-muted-foreground" strokeWidth={2} />
    </a>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-2xl font-bold leading-none" style={{ color: AUB }}>{value}</p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

/** One pipeline phase: a kicker, a title, a lead line, and its concrete steps. */
function Phase({
  num,
  title,
  lead,
  steps,
}: {
  num: string;
  title: string;
  lead: string;
  steps: { call: string; text: ReactNode }[];
}) {
  return (
    <Reveal className="mt-12 first:mt-0">
      <div className="grid gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-8">
        <div>
          <p className="font-heading text-4xl font-bold leading-none" style={{ color: AUB }}>{num}</p>
          <h3 className="mt-2 font-heading text-2xl font-bold leading-tight">{title}</h3>
        </div>
        <div>
          <p className="text-lg leading-relaxed text-foreground/85">{lead}</p>
          <ul className="mt-5 flex flex-col gap-3">
            {steps.map((s, i) => (
              <li key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted-foreground sm:w-28 sm:text-right">
                  {s.call}
                </span>
                <span className="text-[15px] leading-relaxed text-foreground/80">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

function CrossCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="lift rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span style={{ color: AUB }}>{icon}</span>
        <h3 className="font-heading text-lg font-bold leading-none">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">{children}</p>
    </div>
  );
}

function StackCard({ icon, name, spec }: { icon: ReactNode; name: string; spec: string }) {
  return (
    <div className="lift flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
      <span className="mt-0.5" style={{ color: AUB }}>{icon}</span>
      <div>
        <p className="font-heading text-xl font-bold leading-none">{name}</p>
        <p className="mt-1.5 font-mono text-xs leading-relaxed text-muted-foreground">{spec}</p>
      </div>
    </div>
  );
}

const EVENTS: { name: string; when: string }[] = [
  { name: "meta", when: "after routing: mode, restated query, resolved anchor" },
  { name: "cached", when: "on a cache hit: the existing report id, then the stream ends" },
  { name: "segments", when: "after clustering: the sub-segment map" },
  { name: "company", when: "once per surviving company as it is enriched" },
  { name: "emerging", when: "the off-database subset, flagged for the Exa Vantage slide" },
  { name: "market", when: "the cited market-size stat, if one was found" },
  { name: "analysis", when: "the deal thesis (recommendation, targets, risks, ask)" },
  { name: "summary", when: "the one-line executive summary" },
  { name: "done", when: "build complete: generatedAt + the saved report id" },
  { name: "progress / error", when: "phase updates throughout, or a graceful failure" },
];

export default function ArchitecturePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <div className="mx-auto max-w-4xl px-5 pt-16 pb-4 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>Under the hood · built for KKR</p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl font-bold leading-[1.0] tracking-tight sm:text-6xl">
              How Exa Vantage works, end to end.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-foreground/85">
              One company goes in. A cited, partner-grade deal-origination deck streams out. Here is the
              whole backend: every Exa and Gemini call, in order, and what each one streams to your screen.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <SourceChip />
              <Link href="/about" className="text-sm font-semibold text-foreground/70 underline-offset-4 hover:underline">
                The plain-English version
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-7 sm:grid-cols-4">
              <Stat value="1" label="company in" />
              <Stat value="~90s" label="to a full deck" />
              <Stat value="2" label="models · Exa + Gemini" />
              <Stat value="~15-25" label="API calls, streamed live" />
            </div>
          </Reveal>
        </div>

        {/* Hero diagram */}
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>The request lifecycle</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">One pass, top to bottom.</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-foreground/85">
              A single streaming request handler drives the whole pipeline. The left rail is the external
              call that fires at each stage; the right rail is the NDJSON event the browser receives the
              moment that stage finishes, so the deck assembles live instead of after a long wait.
            </p>
          </Reveal>
          <div className="mt-8 rounded-2xl border border-border bg-background p-5 sm:p-8">
            <ArchitectureDiagram />
          </div>
        </div>

        {/* Stage-by-stage walkthrough */}
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>Stage by stage</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">The six phases, in detail.</h2>
          </Reveal>

          <div className="mt-10">
            <Phase
              num="01"
              title="Ingest"
              lead="The expensive route is guarded before any model runs, then opens a streaming response."
              steps={[
                { call: "route handler", text: <><code>GET /api/report/stream</code> validates the query (2-160 chars), enforces a per-IP rate limit (4/min, 40/day, fail-closed), and checks a global hourly/daily budget kill switch.</> },
                { call: "stream", text: <>It opens an NDJSON <code>ReadableStream</code> (<code>application/x-ndjson</code>, no buffering) and hands a <code>send()</code> callback to the pipeline.</> },
              ]}
            />
            <Phase
              num="02"
              title="Route"
              lead="Gemini decides what you typed and resolves it to a real company, with a cache shortcut on both ends."
              steps={[
                { call: "cache", text: <>Before anything, a Firestore lookup by normalized input returns a saved deck instantly (unless you hit Regenerate). A second check runs after the name resolves, to catch alternate phrasings.</> },
                { call: "Gemini", text: <><code>routeInput()</code> classifies company vs sector and resolves the official name + domain; Exa search is the fallback when the model has no reliable domain. Emits <code>meta</code>.</> },
              ]}
            />
            <Phase
              num="03"
              title="Discover"
              lead="Two Exa calls, run in parallel, build the candidate universe so we never over-index on a brand token."
              steps={[
                { call: "Exa contents", text: <><code>fetchSiteContent()</code> reads the anchor's own site to ground everything in what it actually does.</> },
                { call: "Exa ×2", text: <><code>findSimilar</code> off the seed domain and a semantic <code>search</code> run together; <code>mergeHits()</code> dedupes them. The market-size search is also kicked off here to overlap its latency.</> },
              ]}
            />
            <Phase
              num="04"
              title="Gate"
              lead="Two Gemini gates keep only companies that are both genuinely relevant and actually acquirable."
              steps={[
                { call: "Gemini", text: <><code>filterRelevant()</code> drops name-collisions (the &ldquo;Exa&rdquo; vs &ldquo;Exaforce&rdquo; problem), judging by what each company does.</> },
                { call: "Gemini", text: <><code>filterIndependent()</code> is the first independence layer: it drops sub-brands of a larger parent and the anchor's own subsidiaries, using model world knowledge. Both gates fall back to keeping the set if they would over-filter.</> },
              ]}
            />
            <Phase
              num="05"
              title="Synthesize"
              lead="The surviving set is enriched into tear sheets, fact-checked against the live web, and sized, with a second independence pass on real evidence."
              steps={[
                { call: "Exa Agent", text: <>An emerging pass adds the off-database long tail: <code>agentDiscoverEmerging()</code> (Exa Agent deep research) when enabled, falling back to a freshness-tuned search. New names are deduped and capped.</> },
                { call: "Gemini", text: <><code>synthesizeLandscape()</code> clusters everything into 3-6 segments and writes per-company tear sheets in one pass. Emits <code>segments</code>.</> },
                { call: "Exa", text: <><code>fetchCompanyIntel()</code> pulls facts + a recent signal per company (bounded concurrency of 6).</> },
                { call: "Gemini", text: <><code>extractQuant()</code> is one batched pass that reads founding year, funding, stage, headcount, region, and a parent-owner signal, evidence-only. Any company with a detected parent is dropped here, the second independence layer, before it ever streams. Emits each <code>company</code>.</> },
              ]}
            />
            <Phase
              num="06"
              title="Position & persist"
              lead="A market stat and a strategic thesis turn the set into a recommendation, then the deck is saved as a shareable link."
              steps={[
                { call: "Exa + Gemini", text: <><code>fetchMarketContext()</code> searches the sector (not the company), ranks credible sources first, and extracts one stat whose source URL must match a retrieved page, or omits it. Emits <code>market</code>.</> },
                { call: "Gemini", text: <><code>analyzeOpportunity()</code> writes the <code>DealThesis</code>: recommendation, conviction, why-now, tiered targets, value levers, risks, the ask, and a per-slide takeaway. Emits <code>analysis</code> then <code>summary</code>.</> },
                { call: "Firestore", text: <><code>saveReport()</code> persists the deck with cache keys; Regenerate overwrites the same <code>/r/[id]</code> so share links stay valid. Emits <code>done</code>.</> },
              ]}
            />
          </div>
        </div>

        {/* Two supporting diagrams */}
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
            <Reveal>
              <div className="lift rounded-xl border border-border bg-card p-6">
                <TwoPassArt />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">Two-pass discovery</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
                <code>findSimilar</code> works off the seed domain and is strong on established lookalikes;
                the Exa Agent works off the thesis and reaches recently founded names embeddings have not
                caught up to. They are complementary, and the Agent's hits are deduped against the
                findSimilar set so it only ever adds the long tail.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="lift rounded-xl border border-border bg-card p-6">
                <IndependenceFunnelArt />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">The independence gate, twice</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
                A roll-up target has to be a company you can actually buy. Gate one drops known sub-brands
                up front using model world knowledge; gate two re-checks each company's fetched text for a
                parent or owner and drops any that slipped through, before they reach the deck.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Cross-cutting concerns */}
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>The trust layer</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">What runs across every stage.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CrossCard icon={<Repeat2 className="size-5" strokeWidth={1.8} />} title="Determinism">
              Every Gemini call runs at <code>temperature: 0</code> with a fixed seed, so the same input
              yields the same deck. The only run-to-run drift comes from Exa's live web results, which are
              not cached.
            </CrossCard>
            <CrossCard icon={<ShieldCheck className="size-5" strokeWidth={1.8} />} title="Prompt-injection defense">
              All third-party web text is wrapped in <code>&lt;UNTRUSTED_CONTENT&gt;</code> markers and every
              system prompt carries a guard instructing the model to treat it strictly as data, never as
              instructions.
            </CrossCard>
            <CrossCard icon={<BadgeCheck className="size-5" strokeWidth={1.8} />} title="Honesty by construction">
              No invented revenue, multiples, or market shares. Quant is evidence-only and blank when
              unknown; the market stat is cited or omitted; the fragmentation index is capped so a maxed
              set stays believable; every company links to its live site.
            </CrossCard>
            <CrossCard icon={<LifeBuoy className="size-5" strokeWidth={1.8} />} title="Resilience">
              Exa and Gemini calls retry with exponential backoff, and every stage is best-effort: a failed
              call returns empty and the deck omits that piece rather than erroring. Firestore is optional,
              degrading to a non-shareable deck.
            </CrossCard>
            <CrossCard icon={<Gauge className="size-5" strokeWidth={1.8} />} title="Guardrails">
              Each build fans out to ~15-25 paid calls, so the route is per-IP rate limited and sits behind
              a global hourly/daily budget kill switch (Upstash when configured, in-memory fallback
              otherwise).
            </CrossCard>
            <CrossCard icon={<Zap className="size-5" strokeWidth={1.8} />} title="Concurrency">
              Discovery and the market search overlap with <code>Promise.all</code>; per-company intel and
              enrichment run with bounded concurrency; quant is a single batched pass. The ~90s budget is
              spent in parallel, not in series.
            </CrossCard>
          </div>
        </div>

        {/* Streaming protocol */}
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>The streaming protocol</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">One JSON object per line.</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-foreground/85">
              The client reads the NDJSON body and applies each event as it arrives, so segments, companies,
              the market stat, and the thesis fill in progressively behind the build-progress view.
            </p>
            <div className="mt-7 overflow-hidden rounded-xl border border-border">
              {EVENTS.map((e, i) => (
                <div
                  key={e.name}
                  className={`grid grid-cols-[8rem_minmax(0,1fr)] gap-3 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] ${i % 2 ? "bg-card" : "bg-background"}`}
                >
                  <code className="font-mono text-[13px] font-semibold" style={{ color: AUB }}>{e.name}</code>
                  <span className="text-sm leading-snug text-foreground/80">{e.when}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Stack + back link */}
        <div className="mx-auto max-w-4xl px-5 py-10 pb-16 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>What it runs on</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <StackCard icon={<Globe className="size-5" strokeWidth={1.8} />} name="Exa" spec="exa-js · findSimilar + neural search + Contents + Exa Agent · cited market sources" />
              <StackCard icon={<Sparkles className="size-5" strokeWidth={1.8} />} name="Google Gemini" spec="@google/genai · gemini-3.5-flash · seed 7 · temperature 0 · structured JSON" />
              <StackCard icon={<Triangle className="size-5" strokeWidth={1.8} />} name="Vercel" spec="Functions on Fluid Compute · NDJSON streaming route · rate limit + budget guard" />
              <StackCard icon={<Code2 className="size-5" strokeWidth={1.8} />} name="Next.js · React" spec="16 App Router · React 19 · server-rendered shareable /r/[id]" />
              <StackCard icon={<Database className="size-5" strokeWidth={1.8} />} name="Google Firestore" spec="firebase-admin · saved decks + cache keys for shareable links" />
              <StackCard icon={<LineChart className="size-5" strokeWidth={1.8} />} name="PostHog" spec="posthog-js · product analytics" />
            </div>

            <p className="section-label mt-10 flex items-center gap-2 border-t border-border pt-6 text-muted-foreground">
              <ArrowLeft className="size-4" strokeWidth={2} />
              Back to{" "}
              <Link href="/about" className="underline">How it works</Link>
              {" · "}
              <a href={REPO} target="_blank" rel="noopener noreferrer" className="underline">Source on GitHub</a>
            </p>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
