import Link from "next/link";
import { Inbox, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
        <Inbox className="h-7 w-7 text-muted" aria-hidden />
      </span>
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  title = "ページが見つかりません",
  description = "コンテンツが削除されたか、URLが間違っている可能性があります。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <AlertTriangle className="h-7 w-7 text-accent" aria-hidden />
      </span>
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm text-muted">{description}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}

/** Generic feed / list skeleton. */
export function LoadingState({ variant = "feed" }: { variant?: "feed" | "profile" | "list" }) {
  if (variant === "profile") {
    return (
      <div className="space-y-4 p-4" aria-label="読み込み中" role="status">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }
  if (variant === "list") {
    return (
      <div className="space-y-3 p-4" aria-label="読み込み中" role="status">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6 p-4" aria-label="読み込み中" role="status">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
