# Exa Vantage

AI market-intelligence reports for financial-services analysts. Pick a firm, type
a company name or a sector thesis, get a branded research report (market map +
company tear sheets + emerging/under-the-radar + executive summary), exportable
to PDF. Live at **exavantage.com**. Powered by Exa + Gemini.

UI/UX and build conventions follow William's Web App Building Standard:
https://github.com/william-wei-zhu/web-app-building-standard — with one explicit,
sanctioned deviation: **the frontend deliberately clones the Exa brand** (real Exa
logo, header, footer, fonts, colors from williamzhu.ai/exa-growth) so it reads as
"made by Exa." Brand fidelity to Exa overrides the standard's own visual
conventions (logo rules, non-sticky header, attribution placement). See the
standard's "Cloning a target brand" clause.

## Architecture

Monolithic Next.js 16 (App Router) on Vercel. "Backend" = Vercel serverless
route handlers; Google Cloud's role is the Gemini model. Stateless — every report
is generated fresh (no DB); per-IP rate limiting + a daily budget kill switch
protect API spend.

### The pipeline (`lib/pipeline.ts`)

One unified flow, two entry points (the only fork is the seed):

```
seed: company name -> route+resolve domain (Gemini) -> exa.findSimilar
      sector thesis -> exa.search (semantic)
  -> discover the company set
  -> emerging pass (under-the-radar names)
  -> cluster + write tear sheets (one holistic Gemini structured-JSON call)
  -> enrich each with a recent signal (Exa, bounded concurrency, streamed)
  -> executive summary (Gemini)  [web: last · PDF: first]
  -> stream as NDJSON -> branded web report -> PDF export
```

### Key files

- `lib/exa.ts` — Exa calls: `discoverSimilarCompanies` (findSimilar), `searchCompanies`,
  `searchEmerging`, `fetchSiteContent`, `fetchRecentSignal`, `resolveCompanyDomain`,
  and `agentDiscoverEmerging` (Exa Agent).
- `lib/gemini.ts` — `gemini-3.1-flash-lite`, seed 7, structured JSON + text. Carries
  the `UNTRUSTED_GUARD` prompt-injection defense (fetched web text is hostile-by-default).
- `lib/pipeline.ts` — `streamReport(query, emit)`: routing, discovery, clustering,
  enrichment, synthesis, all emitted as `StreamEvent`s.
- `lib/firms.ts` — the 6 client firms (Goldman Sachs, J.P. Morgan Chase, KKR,
  BlackRock, Benchmark, a16z) with accent/surface theming. Logos are styled
  wordmarks (no trademarked image assets bundled).
- `app/api/report/stream/route.ts` — NDJSON streaming route (nodejs, maxDuration 120),
  rate-limited + budget-gated.
- `lib/use-report-stream.ts` — client hook that consumes the NDJSON stream.
- `components/report/*` — branded report UI (market map, tear sheets, emerging,
  executive summary, firm picker). Exa chrome: `components/exa-header.tsx`,
  `exa-footer.tsx`, `exa-logo.tsx` (ported from williamzhu.ai/exa-growth).

### Exa Agent (hybrid, flagged)

The emerging/under-the-radar discovery can run through **Exa Agent** deep research
(`exa.agent.runs.create`, effort `low`, structured output) instead of the freshness
search. Gated by `EXA_AGENT_EMERGING` (off by default; falls back to search on any
miss). The streaming search path stays the demo-safe spine. Verified end-to-end at
~17s with the flag on.

## Environment

Secrets live in gitignored `.env.local` (and Vercel project env). `.env.example`
lists the keys. Required: `EXA_API_KEY`, `GEMINI_API_KEY`. Analytics:
`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`. Optional cost control:
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `DAILY_REPORT_BUDGET`.
Optional: `EXA_AGENT_EMERGING`.

## Conventions

- Next.js 16 has breaking changes vs. older versions — check `node_modules/next/dist/docs/`
  before editing route/config code.
- No em-dashes in copy. The named firms are an intentional, approved exception to
  the "no company names" rule (they are the product feature).
- Commit and push every change; keep this file and docs in sync with the code.
