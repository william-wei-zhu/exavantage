"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Click-to-play YouTube embed. Shows the video's poster + a play button; the
 * heavy YouTube iframe (and its scripts) load only when the user clicks, so the
 * page stays fast and we never ship YouTube JS to people who don't watch.
 * The poster comes straight from YouTube's CDN (maxres, falling back to hq on a
 * 404 for older uploads); plain <img> avoids next/image remote-pattern config.
 */
export function YoutubeFacade({
  id,
  title = "Demo video",
}: {
  id: string;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="lift relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            onError={(e) => {
              e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
            }}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
          <span
            className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110 sm:size-20"
            style={{ background: "#53284F" }}
          >
            <Play className="size-7 translate-x-0.5 text-white sm:size-9" fill="#fff" strokeWidth={1} />
          </span>
        </button>
      )}
    </div>
  );
}
