import Link from "next/link";
import { ExaVantageLockup } from "@/components/exa-logo";

/** Real Exa nav destinations, so the header reads as the genuine site. */
const NAV_LINKS = [
  { href: "/about", label: "How it works", internal: true },
  { href: "https://exa.ai/pricing", label: "Pricing" },
  { href: "https://docs.exa.ai", label: "Docs" },
  { href: "https://exa.ai/about", label: "About Exa" },
];

/**
 * Exa-style top bar, ported from williamzhu.ai/exa-growth: white, fixed, the Exa
 * wordmark (sub-branded "Vantage") on the left, a few nav links, a black CTA on
 * the right. Reads `--exa-panel-w` (default 0px) so it can shrink beside a side
 * panel; inert here.
 */
export function ExaHeader() {
  return (
    <header
      style={{ width: "calc(100% - var(--exa-panel-w, 0px))" }}
      className="fixed top-0 z-50 border-b border-border bg-background"
    >
      <nav className="mx-auto flex h-14 max-w-[1040px] items-center justify-between px-5 md:px-6">
        <Link href="/" className="flex items-center" aria-label="Exa Vantage home">
          <ExaVantageLockup />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) =>
            link.internal ? (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5]"
              >
                {link.label}
              </a>
            ),
          )}
        </div>

        <a
          href="https://dashboard.exa.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-black px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#262626]"
        >
          Try the API
        </a>
      </nav>
    </header>
  );
}
