import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The Exa geometric mark (brand blue) as the favicon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <svg width="44" height="56" viewBox="0 0 79 100" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H78.1818V7.46269L44.8165 50L78.1818 92.5373V100H0V0ZM39.5825 43.1172L66.6956 7.46269H12.4695L39.5825 43.1172ZM8.79612 16.3977V46.2687H31.5111L8.79612 16.3977ZM31.5111 53.7313H8.79612V83.6023L31.5111 53.7313ZM12.4695 92.5373L39.5825 56.8828L66.6956 92.5373H12.4695Z"
            fill="#1F40ED"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
