import { STOP_CATEGORY_LABELS } from "@/data/meta";
import { formatDuration, formatYen } from "@/lib/format";
import type { DateStop } from "@/types";
import { CoverImage } from "@/components/dd/CoverImage";

export function TimelineStop({
  stop,
  isLast,
}: {
  stop: DateStop;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[7px] top-5 h-full w-px bg-[var(--dd-line)]"
        />
      )}
      <span
        aria-hidden
        className="relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[var(--dd-accent)] bg-white"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--dd-accent)]">
          {stop.time}
        </p>
        <p className="mt-0.5 font-bold leading-snug">{stop.name}</p>
        <p className="mt-0.5 text-xs text-[var(--dd-gray)]">
          {STOP_CATEGORY_LABELS[stop.category]} ・ 滞在
          {formatDuration(stop.durationMinutes)} ・{" "}
          {stop.estimatedCost === 0 ? "¥0" : `${formatYen(stop.estimatedCost)}/人`}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--dd-charcoal)]">
          {stop.description}
        </p>
        <div className="mt-2 aspect-[3/2] w-full max-w-[240px] overflow-hidden rounded-xl bg-neutral-100">
          <CoverImage
            seed={stop.imageSeed}
            alt={`${stop.name}のイメージ`}
            width={480}
            height={320}
          />
        </div>
      </div>
    </li>
  );
}

export function Timeline({ stops }: { stops: DateStop[] }) {
  const ordered = [...stops].sort((a, b) => a.order - b.order);
  return (
    <ol className="list-none">
      {ordered.map((stop, i) => (
        <TimelineStop
          key={stop.id}
          stop={stop}
          isLast={i === ordered.length - 1}
        />
      ))}
    </ol>
  );
}
