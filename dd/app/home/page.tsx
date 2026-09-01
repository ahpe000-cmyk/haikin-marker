"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { CreatorCard } from "@/components/dd/CreatorCard";
import { DateCard } from "@/components/dd/DateCard";
import { RankingList } from "@/components/dd/RankingList";
import { CATEGORY_LABELS } from "@/data/meta";
import { CREATORS } from "@/data/creators";
import { buildRanking } from "@/lib/ranking";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DateCategory } from "@/types";

const SCENE_CARDS: DateCategory[] = [
  "first-date",
  "anniversary",
  "rainy-day",
  "night",
  "daytime",
  "low-budget",
];

function SectionHeading({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      {linkHref && (
        <Link
          href={linkHref}
          className="inline-flex items-center text-sm text-[var(--dd-gray)]"
        >
          {linkLabel ?? "すべて見る"}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

// SCREEN 02: Home
export default function HomePage() {
  const { allPlans, statsOf } = useDemoStore();

  const todaysPicks = allPlans.filter((p) =>
    ["d1", "d5", "d13", "d8"].includes(p.id),
  );
  const trending = buildRanking(allPlans, "overall", statsOf).slice(0, 3);
  const recommended = allPlans.filter((p) =>
    ["d3", "d4", "d6", "d7", "d11", "d12"].includes(p.id),
  );

  return (
    <AppShell>
      <AppHeader showLogo showSearch showNotification />
      <main className="space-y-8 px-4 py-5">
        <p className="rounded-xl bg-[var(--dd-accent-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--dd-charcoal)]">
          これはDDのデモです。デートプラン・店舗・評価はすべて架空のDEMO
          DATAです。
        </p>

        <section aria-label="今日おすすめのデート">
          <SectionHeading title="今日おすすめのデート" linkHref="/search" />
          <div className="dd-hscroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {todaysPicks.map((plan) => (
              <DateCard key={plan.id} plan={plan} layout="horizontal-scroll" />
            ))}
          </div>
        </section>

        <section aria-label="いま人気のデート">
          <SectionHeading
            title="いま人気のデート"
            linkHref="/ranking"
            linkLabel="ランキング"
          />
          <RankingList entries={trending} />
        </section>

        <section aria-label="シーンから探す">
          <SectionHeading title="シーンから探す" />
          <div className="grid grid-cols-3 gap-2">
            {SCENE_CARDS.map((scene) => (
              <Link
                key={scene}
                href={`/search?scene=${scene}`}
                className="rounded-xl border border-[var(--dd-line)] bg-white py-4 text-center text-sm font-semibold transition-colors hover:bg-neutral-50"
              >
                {CATEGORY_LABELS[scene]}
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="人気クリエイター">
          <SectionHeading title="人気クリエイター" />
          <div className="dd-hscroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {CREATORS.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>

        <section aria-label="あなたにおすすめ">
          <SectionHeading title="あなたにおすすめ" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommended.map((plan) => (
              <DateCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
