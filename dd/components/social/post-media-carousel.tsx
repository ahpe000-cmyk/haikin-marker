"use client";

import { useRef, useState } from "react";
import type { PostMedia } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";

export function PostMediaCarousel({
  media,
  aspect = "4/5",
  priority = false,
}: {
  media: PostMedia[];
  aspect?: string;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (media.length === 0) {
    return <SmartImage src="" alt="投稿画像なし" aspect={aspect} />;
  }

  if (media.length === 1) {
    return (
      <SmartImage src={media[0].url} alt={media[0].alt} aspect={aspect} priority={priority} />
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="snap-carousel no-scrollbar flex overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        aria-label={`写真 ${index + 1} / ${media.length}`}
      >
        {media.map((m, i) => (
          <div key={m.id} className="w-full shrink-0">
            <SmartImage
              src={m.url}
              alt={m.alt}
              aspect={aspect}
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] font-medium text-white">
        {index + 1}/{media.length}
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
        {media.map((m, i) => (
          <span
            key={m.id}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              i === index ? "bg-ink" : "bg-ink/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
