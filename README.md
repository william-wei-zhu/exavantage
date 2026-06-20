# Exa Vantage

**Your vantage point on every market.**

An AI research analyst for financial-services teams, built on [Exa](https://exa.ai)
and Google Gemini. Pick your firm, type a company name or a sector thesis, and get
a polished, firm-branded market-intelligence report you could walk into a partner
meeting with: a market map, company tear sheets, an emerging / under-the-radar
section, and an executive summary, all exportable to PDF.

Live at **[exavantage.com](https://exavantage.com)**.

## How it works

One unified pipeline, two entry points (the only fork is the seed):

- **Company mode** — resolve the company's domain, then Exa `findSimilar` to find
  lookalikes (including ones not yet in PitchBook).
- **Sector mode** — Exa neural `search` over the thesis to map the universe.

Both flows then cluster into sub-segments, profile each company (summary + a recent
signal + similar companies), surface the under-the-radar names, and synthesize an
executive summary with Gemini. Results stream into the page as they're built.

The under-the-radar discovery can optionally run through **Exa Agent** deep research
(`EXA_AGENT_EMERGING=1`).

## Stack

Next.js 16 (App Router) · Tailwind v4 · TypeScript · Exa (`exa-js`) ·
Gemini 3.1 Flash Lite (`@google/genai`) · PostHog · Vercel.

## Local development

```bash
cp .env.example .env.local   # fill in EXA_API_KEY and GEMINI_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

Required env: `EXA_API_KEY`, `GEMINI_API_KEY`. See `.env.example` for the rest
(PostHog analytics, optional Upstash rate-limiting, the Exa Agent flag).

## Disclaimer

Informational only, not investment advice. The named firms are used to illustrate a
branded deliverable; Exa Vantage is an independent demonstration and is not
affiliated with or endorsed by them.

Built by [William Zhu](https://www.linkedin.com/in/william-wei-zhu/).
