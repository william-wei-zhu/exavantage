import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Per-IP rate limiting. Uses Upstash (global, across instances) when configured;
// otherwise falls back to an in-memory per-instance limiter so it works today.

const upstashCache = new Map<string, Ratelimit | null>();

// Accept whichever names the Upstash connection injected (the native Upstash
// integration uses UPSTASH_REDIS_REST_*, the Vercel KV / Marketplace flow uses
// KV_REST_API_*), so connecting it can't silently no-op on a name mismatch.
export function upstashCreds(): { url?: string; token?: string } {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  };
}

/** Whether a durable (Upstash) limiter is configured. If not, limiting is the
 *  in-memory per-instance fallback, which is best-effort only. */
export function isUpstashConfigured(): boolean {
  const { url, token } = upstashCreds();
  return Boolean(url && token);
}

function upstashLimiter(name: string, limit: number, windowSec: number): Ratelimit | null {
  const cacheKey = `${name}:${limit}:${windowSec}`;
  if (upstashCache.has(cacheKey)) return upstashCache.get(cacheKey) ?? null;
  const { url, token } = upstashCreds();
  const rl =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
          prefix: `rl:${name}`,
          analytics: false,
        })
      : null;
  upstashCache.set(cacheKey, rl);
  return rl;
}

type Bucket = { count: number; reset: number };
const mem = new Map<string, Bucket>();

function memLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = mem.get(key);
  if (!b || b.reset < now) {
    mem.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/**
 * Returns true if the request is allowed. On a limiter OUTAGE this fails open by
 * default (never block real users on infra hiccups), but expensive routes can
 * pass `failClosed` so that, when a durable limiter is configured, an outage
 * can't be used to bypass the cap entirely.
 */
export async function rateLimit(
  ip: string,
  name: string,
  limit: number,
  windowSec: number,
  opts: { failClosed?: boolean } = {},
): Promise<boolean> {
  try {
    const up = upstashLimiter(name, limit, windowSec);
    if (up) {
      const { success } = await up.limit(ip);
      return success;
    }
  } catch {
    if (opts.failClosed && isUpstashConfigured()) return false;
    return true; // otherwise never block real users on a limiter outage
  }
  return memLimit(`${name}:${ip}`, limit, windowSec * 1000);
}

/**
 * Best-effort client IP. Prefer `x-real-ip`, which Vercel's edge sets to the
 * true client IP and overwrites from inbound requests (so a client can't spoof
 * it). Fall back to the LAST hop of `x-forwarded-for` (the entry the trusted
 * proxy appended), not the first, which an upstream client could forge.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}
