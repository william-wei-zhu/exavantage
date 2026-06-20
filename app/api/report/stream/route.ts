import { streamReport } from "@/lib/pipeline";
import { clientIp, isUpstashConfigured, rateLimit } from "@/lib/ratelimit";
import { AtCapacityError, overDailyBudget, recordReportBuild } from "@/lib/budget";
import type { StreamEvent } from "@/lib/types";

export const runtime = "nodejs";
// The deal-thesis Gemini pass can occasionally run long; allow the full Vercel
// ceiling (300s on all plans) so a slow build finishes instead of timing out.
export const maxDuration = 300;

// Each build fans out to ~15-25 paid Exa/Gemini calls, so this route is the
// expensive one: per-IP limited and gated by a global daily kill switch.
const PER_MINUTE = 4;
const PER_DAY = 40;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const firmId = (url.searchParams.get("firm") || "").trim().slice(0, 40) || undefined;
  // "Regenerate": rebuild from scratch (skip the cache) and overwrite the same id.
  const fresh = url.searchParams.get("fresh") === "1";
  const replaceRaw = (url.searchParams.get("replace") || "").trim();
  const replaceId = /^[a-z0-9]{8,32}$/i.test(replaceRaw) ? replaceRaw : undefined;

  if (!q || q.length < 2) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }
  if (q.length > 160) {
    return Response.json({ error: "Query too long" }, { status: 400 });
  }

  const ip = clientIp(req);
  const okMinute = await rateLimit(ip, "report-min", PER_MINUTE, 60, {
    failClosed: true,
  });
  const okDay = await rateLimit(ip, "report-day", PER_DAY, 86400, {
    failClosed: true,
  });
  if (!okMinute || !okDay) {
    return Response.json(
      { error: "Rate limit exceeded. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  if (await overDailyBudget()) {
    return Response.json(
      { error: "The tool is at capacity for today. Please try again tomorrow." },
      { status: 503 },
    );
  }
  // Count this build toward the daily budget (best-effort, no-op without Redis).
  if (isUpstashConfigured()) await recordReportBuild();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (e: StreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          // Client disconnected; stop trying to write.
          closed = true;
        }
      };
      try {
        await streamReport(q, send, { firmId, fresh, replaceId });
      } catch (err) {
        if (err instanceof AtCapacityError) {
          send({ type: "error", message: "The tool is at capacity. Try again later." });
        } else {
          console.error("[report.stream] failed:", err);
          send({
            type: "error",
            message: "Something went wrong building the report. Please try again.",
          });
        }
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
