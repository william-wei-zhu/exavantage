import Link from "next/link";
import { ExaLogo } from "@/components/exa-logo";

type FooterLink = { href: string; label: string };

/** Footer link columns, mirroring exa.ai with the real destinations. */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Products",
    links: [
      { href: "https://exa.ai/pricing", label: "Pricing" },
      { href: "https://exa.ai/products/search", label: "API" },
      { href: "https://exa.ai/websets", label: "Websets" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "https://exa.ai/about", label: "About" },
      { href: "https://exa.ai/careers", label: "Careers" },
      { href: "https://exa.ai/blog", label: "Blog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "https://dashboard.exa.ai/", label: "API Dashboard" },
      { href: "https://docs.exa.ai", label: "Docs" },
      { href: "https://exa.ai/mcp", label: "MCP Server" },
    ],
  },
  {
    title: "Exa Vantage",
    links: [
      { href: "/about", label: "How it works" },
      { href: "/privacy", label: "Privacy & disclaimer" },
    ],
  },
];

/**
 * Exa-style footer, ported from williamzhu.ai/exa-growth: a CTA band, the
 * "perfect search" line, link columns, and a legal row. Carries a "Built by
 * William Zhu" credit so attribution stays clear even though it mimics Exa.
 */
export function ExaFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-[1040px] px-5 py-16 md:px-6 md:py-20">
        {/* CTA band */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Search built for your AI
            </h2>
            <p className="mt-3 max-w-md text-lg text-muted-foreground">
              The fastest, most accurate web search API. Give your agents the
              context they need.
            </p>
          </div>
          <a
            href="https://dashboard.exa.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded bg-black px-5 py-3 text-base font-medium text-white transition-colors hover:bg-[#262626]"
          >
            Try API for free
          </a>
        </div>

        {/* Perfect-search line */}
        <p className="mt-16 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:mt-20 md:text-5xl">
          Imagine a world with perfect search.
        </p>

        {/* Link columns */}
        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-base font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal row */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ExaLogo className="h-4 w-auto text-foreground" />
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Exa Vantage · a demonstration
            </span>
          </div>
          <a
            href="https://www.linkedin.com/in/william-wei-zhu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-muted-foreground transition-colors hover:text-foreground"
          >
            Built by William Zhu
          </a>
        </div>
      </div>
    </footer>
  );
}
