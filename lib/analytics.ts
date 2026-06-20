import posthog from "posthog-js";

// Analytics is a no-op until NEXT_PUBLIC_POSTHOG_KEY is set, so the app runs
// fine without it and lights up once the key is configured.
let inited = false;

export function initAnalytics() {
  if (inited || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
    },
  });
  inited = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* ignore */
  }
}
