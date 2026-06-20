import type { Firm } from "@/lib/firms";

/**
 * Renders a firm's real logo. Goldman & J.P. Morgan use their official SVG
 * wordmarks (in /public/logos); the other four render as a faithful wordmark in
 * that firm's brand font + color. `height` sets the rendered logo height in px.
 */
export function FirmLogo({
  firm,
  height = 28,
  color,
  className = "",
}: {
  firm: Firm;
  height?: number;
  /** Override wordmark color (SVG logos keep their fixed brand colors). */
  color?: string;
  className?: string;
}) {
  if (firm.logo.kind === "svg") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={firm.logo.src}
        alt={firm.name}
        height={height}
        style={{ height, width: height * firm.logo.ratio }}
        className={className}
      />
    );
  }

  return (
    <span
      className={`font-bold leading-none ${className}`}
      style={{
        fontFamily: firm.theme.headingFont,
        fontSize: height,
        color: color ?? firm.theme.primary,
        textTransform: firm.logo.transform ?? "none",
        letterSpacing: firm.logo.tracking ?? "normal",
      }}
    >
      {firm.wordmark}
    </span>
  );
}
