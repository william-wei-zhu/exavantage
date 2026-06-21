# Exa Vantage

**Find the add-ons the databases never indexed.**

A partner-grade private-equity deal-origination tool, built on [Exa](https://exa.ai) and Google
Gemini. Enter a **platform company** and Exa Vantage returns a **9-slide, KKR-branded slide deck**
that recommends a buy-and-build (roll-up): a sized opportunity, the tiered add-on targets, the
value-creation thesis, the risks, and a concrete ask. Shareable by link, exportable to PDF, and
downloadable as a CSV of the full company universe.

Live at **[exavantage.com](https://exavantage.com)**.

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

## How it works

Resolve the input → discover with Exa `findSimilar` + neural search → a relevance gate drops
name-collisions → an independence gate drops companies already owned by a larger parent (sub-brands
of a major chain aren't acquirable) → an **Exa Agent** deep-research pass (multi-step, distinct from
the single-shot findSimilar) surfaces emerging names and dedupes them against the set so far →
Gemini clusters and
writes tear sheets → per-company Exa search pulls facts (and any that turn out to be owned are
dropped here too) → one batched Gemini pass extracts quant (estimated, blank when unknown) → Exa
pulls a cited market-size stat for the sector → one Gemini pass writes the strategic deal thesis. Results stream behind a build-progress view, save to Firestore, and reveal as a
shareable `/r/[id]` deck.

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
