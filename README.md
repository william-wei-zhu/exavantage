# Exa Vantage

**Your vantage point on every market.**

An AI research analyst for financial-services teams, built on [Exa](https://exa.ai)
and Google Gemini. Pick one of three desks, type a company or an industry/thesis,
and get a tailored, firm-branded research **slide deck** you could walk into a
partner meeting with, shareable by link and exportable to PDF.

Live at **[exavantage.com](https://exavantage.com)**.

## Three desks, one engine

One shared Exa discovery engine, three tailored lenses:

- **Goldman Sachs (Investment Bank)** — IPO candidates & comparables.
- **Blackstone (Private Equity)** — acquisition targets & buy-and-build.
- **a16z (Venture Capital)** — competitive landscape & emerging companies.

Each desk produces a six-slide deck (cover → market map → a lens-specific highlight
→ quant → recent signals → synthesis) in that firm's brand.

## How it works

Resolve the input → discover the company set with Exa `findSimilar` (company) or
neural `search` (industry) → a relevance gate drops name-collisions → an Exa Agent
pass surfaces emerging names → Gemini clusters and writes the tear sheets → a
per-company Exa search pulls facts, and one batched Gemini pass extracts quant
(funding, founded, stage, headcount, HQ; estimated from public web, blank when
unknown) → Gemini writes the synthesis. Results stream in, save to Firestore, and
get a shareable `/r/[id]` page.

## Stack

Next.js 16 (App Router) · Tailwind v4 · TypeScript · Exa (`exa-js`, incl. Exa Agent)
· Gemini 3.1 Flash Lite (`@google/genai`) · Firestore · PostHog · Vercel.

## Local development

```bash
cp .env.example .env.local   # fill in EXA_API_KEY and GEMINI_API_KEY (+ GCP_* for sharing)
npm install
npm run dev                  # http://localhost:3000
```

Required: `EXA_API_KEY`, `GEMINI_API_KEY`. Firestore (shareable links) needs
`GCP_PROJECT_ID` + `GCP_SERVICE_ACCOUNT_KEY`. See `.env.example` for the rest.

## Disclaimer

Informational only, not investment advice. Quantitative figures are estimates from
public web sources and may be incomplete. The named firms illustrate a branded
deliverable; Exa Vantage is an independent demonstration, not affiliated with or
endorsed by them.

Built by [William Zhu](https://www.linkedin.com/in/william-wei-zhu/).
