"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { initAnalytics } from "@/lib/analytics";

/**
 * Initializes PostHog on mount (no-op without NEXT_PUBLIC_POSTHOG_KEY) and
 * captures a pageview on every client-side route change so App Router
 * navigations are tracked, not just the first paint.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    try {
      posthog.capture("$pageview");
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
