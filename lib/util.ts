/** Strip protocol, www, path, and lowercase → bare registrable-ish domain. */
export function normalizeDomain(input: string): string {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/^www\./, "");
  s = s.replace(/[/?#].*$/, "");
  return s;
}

/** Bare domain from an arbitrary URL or domain-ish string. */
export function domainOf(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return normalizeDomain(u.hostname);
  } catch {
    return normalizeDomain(url);
  }
}

/** Canonical https URL for a bare domain. */
export function urlForDomain(domain: string): string {
  return `https://${normalizeDomain(domain)}`;
}

/** Normalize a company name to a cache key: lowercase, alphanumerics only.
 *  "Service Titan" / "servicetitan" / "ServiceTitan" all collapse to the same key. */
export function normalizeName(input: string): string {
  return (input || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Title-case-ish brand name fallback derived from a domain. */
export function brandNameFromDomain(domain: string): string {
  const root = normalizeDomain(domain).split(".")[0] || domain;
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export function isValidDomain(domain: string): boolean {
  const d = normalizeDomain(domain);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return false;
  // Reject IPs / numeric hosts (defense-in-depth; we only hand domains to Exa).
  if (/^\d{1,3}(\.\d{1,3})+$/.test(d)) return false;
  const tld = d.split(".").pop() ?? "";
  return /[a-z]/.test(tld);
}

/** Truncate to at most `maxWords` whole words, adding an ellipsis only when text
 *  was actually cut. Cuts on a word boundary (never mid-word) and trims trailing
 *  punctuation so slide copy ends cleanly instead of being chopped by the box. */
export function truncateWords(text: string | undefined, maxWords: number): string {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return (text ?? "").trim();
  return words.slice(0, maxWords).join(" ").replace(/[,;:.\-\s]+$/, "") + "…";
}

/** Brand favicon via Google's service (no key needed). */
export function faviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    normalizeDomain(domain),
  )}&sz=${size}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retry a flaky async call with exponential backoff + jitter. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseMs?: number; label?: string } = {},
): Promise<T> {
  const retries = opts.retries ?? 2;
  const baseMs = opts.baseMs ?? 400;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      const wait = baseMs * 2 ** attempt + Math.floor(Math.random() * 150);
      console.warn(
        `[retry] ${opts.label ?? "call"} attempt ${attempt + 1} failed: ${
          (e as Error)?.message
        } — retrying in ${wait}ms`,
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}

/** Run an async map with bounded concurrency (avoids bursting rate limits). */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  const n = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}
