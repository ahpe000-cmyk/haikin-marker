"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "今日", match: (path: string) => path === "/" },
  {
    href: "/learn",
    label: "学ぶ",
    match: (path: string) =>
      path.startsWith("/learn") || path.startsWith("/quiz"),
  },
  {
    href: "/progress",
    label: "成長",
    match: (path: string) =>
      path.startsWith("/progress") || path.startsWith("/result"),
  },
] as const;

function TabIcon({ label }: { label: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (label === "今日") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
        <path d="M9.5 14.5l2 2 3.5-3.5" />
      </svg>
    );
  }
  if (label === "学ぶ") {
    return (
      <svg {...common}>
        <path d="M12 5.5C10 4 7.5 3.5 4 3.5v15c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-15c-3.5 0-6 .5-8 2z" />
        <path d="M12 5.5v15" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 20V10M10 20V4M16 20v-9M22 20H2" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[720px]">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 pb-[env(safe-area-inset-bottom)] text-xs font-medium transition-colors duration-150 ${
                active ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              <TabIcon label={tab.label} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
