# Exa Vantage

AI market-intelligence for financial-services teams, as a firm-branded **slide
deck**. Pick one of three desks, type a company or an industry/thesis, and get a
tailored deck (cover → market map → lens-specific highlight → quant → signals →
synthesis), shareable by link and exportable to PDF. Live at **exavantage.com**.
Powered by Exa + Gemini.

UI/UX follows William's Web App Building Standard
(https://github.com/william-wei-zhu/web-app-building-standard) with one sanctioned
deviation: **the frontend clones the Exa brand** (real Exa logo/header, fonts,
palette from williamzhu.ai/exa-growth) so it reads as "made by Exa". See the
standard's "Cloning a target brand" clause.

## Three desks, one engine, three lenses

One shared discovery engine; the selected firm sets a **lens** that reframes every
slide and the quant.

| Desk | Firm | Lens (`lib/firms.ts` `lens`) | Tailored to |
|---|---|---|---|
| Investment Bank | Goldman Sachs (navy, Source Serif) | `ipo` | IPO candidates & comparables (ECM) |
| Private Equity | Blackstone (black, Playfair) | `buyout` | Acquisition targets & buy-and-build |
| Venture Capital | a16z (burgundy, Space Grotesk) | `landscape` | Competitive landscape & emerging |

Lens framing (titles, cover, highlight, examples, Exa-edge copy) lives in
`lib/lenses.ts`. Firm brand tokens (palette, fonts, logo) in `lib/firms.ts`. Goldman
uses its real SVG logo (`public/logos/goldman-sachs.svg`); Blackstone + a16z render
as faithful brand wordmarks (`components/report/firm-logo.tsx`).

## Pipeline (`lib/pipeline.ts`)

Monolithic Next.js 16 on Vercel; "backend" = route handlers, Google Cloud provides
Gemini + Firestore.

```
resolve+route (Gemini) → discover (findSimilar + semantic search) → relevance gate
  (Gemini, drops name-collisions) → emerging pass (Exa Agent, flagged) →
  cluster + tear sheets (Gemini) → per-company intel (Exa text+highlights search) →
  quant extraction (one batched Gemini pass, evidence-only) → exec summary (Gemini)
  → stream NDJSON → save to Firestore → branded slide deck → PDF
```

Key files:
- `lib/exa.ts` — `discoverSimilarCompanies`, `searchCompanies`, `searchEmerging`,
  `resolveCompanyDomain`, `agentDiscoverEmerging` (Exa Agent), `fetchCompanyIntel`
  (text+highlights → facts for quant + a recent signal), `fetchSiteContent`.
- `lib/gemini.ts` — `gemini-3.1-flash-lite`, seed 7, structured JSON; `UNTRUSTED_GUARD`
  prompt-injection defense.
- `lib/pipeline.ts` — `streamReport(query, emit, {firmId})`: relevance gate
  (`filterRelevant`), clustering (`synthesizeLandscape`), batched quant (`extractQuant`).
- `lib/metrics.ts` — derived analytics over `Company[]`: stage mix, segment sizes,
  recency, emerging/Exa-edge count, and the per-lens index (IPO readiness /
  fragmentation / momentum). Pure, no fabrication.
- `lib/store.ts` + `lib/firestore.ts` — persist/load reports for shareable `/r/[id]`.

## Quant (honesty)

Per-company `foundedYear / funding / stage / employees / region` are **estimated
from public web** (Exa text → batched Gemini extraction), blank when not evident —
never invented. The quant slide labels coverage ("N/M with funding data"). No
revenue/valuation/multiples. Derived analytics + the lens index always populate.

## Deck (`components/deck/Deck.tsx`, `components/report/`)

`Deck` is a carousel (prev/next, dots, counter, keyboard; print = one slide per
page). `report-deck.tsx` builds the `Slide[]` from the lens + report and renders it
(used by the live stream and `/r/[id]`). Slides in `components/report/slides/*`
read `firm.theme` so each deck is on-brand. Homepage desk cards in
`components/report/desk-cards.tsx`.

## Persistence + sharing

Firestore (Native) in the `exavantage` GCP project, via a service-account key
(`GCP_SERVICE_ACCOUNT_KEY` + `GCP_PROJECT_ID`). Reports are saved server-side at the
end of the stream; `/r/[id]` renders the saved deck. Stateless otherwise.

## Environment

Secrets in gitignored `.env.local` (+ Vercel). `.env.example` lists keys. Required:
`EXA_API_KEY`, `GEMINI_API_KEY`. Firestore: `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`.
Analytics: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`. Cost control:
`UPSTASH_REDIS_REST_URL/TOKEN`, `DAILY_REPORT_BUDGET`. Exa Agent: `EXA_AGENT_EMERGING`.

## Conventions

- Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` before
  editing route/config code.
- No em-dashes in copy. Real firm names are an intentional, approved exception to
  the "no company names" rule (they are the product).
- Footer is intentionally minimal ("Built by William Zhu · Powered by Exa").
- Commit and push every change; keep this file and docs in sync.
