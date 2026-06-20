"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Motion props for a subtle fade-up entrance.
 *
 * Content is ALWAYS visible from first paint: the animation is a purely
 * decorative y-offset that runs once when the element first enters the viewport.
 * Content stays readable without JS, in screenshot tools, and for reduced-motion
 * users. The motion is decoration, never a content gate.
 */
export function useFadeUpProps(delay = 0) {
  const reduce = useReducedMotion();
  if (reduce) {
    return {
      initial: { y: 0 },
      whileInView: { y: 0 },
      viewport: { once: true },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { y: 12 },
    whileInView: { y: 0 },
    viewport: { once: true, margin: "-120px" },
    transition: { duration: 0.5, delay, ease: "easeOut" },
  } as const;
}
