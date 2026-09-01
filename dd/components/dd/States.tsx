import Link from "next/link";
import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";

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
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--dd-line)] bg-white px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-neutral-300" aria-hidden />
      <p className="font-bold">{title}</p>
      {description && (
        <p className="text-sm text-[var(--dd-gray)]">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 rounded-full bg-[var(--dd-ink)] px-5 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function LoadingState({ label = "読み込み中…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 px-6 py-16 text-center text-sm text-[var(--dd-gray)]"
    >
      <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorState({
  title = "ページが見つかりません",
  description = "URLが間違っているか、コンテンツが削除された可能性があります。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <CircleAlert className="h-8 w-8 text-neutral-300" aria-hidden />
      <p className="text-lg font-bold">{title}</p>
      <p className="text-sm text-[var(--dd-gray)]">{description}</p>
      <Link
        href="/home"
        className="mt-3 rounded-full bg-[var(--dd-ink)] px-5 py-2 text-sm font-semibold text-white"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
