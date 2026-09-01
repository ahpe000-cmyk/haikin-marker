"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Search } from "lucide-react";
import { useToast } from "@/components/dd/Toast";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({
  title,
  showBack = false,
  showLogo = false,
  showSearch = false,
  showNotification = false,
  rightSlot,
}: AppHeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--dd-line)] bg-[var(--dd-bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-md items-center gap-2 px-4 lg:max-w-2xl">
        {showBack && (
          <button
            type="button"
            aria-label="戻る"
            onClick={() => router.back()}
            className="-ml-2 rounded-full p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        {showLogo ? (
          <Link href="/home" className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight">DD</span>
            <span className="hidden text-xs text-[var(--dd-gray)] sm:inline">
              Date × Decoration
            </span>
          </Link>
        ) : (
          <h1 className="truncate text-base font-bold">{title}</h1>
        )}
        <div className="ml-auto flex items-center gap-1">
          {showSearch && (
            <Link
              href="/search"
              aria-label="検索"
              className="rounded-full p-2 hover:bg-neutral-100"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>
          )}
          {showNotification && (
            <button
              type="button"
              aria-label="通知（デモ）"
              onClick={() => showToast("通知はデモでは未実装です")}
              className="rounded-full p-2 hover:bg-neutral-100"
            >
              <Bell className="h-5 w-5" aria-hidden />
            </button>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
