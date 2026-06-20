# Exa Vantage

A partner-grade PE deal-origination deck, generated from one input. Enter a **platform
company**; Exa Vantage returns a **fixed-frame KKR-branded slide deck** that recommends a buy-and-build
(roll-up): the add-on universe, tiered targets, value-creation, risks, and a concrete ask. Shareable
by link, exportable to PDF, and downloadable as a CSV of the full company universe. The deck can be
regenerated from scratch in place (overwrites the same `/r/[id]`). Live at **exavantage.com**.
Powered by Exa + Gemini.

UI/UX follows the project's Web App Building Standard
(https://github.com/william-wei-zhu/web-app-building-standard) with one sanctioned deviation: **the
app shell clones the Exa brand** (real Exa logo/header/footer) while the **deck clones KKR's own
deck** (aubergine `#53284F`, teal accents, ribbon motif, KKR logo). See the standard's "Cloning a
target brand" clause. No left-border accent-bar callouts; takeaways are slide
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
  name-collisions) → independence gate (Gemini, drops already-owned sub-brands) → emerging pass
  (Exa Agent, flagged) → cluster + tear sheets (Gemini) → per-company intel (Exa text+highlights) →
  quant extraction (batched Gemini, evidence-only, also reads parent-owner → drops owned) →
  market context (Exa, cited, SECTOR not company) + deal thesis (Gemini) → stream NDJSON →
  save to Firestore → fixed-frame KKR deck (16:9) → PDF
```

Key files:
- `lib/exa.ts` — discovery (`discoverSimilarCompanies`, `searchCompanies`, `searchEmerging`,
  `agentDiscoverEmerging`), `fetchCompanyIntel`, `fetchSiteContent`, and `searchMarketSize`
  (market pages, ranked credible-source-first via `CREDIBLE_MARKET_SOURCES`, tagged a tier).
- `lib/gemini.ts` — **`gemini-3.5-flash`** (chosen over flash-lite for analysis quality), seed 7,
  structured JSON; `UNTRUSTED_GUARD` prompt-injection defense. **All Gemini calls run at
  `temperature: 0`** (greedy decoding) so the same input yields the same deck run to run; the
  `generateJSON` default is 0 and the two writing passes (`synthesizeLandscape`, deal thesis) were
  dropped from 0.3/0.4 to 0. Residual run-to-run drift comes from **Exa's live web results**, not the
  model (Exa is not seeded/cached).
- `lib/pipeline.ts` — `streamReport(query, emit, {firmId})`. The two passes that drive the deck:
  `fetchMarketContext(sectorHint, excludeCompany)` (one cited market stat, evidence-only, searches
  the SECTOR and ignores the anchor's own revenue) and `analyzeOpportunity(...)` →
  `DealThesis` (the strategic layer). Also `filterRelevant`, `filterIndependent`,
  `synthesizeLandscape`, `extractQuant`.
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

## The slides (`components/report/slides/*`, `report-deck.tsx`)

Insight-first, each leading with an **action-title headline** (the takeaway) and a small category
kicker via `slide-frame.tsx`. Order: 1 Recommendation (`cover`, anchor logo) · 2 Why Now
(`why-now-slide`) · 3 The Fragmentation Thesis (`highlight-slide`, argument + index gauge + stage-mix
chart, no duplicate stats) · 4 Where to Win (`map-slide`) · 5 The Anchor (`anchor-slide`, logo hero) ·
6 Priority Targets (`quant-slide`, Tier-1 "call now" cards) · then **The Full Screen** appendix
table slide(s) (`AppendixSlide`, the full universe paginated ~11 rows/page) · Value Creation
(`value-slide`) · **The Exa Vantage** (`signals-slide`, off-database sourcing → lower multiples) ·
The Play (`synthesis-slide`, first calls with logos + risks + ask). Page count is **dynamic**
(appendix pages vary) and page numbers derive from the final slide array in `report-deck.tsx`.

Every slide is a **fixed 16:9 canvas** (`SLIDE_FRAME_CLASS` in `bits.tsx`): identical width/height,
`overflow-hidden` (so content is curated/clamped to fit, not allowed to grow), and a strong aubergine
ring. Print uses `@page { size: 1040px 585px landscape; margin: 0 }` (`globals.css`) so each slide is
one identical full-bleed page. Real company logos use `CompanyLogo` (hi-res Google favicon tile);
dense lists use `Favicon`. Other primitives in `bits.tsx` (`StatBox`, `HeaderBand`, `Checklist`,
`CompsTable`, `Ribbon`, `ConvictionBadge`, `TierBadge`, `SourceChip`, `ConfidenceChip`,
`evidenceLine`). `Deck` is a carousel (prev/next, dots, keyboard; print = one slide per page).

**In-slide card + box styling conventions:** segment/lever cards (`map-slide`, `value-slide`) use a
clean **thin full-border card** (`rounded-xl border` at `${ink}14` on `paper`); color-coding is a small
dot or numbered circle, **not** a colored top bar (the old `h-1.5` top-bar "top-bolded" style was
retired as unrefined). The beachhead segment gets an aubergine ring instead of a bar. "Takeaway" call-out
boxes (the cover's **The ask**, `signals-slide`'s **Why it matters**, `synthesis-slide`'s **The ask**)
share **one light style**: `rounded-md` on `surface` with a `text-[10px]` uppercase **primary** kicker
over a semibold ink body (no dark-aubergine filled boxes, which clipped at the frame edge). Because the
frame is `overflow-hidden`, content-dense slides must budget vertical space: `signals-slide` drops the
`intro` so its takeaway box fits. The deck action row (`report-deck.tsx`) is four **light color-tint**
buttons (border-transparent fill + dark matching text): Regenerate blue (`#DBEAFE`), Copy share link
yellow (`#FEF9C3`), Export PDF red (`#FEE2E2`), Download CSV green (`#DCFCE7`). `synthesis-slide` no
longer renders the **Sequencing** line (redundant; the field stays in the data model). Homepage CTA
reads **"Generate report"**.

## Loading + sharing

The deck is **gated behind a build state** (`building-deck.tsx`): while the ~90s pipeline runs,
`report-experience.tsx` shows progress (phase + bar + teasers), then reveals the full deck on `done`
with a "Deck ready" cue. Reports save server-side at stream end; `/r/[id]` renders the saved deck.

## Honesty

No invented revenue, valuations, multiples, growth rates, or market shares. The market stat is
Exa-cited with a confidence label (or omitted); per-company quant is estimated-from-web and labeled,
blank when unknown; `ownershipSignal` and the indices are derived and labeled illustrative; the
recommendation is framed as analyst judgment.

**No saturated/too-clean optics.** `lensIndex` (`lib/metrics.ts`) is weighted/capped at **94** so a
maxed set lands high-but-believable, never a flat 100. On the Fragmentation slide
(`highlight-slide.tsx`) the two proof stats are honest **counts** ("11 of 13"), not percentages that
read 100% off sparse data; "Founder-owned" uses the stricter `ownershipSignal(c) === "Founder-owned"`
(needs no funding AND age ≥ 8), with a coverage caption. **Per-company verifiability:** every company
name links to its live site (`urlForDomain`, small `ArrowUpRight` ↗) on the Priority Targets cards,
the Appendix `CompsTable`, and the off-database `signals-slide` cards, so a partner can click through
and confirm each target is real.

**Independence gate (two layers, both in `lib/pipeline.ts`):** a roll-up target must be a company
you can actually buy, so candidates already owned by a larger parent are dropped before they reach
the deck. (1) `filterIndependent` runs right after the relevance gate and uses Gemini world
knowledge to drop sub-brands of major chains and the anchor's own subsidiaries (e.g. Comfort Inn →
Choice Hotels). (2) `extractQuant` additionally reads a `parentCompany` signal from the per-company
Exa text (`fetchCompanyIntel`'s query asks for parent/owner); any company with a detected parent is
dropped during enrichment (never streamed) and its now-empty segment is pruned. Both layers are
conservative and fall back to keeping candidates on any error, so the run never breaks. `parentCompany`
is transient (not persisted on `Company`).

## Marketing chrome (co-branded "Exa Vantage, for KKR")

Clean white Exa shell, co-branded for KKR. `components/exa-header.tsx` = enlarged Exa Vantage lockup
(`exa-logo.tsx`) + a "for KKR" co-brand (the `public/logos/kkr.svg`) + a **Home** link and a "How it
works" link (no Pricing/Docs/About-Exa). The Home link is a plain `<a href="/">` (full reload, not a
Next `<Link>`) so it resets the inline report view: after an inline generation the route stays "/"
while the URL shows "/r/[id]", and a same-route client nav wouldn't clear the deck. Homepage hero (`app/page.tsx`): "Exa Vantage · built for KKR" eyebrow,
the **"Your vantage on every deal."** tagline, a plain-English subhead; `report-experience.tsx` has a
3-up icon value band. The tagline is set in **Hanken Grotesk** (KKR's corporate-type stand-in, the
`--font-hanken` already loaded in `layout.tsx`), sized to sit on **one row**, with the words rising
out of the baseline in a one-shot staggered reveal and an **aubergine `#53284F`** rule drawing in
under the sentence; "deal." is the aubergine accent word. The headline is `display:inline-flex;
width:fit-content` so the rule **stops right after "deal."** instead of spanning the page. All the
motion (`.hero-tagline`/`.hero-w`/`.hero-rule` + `hero-rise`/`hero-rule` keyframes in `globals.css`)
plays once and is static under `prefers-reduced-motion`. **`app/about/page.tsx` is a visual "acts" walk-through** (modeled on pbcindex's
`/docs`): scroll-revealed (`components/reveal.tsx` + the `.reveal/.draw/.fade-art/.sweep/.press/
.pipe-line` motion in `globals.css`), hand-drawn animated SVG line-art in aubergine/teal
(`components/docs-art.tsx`), explaining the PE roll-up job in plain English + precise tech names
("findSimilar for acquisition targets"). Reduced-motion shows everything statically.

## Environment

Secrets in gitignored `.env.local` (+ Vercel). `.env.example` lists keys. Required: `EXA_API_KEY`,
`GEMINI_API_KEY`. Firestore: `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`. Analytics:
`NEXT_PUBLIC_POSTHOG_KEY/HOST`. Cost control: `UPSTASH_REDIS_REST_URL/TOKEN`,
`HOURLY_REPORT_BUDGET` (default 50), `DAILY_REPORT_BUDGET` (default 500). The hourly/daily caps are
global kill switches enforced only when Upstash is configured (`lib/budget.ts`); per-IP rate limits
(`lib/ratelimit.ts`) fall back to a best-effort in-memory limiter without it.
Exa Agent: `EXA_AGENT_EMERGING`.

## Conventions

- Next.js 16 has breaking changes; check `node_modules/next/dist/docs/` before editing route/config.
- No em-dashes in copy. KKR is the intentional exception to the otherwise no-company-names rule.
- No left-border accent-bar callout boxes; they read as unrefined in this layout.
- Footer is intentionally minimal ("Built by William Zhu · Powered by Exa").
- Keep this file and the docs in sync with code changes.
