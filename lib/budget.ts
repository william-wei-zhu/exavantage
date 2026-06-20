import { Redis } from "@upstash/redis";
import { upstashCreds } from "./ratelimit";

// Global spend ceilings for report builds (the expensive path: each one fans out
// to ~15-25 paid Exa/Gemini calls). Best-effort kill switches so a burst of abuse
// can't run the bill past numbers you set: a tight hourly cap for near-term
// bursts plus a daily backstop. Backed by the same Upstash Redis the rate limiter
// uses; if Redis isn't configured these are a no-op (the per-IP limiters are then
// the only defense, so configure Upstash in production).

const DAILY_LIMIT = Number(process.env.DAILY_REPORT_BUDGET || 500);
const HOURLY_LIMIT = Number(process.env.HOURLY_REPORT_BUDGET || 50);

let _redis: Redis | null = null;
let _tried = false;
function redis(): Redis | null {
  if (_tried) return _redis;
  _tried = true;
  const { url, token } = upstashCreds();
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}

// One counter per UTC day and one per UTC hour; both auto-expire so old windows
// clean themselves up.
function todayKey(): string {
  return `budget:report:${new Date().toISOString().slice(0, 10)}`;
}
function hourKey(): string {
  return `budget:report:hour:${new Date().toISOString().slice(0, 13)}`;
}

/** True if EITHER the hourly or daily report budget is exhausted. Best-effort:
 *  returns false (allow) when Redis is absent or erroring, so we never hard-block
 *  on a counter outage. */
export async function overBudget(): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  try {
    const [hour, day] = await Promise.all([
      r.get<number>(hourKey()),
      r.get<number>(todayKey()),
    ]);
    return (
      (typeof hour === "number" && hour >= HOURLY_LIMIT) ||
      (typeof day === "number" && day >= DAILY_LIMIT)
    );
  } catch {
    return false;
  }
}

/** Count one report build against both the hourly and daily budgets. Best-effort. */
export async function recordReportBuild(): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    const dKey = todayKey();
    const dn = await r.incr(dKey);
    if (dn === 1) await r.expire(dKey, 60 * 60 * 36); // ~1.5 days TTL
    const hKey = hourKey();
    const hn = await r.incr(hKey);
    if (hn === 1) await r.expire(hKey, 60 * 60 * 3); // ~3 hours TTL
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
