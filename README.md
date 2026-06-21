# Exa Vantage

**Find the add-ons the databases never indexed.**

A partner-grade private-equity deal-origination tool, built on [Exa](https://exa.ai) and Google
Gemini. Enter a **platform company** and Exa Vantage returns a **9-slide, KKR-branded slide deck**
that recommends a buy-and-build (roll-up): a sized opportunity, the tiered add-on targets, the
value-creation thesis, the risks, and a concrete ask. Shareable by link, exportable to PDF, and
downloadable as a CSV of the full company universe.

Live at **[exavantage.com](https://exavantage.com)**. ▶ **[60-second demo](https://youtu.be/ogUN0-XxAlI)** ·
**[Architecture deep dive](https://exavantage.com/architecture)**.

## One desk, done well

A single **KKR Private Equity** desk focused on **buy-and-build add-on sourcing**. You give it a
platform company; Exa surfaces the proprietary, often founder-owned long tail that PitchBook and
Sourcescrub miss (two complementary discovery calls, below), a relevance gate keeps the genuine
matches, and a strategic-analysis pass turns that set into a recommendation a partner can act on.

## Two-pass discovery (Exa)

Targets come from two Exa calls that, by design, cover each other's blind spots:

- **`findSimilar`** (always on) takes the platform company's **domain** and returns established
  lookalikes by meaning. This is the backbone of the universe.
- **Exa Agent** (`agent.runs.create`, gated by `EXA_AGENT_EMERGING`, on in production) takes the
  restated **thesis** and runs **multi-step research** to surface recently founded, under-the-radar
  names that no database lists yet. Its hits are deduped against the findSimilar set and capped, so
  the Agent only ever adds the off-database long tail. On any miss it falls back to a fast,
  freshness-tuned `search`.

They are complementary, not substitutes: findSimilar is strong on the near field around the seed; the
Agent reaches the fresh, low-profile names embeddings haven't caught up to yet.

## The 9 slides

Each slide leads with an action-title conclusion (the takeaway), MBB/PE style:

1. **Recommendation**: the verdict, conviction, three proof stats, and the ask.
2. **Why Now**: a cited market-size stat (with source + confidence) and the catalysts.
3. **The Fragmentation Thesis**: evidence the market is consolidatable.
4. **Where to Win**: sub-segments ranked, the beachhead named.
5. **The Anchor**: the platform candidate to build around.
6. **Priority Targets**: Tier 1 / 2 / Watch, each with a why-call, an angle, and grounded evidence.
7. **Value Creation**: the levers, specific to this platform (multiple arbitrage, cross-sell, ...).
8. **The Exa Edge**: off-database finds (price) and readiness signals (timing).
9. **The Play**: first calls, sequencing, risks, and the ask.

Plus a **Full Universe** appendix: the entire discovered company set in a paginated table, so the
deck's page count scales with the universe.

## Backend architecture (step by step)

One streaming request handler (`app/api/report/stream/route.ts` → `streamReport` in
`lib/pipeline.ts`) drives the whole pipeline and emits NDJSON as it goes:

1. **Ingest.** `GET /api/report/stream` validates the query, enforces a per-IP rate limit (4/min,
   40/day, fail-closed) and a global budget kill switch, then opens an NDJSON stream.
2. **Route + junk-name filter.** A Gemini pass classifies company vs sector and resolves the official
   name + domain (Exa search fallback). The *same* pass also judges whether the input is a real
   research subject at all: a clearly non-company input (a personal name, a public figure, gibberish)
   is rejected here, before any cache or Exa work, so junk stops in ~1s with an `invalid` event
   instead of burning a full build. The filter is high-precision: it accepts any plausible brand,
   even unrecognized or chef-named ones (e.g. "J Crew", "Peter Chang"), and any coherent sector,
   rejecting only the obvious nonsense. A Firestore cache lookup then short-circuits known good
   inputs. Emits `meta` (or `invalid`).
3. **Discover (two-pass).** `findSimilar` off the seed domain and a semantic `search` run in parallel
   and are merged + deduped (see Two-pass discovery above). The market-size search starts here too, to
   overlap its latency.
4. **Gate.** A relevance gate drops name-collisions; an independence gate (layer 1) drops parent-owned
   sub-brands and the anchor's own subsidiaries. Both fall back to keeping the set if they would
   over-filter.
5. **Emerging.** The Exa Agent (or a freshness-tuned search) adds the off-database long tail, deduped
   and capped.
6. **Cluster.** One Gemini pass clusters the set into 3-6 segments and writes per-company tear sheets,
   evidence-only. Emits `segments`.
7. **Enrich.** Per-company Exa search pulls facts + a recent signal (bounded concurrency); one batched
   Gemini pass extracts quant and a parent-owner signal. Companies with a detected parent are dropped
   here (independence layer 2) before streaming. Emits each `company`.
8. **Position.** Exa + Gemini extract one cited market stat (sector-scoped, source URL must match a
   retrieved page, or omitted); one Gemini pass writes the `DealThesis`. Emits `market`, `analysis`,
   `summary`.
9. **Persist.** Saved to Firestore with cache keys (Regenerate overwrites the same `/r/[id]`). Emits
   `done`. The deck reveals from the saved `/r/[id]`.

Full walkthrough with diagrams: **[exavantage.com/architecture](https://exavantage.com/architecture)**.

### Streaming protocol

NDJSON, one JSON object per line. Event types in emit order: `meta`, `cached`, `segments`, `company`
(one each), `emerging`, `market`, `analysis`, `summary`, `done`, plus `invalid` (junk-name filter
rejected the input, then end) and `progress` / `error` throughout. The client
(`lib/use-report-stream.ts`) applies each event as it arrives, so the deck assembles live behind a
build-progress view; `invalid` instead shows an elegant nudge that keeps the search box and example
chips.

### Determinism & honesty

Every Gemini call runs at `temperature: 0` with a fixed seed, so the same input yields the same deck;
only Exa's live web results vary. All web text is wrapped in `<UNTRUSTED_CONTENT>` with a
prompt-injection guard. No invented financials: quant is evidence-only and blank when unknown, the
market stat is cited or omitted, the fragmentation index is capped, and every company links to its
live site.

### Guardrails

Each build fans out to ~15-25 paid calls, so the route is per-IP rate limited (`lib/ratelimit.ts`) and
sits behind a global hourly/daily budget kill switch (`lib/budget.ts`): Upstash when configured, an
in-memory fallback otherwise.

### Persistence & caching

`lib/store.ts` + `lib/firestore.ts` save each report under cache keys (normalized name + domain) so
repeat inputs return instantly. Firestore is optional and degrades to a non-shareable deck when
unconfigured.

## Stack

Next.js 16 (App Router) · Tailwind v4 · TypeScript · Exa (`exa-js`, incl. Exa Agent) · Gemini 3.5
Flash (`@google/genai`) · Firestore · PostHog · Vercel.

## Local development

```bash
cp .env.example .env.local   # fill in EXA_API_KEY and GEMINI_API_KEY (+ GCP_* for sharing)
npm install
npm run dev                  # http://localhost:3000
```

Required: `EXA_API_KEY`, `GEMINI_API_KEY`. Firestore (shareable links) needs `GCP_PROJECT_ID` +
`GCP_SERVICE_ACCOUNT_KEY`. See `.env.example` for the rest.

## Disclaimer

Informational only, not investment advice. Quantitative figures are estimates from public web
sources and may be incomplete; the cited market stat is attributed to its source. KKR is used to
illustrate a branded deliverable; Exa Vantage is an independent demonstration, not affiliated with or
endorsed by it.

Built by [William Zhu](https://www.linkedin.com/in/william-wei-zhu/).
