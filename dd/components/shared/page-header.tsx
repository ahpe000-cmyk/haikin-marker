"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Sub-page header with a back button. */
export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-paper/95 px-2 py-2.5 backdrop-blur">
      <button
        type="button"
        aria-label="戻る"
        onClick={() => router.back()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-ink/5"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
      {action}
    </header>
  );
}
