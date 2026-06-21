import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Globe, Sparkles, Triangle, Code2, Database, LineChart } from "lucide-react";
import { ExaHeader } from "@/components/exa-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { MiniPipeline, RollupArt, HiddenArt, ExaArt, FilterArt, DeckArt } from "@/components/docs-art";
import { YoutubeFacade } from "@/components/youtube-facade";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Exa Vantage finds the acquisition targets and makes the case for the deal, built for KKR.",
};

const AUB = "#53284F";

function Act({
  num,
  title,
  children,
  tag,
  art,
  flip = false,
  emphasize = false,
}: {
  num: string;
  title: string;
  children: ReactNode;
  tag: string;
  art: ReactNode;
  flip?: boolean;
  emphasize?: boolean;
}) {
  return (
    <Reveal className="mt-16 first:mt-12">
      <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
        <div className={flip ? "sm:order-2" : ""}>
          <div
            className={`lift flex items-center justify-center rounded-xl border p-6 ${
              emphasize ? "bg-[#16A9C8]/[0.06]" : "border-border bg-card"
            }`}
            style={emphasize ? { borderColor: "#16A9C866" } : undefined}
          >
            <div className="w-full max-w-[300px]">{art}</div>
          </div>
        </div>
        <div className={flip ? "sm:order-1" : ""}>
          <p className="font-heading text-5xl font-bold leading-none" style={{ color: AUB }}>{num}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg leading-relaxed text-foreground/85">{children}</p>
          <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">{tag}</p>
        </div>
      </div>
    </Reveal>
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

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExaHeader />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <div className="mx-auto max-w-4xl px-5 pt-16 pb-4 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>Behind the scenes · built for KKR</p>
            <h1 className="mt-4 max-w-2xl font-heading text-5xl font-bold leading-[1.0] tracking-tight sm:text-7xl">
              How Exa finds the targets and makes the case.
            </h1>
            <div className="mt-8">
              <YoutubeFacade id="ogUN0-XxAlI" title="Exa Vantage 60-second demo" />
            </div>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-foreground/85">
              You enter one company. About 90 seconds later you have a deck of the smaller companies
              worth acquiring around it, ranked and reasoned. Here is the whole journey, in five steps.
            </p>
          </Reveal>

          <Reveal className="mt-12" delay={120}>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
              <MiniPipeline />
            </div>
          </Reveal>
        </div>

        {/* The five acts */}
        <div className="mx-auto max-w-4xl px-5 py-6 md:px-6">
          <Act num="01" title="The job: buy small, build big." tag="Private equity buy-and-build (a 'roll-up')" art={<RollupArt />}>
            KKR picks one solid company in an industry full of small players (the <strong>platform</strong>),
            then buys up smaller, similar companies (the <strong>add-ons</strong>) and merges them into one
            market leader worth far more than the parts.
          </Act>

          <Act num="02" title="The catch: the best targets hide from databases." tag="PitchBook and Crunchbase track funded companies, not the long tail" art={<HiddenArt />} flip>
            Those smaller companies are private, often family-owned, with barely a website. No database
            lists them, because databases mostly track companies that raised money or made news. So
            analysts spend weeks searching by hand.
          </Act>

          <Act num="03" title="Exa finds them by what they do." tag="Exa findSimilar + neural search, then an Exa Agent deep-research pass over the live web" art={<ExaArt />} emphasize>
            Give Exa one company and it surfaces the whole hidden field by meaning, the off-database names
            included. It uses <strong>findSimilar for acquisition targets</strong>, semantic
            similarity over the live web instead of a curated list. Then a second, complementary move, the{" "}
            <strong>Exa Agent</strong>, runs multi-step research from the thesis to pull in the freshest,
            under-the-radar names that even similarity misses, deduped against the set so far.
          </Act>

          <Act num="04" title="Keep only what's real and buyable." tag="Gemini relevance gate drops name-collisions · independence gate drops parent-owned sub-brands · per-company facts + a cited market stat from Exa" art={<FilterArt />} flip>
            An AI relevance gate removes look-alikes that only share a name, and an independence gate drops
            companies already owned by a larger parent (a sub-brand of a national chain is not a deal you can
            do on its own). What survives is real and acquirable, so it then pulls each company&apos;s size,
            location, and ownership signals, plus one market-size number cited to a real source.
          </Act>

          <Act num="05" title="It writes the recommendation, as a deck." tag="Gemini 3.5 Flash · structured deal thesis · KKR deck · shareable + PDF + CSV" art={<DeckArt />}>
            One analysis turns the set into a partner-ready recommendation: which targets to call first and
            why, the value, the risks, and the ask, rendered as a fixed-frame slide deck in KKR&apos;s brand in about
            90 seconds.
          </Act>
        </div>

        {/* The stack */}
        <div className="mx-auto max-w-4xl px-5 py-10 pb-16 md:px-6">
          <Reveal>
            <p className="section-label" style={{ color: AUB }}>What it runs on</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <StackCard icon={<Globe className="size-5" strokeWidth={1.8} />} name="Exa" spec="exa-js · findSimilar + neural search + Contents + Exa Agent · cited market sources" />
              <StackCard icon={<Sparkles className="size-5" strokeWidth={1.8} />} name="Google Gemini" spec="@google/genai · gemini-3.5-flash · seed 7 · structured JSON output" />
              <StackCard icon={<Triangle className="size-5" strokeWidth={1.8} />} name="Vercel" spec="Functions on Fluid Compute · NDJSON streaming route · rate limit + budget guard" />
              <StackCard icon={<Code2 className="size-5" strokeWidth={1.8} />} name="Next.js · React" spec="16 App Router · React 19 · server-rendered shareable /r/[id]" />
              <StackCard icon={<Database className="size-5" strokeWidth={1.8} />} name="Google Firestore" spec="firebase-admin · saved decks for shareable links" />
              <StackCard icon={<LineChart className="size-5" strokeWidth={1.8} />} name="PostHog" spec="posthog-js · product analytics" />
            </div>

            <div className="mt-10 border-t border-border pt-6">
              <p className="section-label" style={{ color: AUB }}>Notes for engineers</p>
              <ul className="mt-4 space-y-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
                <li>· Discovery runs two complementary Exa calls: findSimilar (off a domain) builds the known universe, and the Exa Agent API (multi-step research off the thesis) adds the emerging long tail, deduped against it.</li>
                <li>· The independence gate runs twice: a Gemini pass drops known sub-brands up front, then per-company Exa text is re-checked for a parent/owner, dropping any that slipped through before they reach the deck.</li>
                <li>· The market stat is sector-scoped and Exa-cited (a single company&apos;s ARR is rejected) with a confidence label.</li>
                <li>· Quant is evidence-only and labeled estimated, blank when unknown. No invented revenue, multiples, or market shares.</li>
                <li>· The deck streams behind a gated build view and reveals on done, so you never see half-built numbers.</li>
              </ul>
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <h3 className="font-heading text-2xl font-bold leading-tight">Want the engineering deep dive?</h3>
              <p className="mt-2 max-w-xl text-foreground/85">
                The full backend, every Exa and Gemini call in order, the streaming protocol, and the
                trust layer, is laid out on its own page.
              </p>
              <Link
                href="/architecture"
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: AUB }}
              >
                Read the full architecture
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <p className="section-label mt-10 border-t border-border pt-6 text-muted-foreground">
              Architecture overview · informational. Back to{" "}
              <Link href="/" className="underline">Exa Vantage</Link>.
            </p>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
