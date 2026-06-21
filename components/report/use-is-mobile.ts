import { useEffect, useState } from "react";

/**
 * True on phone-width viewports (`< 640px`, the Tailwind `sm` breakpoint). Used by
 * the deck so slides can show their full, un-truncated text on mobile (where the
 * fixed 16:9 frame is relaxed to natural height) while desktop/print stay clamped.
 *
 * Effect-based (not a lazy initializer) so the server render and first client render
 * both start `false` — no hydration mismatch. On a phone the value flips after mount,
 * which simply expands the text one frame after load.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639.98px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
