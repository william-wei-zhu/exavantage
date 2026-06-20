import Link from "next/link";
import { ExaVantageLockup } from "@/components/exa-logo";

/**
 * Top bar: the Exa shell, co-branded for KKR. Left = the enlarged "Exa Vantage"
 * lockup + a "for KKR" co-brand (the real KKR logo), so every page reads as
 * "Exa Vantage, built for KKR". Right = a single "How it works" link. White,
 * fixed; reads `--exa-panel-w` so it can shrink beside a side panel (inert here).
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
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              for
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/kkr.svg" alt="KKR" className="h-[15px] w-auto" />
          </span>
        </Link>

        <Link
          href="/about"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#53284F" }}
        >
          How it works
        </Link>
      </nav>
    </header>
  );
}
