# Exa Vantage

**Find the add-ons the databases never indexed.**

A partner-grade private-equity deal-origination tool, built on [Exa](https://exa.ai) and Google
Gemini. Enter a **platform company** and Exa Vantage returns a **9-slide, KKR-branded slide deck**
that recommends a buy-and-build (roll-up): a sized opportunity, the tiered add-on targets, the
value-creation thesis, the risks, and a concrete ask. Shareable by link, exportable to PDF.

Live at **[exavantage.com](https://exavantage.com)**.

## One desk, done well

A single **KKR Private Equity** desk focused on **buy-and-build add-on sourcing**. You give it a
platform company; `findSimilar` plus a relevance gate surface the proprietary, often founder-owned
long tail that PitchBook and Sourcescrub miss, and a strategic-analysis pass turns that set into a
recommendation a partner can act on.

## The 9 slides

Each slide leads with an action-title conclusion (the takeaway), MBB/PE style:

1. **Recommendation** — the verdict, conviction, three proof stats, and the ask.
2. **Why Now** — a cited market-size stat (with source + confidence) and the catalysts.
3. **The Fragmentation Thesis** — evidence the market is consolidatable.
4. **Where to Win** — sub-segments ranked, the beachhead named.
5. **The Anchor** — the platform candidate to build around.
6. **Priority Targets** — Tier 1 / 2 / Watch, each with a why-call, an angle, and grounded evidence.
7. **Value Creation** — the levers, specific to this platform (multiple arbitrage, cross-sell, ...).
8. **The Exa Edge** — off-database finds (price) and readiness signals (timing).
9. **The Play** — first calls, sequencing, risks, and the ask.

## How it works

Resolve the input → discover with Exa `findSimilar` + neural search → a relevance gate drops
name-collisions → an Exa Agent pass surfaces emerging names → Gemini clusters and writes tear sheets
→ per-company Exa search pulls facts → one batched Gemini pass extracts quant (estimated, blank when
unknown) → Exa pulls a cited market-size stat for the sector → one Gemini pass writes the strategic
deal thesis. Results stream behind a build-progress view, save to Firestore, and reveal as a
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
