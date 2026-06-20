"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Reveal: fades + lifts its children into view once, the first time they scroll
 * near the viewport, then stops observing. Adding the `is-visible` class also
 * triggers any one-shot line-art animations nested inside (see globals.css:
 * `.is-visible .draw`, `.fade-art`, `.sweep`, `.spark-in`, `.press`). Honors
 * prefers-reduced-motion by showing everything immediately.
 */
export function Reveal({
  children,
  className = "",
  style,
  delay = 0,
  threshold = 0.2,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IntersectionObserver (old/SSR-only env): show immediately rather than animate.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
