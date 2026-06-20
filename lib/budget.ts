import { Redis } from "@upstash/redis";
import { upstashCreds } from "./ratelimit";

// Global daily spend ceiling for report builds (the expensive path: each one
// fans out to ~15-25 paid Exa/Gemini calls). A best-effort kill switch so a
// burst of abuse can't run the bill past a number you set. Backed by the same
// Upstash Redis the rate limiter uses; if Redis isn't configured this is a
// no-op (the per-IP limiters are then the only defense, so configure Upstash).

const DAILY_LIMIT = Number(process.env.DAILY_REPORT_BUDGET || 500);

let _redis: Redis | null = null;
let _tried = false;
function redis(): Redis | null {
  if (_tried) return _redis;
  _tried = true;
  const { url, token } = upstashCreds();
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}

// One counter per UTC day; auto-expires so old days clean themselves up.
function todayKey(): string {
  return `budget:report:${new Date().toISOString().slice(0, 10)}`;
}

/** True if today's report budget is exhausted. Best-effort: returns false
 *  (allow) when Redis is absent or erroring, so we never hard-block on a
 *  counter outage. */
export async function overDailyBudget(): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  try {
    const used = await r.get<number>(todayKey());
    return typeof used === "number" && used >= DAILY_LIMIT;
  } catch {
    return false;
  }
}

/** Count one report build against today's budget. Best-effort. */
export async function recordReportBuild(): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    const key = todayKey();
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, 60 * 60 * 36); // ~1.5 days TTL
  } catch {
    /* ignore */
  }
}

/** Thrown by the pipeline when the daily budget is spent; the route turns it
 *  into a 503 so the tool degrades gracefully instead of erroring opaquely. */
export class AtCapacityError extends Error {
  constructor() {
    super("At capacity");
    this.name = "AtCapacityError";
  }
}
