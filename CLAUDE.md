# Exa Vantage

A partner-grade PE deal-origination deck, generated from one input. Enter a **platform
company**; Exa Vantage returns a **9-slide KKR-branded slide deck** that recommends a buy-and-build
(roll-up): the add-on universe, tiered targets, value-creation, risks, and a concrete ask. Shareable
by link, exportable to PDF. Live at **exavantage.com**. Powered by Exa + Gemini.

UI/UX follows William's Web App Building Standard
(https://github.com/william-wei-zhu/web-app-building-standard) with one sanctioned deviation: **the
app shell clones the Exa brand** (real Exa logo/header/footer) while the **deck clones KKR's own
deck** (aubergine `#53284F`, teal accents, ribbon motif, KKR logo). See the standard's "Cloning a
target brand" clause. No left-border accent-bar callouts (user preference); takeaways are slide
headlines, not boxes.

## One desk: KKR, Private Equity, buy-and-build

Single firm/lens (`lib/firms.ts` = one KKR entry, lens `buyout`; `lib/lenses.ts` = one `buyout`
lens). **Company-only input with a soft guard**: always company-mode discovery; if no company
resolves, it nudges and still returns a best-effort set (never errors). KKR brand tokens in
`lib/firms.ts`; the official logo is `public/logos/kkr.svg`.

## Pipeline (`lib/pipeline.ts`)

Monolithic Next.js 16 on Vercel; "backend" = route handlers; Google Cloud provides Gemini + Firestore.

```
route (Gemini) → discover (findSimilar + semantic search) → relevance gate (Gemini, drops
  name-collisions) → emerging pass (Exa Agent, flagged) → cluster + tear sheets (Gemini) →
  per-company intel (Exa text+highlights) → quant extraction (batched Gemini, evidence-only) →
  market context (Exa, cited, SECTOR not company) + deal thesis (Gemini) → stream NDJSON →
  save to Firestore → 9-slide deck → PDF
```

Key files:
- `lib/exa.ts` — discovery (`discoverSimilarCompanies`, `searchCompanies`, `searchEmerging`,
  `agentDiscoverEmerging`), `fetchCompanyIntel`, `fetchSiteContent`, and `searchMarketSize`
  (market pages, ranked credible-source-first via `CREDIBLE_MARKET_SOURCES`, tagged a tier).
- `lib/gemini.ts` — **`gemini-3.5-flash`** (chosen over flash-lite for analysis quality), seed 7,
  structured JSON; `UNTRUSTED_GUARD` prompt-injection defense.
- `lib/pipeline.ts` — `streamReport(query, emit, {firmId})`. The two passes that drive the deck:
  `fetchMarketContext(sectorHint, excludeCompany)` (one cited market stat, evidence-only, searches
  the SECTOR and ignores the anchor's own revenue) and `analyzeOpportunity(...)` →
  `DealThesis` (the strategic layer). Also `filterRelevant`, `synthesizeLandscape`, `extractQuant`.
- `lib/metrics.ts` — derived analytics over `Company[]`: `lensIndex` (Fragmentation Index),
  `opportunitySize` (the buildable prize), `ownershipSignal`, `visibleColumns` (hide sparse
  comps columns), stage mix, exa-edge count. Pure, no fabrication.
- `lib/store.ts` + `lib/firestore.ts` — persist/load reports for shareable `/r/[id]`.

## The deal thesis (`DealThesis` in `lib/types.ts`)

One Gemini pass turns the discovered set into a partner-grade recommendation, persisted on the
`Report`. Fields: `recommendation` (one tight sentence + the wedge), `conviction`, `whyNow`,
`fragmentation`, `segmentReads` (ranked) + `beachhead`, `anchor` (realistic role), `targets`
(tiered, grounded `angle`), `valueLevers` (specific to the platform), `edge`, `risks`, `firstCalls`,
`sequencing`, `ask`, and per-slide `takeaways` (the action-title headlines). `MarketContext` carries
the cited `stat` + `sourceUrl` + `confidence` ("research firm" | "secondary").

## The 9 slides (`components/report/slides/*`, `report-deck.tsx`)

Insight-first, each leading with an **action-title headline** (the takeaway) and a small category
kicker via `slide-frame.tsx`. Order: 1 Recommendation (`cover`) · 2 Why Now (`why-now-slide`) ·
3 Fragmentation Thesis (`highlight-slide`) · 4 Where to Win (`map-slide`) · 5 The Anchor
(`anchor-slide`) · 6 Priority Targets (`quant-slide`, tiered + evidence lines) · 7 Value Creation
(`value-slide`) · 8 The Exa Edge (`signals-slide`) · 9 The Play (`synthesis-slide`, first calls +
risks + ask). Primitives in `bits.tsx` (`StatBox`, `HeaderBand`, `Checklist`, `CompsTable`,
`Ribbon`, `ConvictionBadge`, `TierBadge`, `SourceChip`, `ConfidenceChip`, `evidenceLine`). `Deck`
is a carousel (prev/next, dots, keyboard; print = one slide per page).

## Loading + sharing

The deck is **gated behind a build state** (`building-deck.tsx`): while the ~90s pipeline runs,
`report-experience.tsx` shows progress (phase + bar + teasers), then reveals the full deck on `done`
with a "Deck ready" cue. Reports save server-side at stream end; `/r/[id]` renders the saved deck.

## Honesty

No invented revenue, valuations, multiples, growth rates, or market shares. The market stat is
Exa-cited with a confidence label (or omitted); per-company quant is estimated-from-web and labeled,
blank when unknown; `ownershipSignal` and the indices are derived and labeled illustrative; the
recommendation is framed as analyst judgment.

## Marketing chrome (co-branded "Exa Vantage, for KKR")

Clean white Exa shell, co-branded for KKR. `components/exa-header.tsx` = enlarged Exa Vantage lockup
(`exa-logo.tsx`) + a "for KKR" co-brand (the `public/logos/kkr.svg`) + a single "How it works" link
(no Pricing/Docs/About-Exa). Homepage hero (`app/page.tsx`): "Exa Vantage · built for KKR" eyebrow,
the **"Your vantage on every deal."** tagline, a plain-English subhead; `report-experience.tsx` has a
3-up icon value band. **`app/about/page.tsx` is a visual "acts" walk-through** (modeled on pbcindex's
`/docs`): scroll-revealed (`components/reveal.tsx` + the `.reveal/.draw/.fade-art/.sweep/.press/
.pipe-line` motion in `globals.css`), hand-drawn animated SVG line-art in aubergine/teal
(`components/docs-art.tsx`), explaining the PE roll-up job in plain English + precise tech names
("findSimilar for acquisition targets"). Reduced-motion shows everything statically.

## Environment

Secrets in gitignored `.env.local` (+ Vercel). `.env.example` lists keys. Required: `EXA_API_KEY`,
`GEMINI_API_KEY`. Firestore: `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`. Analytics:
`NEXT_PUBLIC_POSTHOG_KEY/HOST`. Cost control: `UPSTASH_REDIS_REST_URL/TOKEN`, `DAILY_REPORT_BUDGET`.
Exa Agent: `EXA_AGENT_EMERGING`.

## Conventions

- Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` before editing route/config.
- No em-dashes in copy. KKR is the intentional, approved exception to the "no company names" rule.
- Never use left-border accent-bar callout boxes (user preference).
- Footer is intentionally minimal ("Built by William Zhu · Powered by Exa").
- Commit and push every change; keep this file and docs in sync.
