"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
    isActive: (p) => p === "/home",
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    isActive: (p) => p.startsWith("/search"),
  },
  {
    href: "/create",
    label: "Create",
    icon: PlusSquare,
    isActive: (p) => p.startsWith("/create"),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: Trophy,
    isActive: (p) => p.startsWith("/ranking"),
  },
  {
    href: "/me",
    label: "My Page",
    icon: UserRound,
    isActive: (p) => p.startsWith("/me"),
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--dd-line)] bg-white/95 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5 lg:max-w-2xl">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[11px] ${
                active
                  ? "font-semibold text-[var(--dd-ink)]"
                  : "text-[var(--dd-gray)]"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-[var(--dd-accent)]" : ""}`}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
