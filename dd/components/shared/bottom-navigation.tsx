"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/create", label: "Create", icon: Plus, emphasized: true },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/me", label: "Profile", icon: User },
] as const;

/** Routes where the bottom navigation is hidden (focused flows). */
const HIDDEN_PATTERNS = [/^\/create/, /^\/date\/[^/]+\/reproduce/];

export function BottomNavigation() {
  const pathname = usePathname();
  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-app border-t border-line bg-white/95 backdrop-blur"
    >
      <ul className="flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                {"emphasized" in item && item.emphasized ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                ) : (
                  <Icon className="h-6 w-6" aria-hidden strokeWidth={active ? 2.4 : 1.8} />
                )}
                <span className={cn("emphasized" in item && item.emphasized && "sr-only")}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
