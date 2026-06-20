import Link from "next/link";

/**
 * Minimal footer: just attribution and the Exa credit, plus the two required
 * legal/info pages. Replaces the heavy Exa link-columns footer.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center justify-between gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row md:px-6">
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/william-wei-zhu/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Built by William Zhu
          </a>
          <span className="text-border">·</span>
          <a
            href="https://exa.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            Powered by Exa
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
