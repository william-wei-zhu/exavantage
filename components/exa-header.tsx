import Link from "next/link";
import { Home } from "lucide-react";
import { ExaVantageLockup } from "@/components/exa-logo";

/**
 * Top bar: the Exa shell, co-branded for KKR. Left = the enlarged "Exa Vantage"
 * lockup + a "for KKR" co-brand (the real KKR logo), so every page reads as
 * "Exa Vantage, built for KKR". Right = a Home link + a "How it works" link.
 * White, fixed; reads `--exa-panel-w` so it can shrink beside a side panel (inert).
 *
 * The Home link is a plain anchor (full navigation), not a Next <Link>: after an
 * inline generation the route is still "/" while the URL shows "/r/[id]", so a
 * client-side same-route nav wouldn't clear the deck. A full load to "/" always
 * returns the fresh, empty homepage.
 */
export function ExaHeader() {
  return (
    <header
      style={{ width: "calc(100% - var(--exa-panel-w, 0px))" }}
      className="fixed top-0 z-50 border-b border-border bg-background"
    >
      <nav className="mx-auto flex h-14 max-w-[1040px] items-center justify-between px-5 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3"
          aria-label="Exa Vantage, built for KKR"
        >
          <ExaVantageLockup />
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
              for
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/kkr.svg" alt="KKR" className="h-[18px] w-auto" />
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Full reload is intentional (see above): a Next <Link> wouldn't reset the inline deck. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            aria-label="Home"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Home</span>
          </a>
          <Link
            href="/about"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#53284F" }}
          >
            How it works
          </Link>
        </div>
      </nav>
    </header>
  );
}
