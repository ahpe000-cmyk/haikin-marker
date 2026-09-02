"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { useAppState } from "@/lib/store";
import { listNotifications } from "@/repositories/notifications";

/** Home top header: DD logo + search / notification icons. */
export function AppHeader() {
  const { state } = useAppState();
  const hasUnread =
    !state.notificationsRead && listNotifications().some((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
      <Link href="/" className="select-none">
        <span className="text-2xl font-black tracking-tight">DD</span>
        <span className="sr-only">DD — Date × Decoration ホーム</span>
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/search"
          aria-label="検索"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <Search className="h-6 w-6" aria-hidden strokeWidth={1.8} />
        </Link>
        <Link
          href="/notifications"
          aria-label="通知"
          className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <Bell className="h-6 w-6" aria-hidden strokeWidth={1.8} />
          {hasUnread && (
            <span
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent"
              aria-label="未読の通知があります"
            />
          )}
        </Link>
      </div>
    </header>
  );
}
