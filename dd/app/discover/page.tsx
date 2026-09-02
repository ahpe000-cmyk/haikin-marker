"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import type { DateScene } from "@/types";
import { useAppState } from "@/lib/store";
import { getAllDates } from "@/lib/selectors";
import { filterDates } from "@/repositories/dates";
import { dateRanking } from "@/repositories/ranking";
import { listCouples, listUsers } from "@/repositories/actors";
import { AREAS, BUDGET_BUCKETS, DISCOVER_SCENES, SCENE_LABELS } from "@/lib/labels";
import { Avatar } from "@/components/ui/avatar";
import { DateCard } from "@/components/date/date-card";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

/** SCREEN 04: Discover — デートを探す場所 (Homeとは役割を分離). */
export default function DiscoverPage() {
  const { state, ready } = useAppState();
  const [scene, setScene] = useState<DateScene | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [budgetIndex, setBudgetIndex] = useState<number | null>(null);

  const hasFilter = scene !== null || area !== null || budgetIndex !== null;

  const results = useMemo(() => {
    if (!ready || !hasFilter) return [];
    const bucket = budgetIndex !== null ? BUDGET_BUCKETS[budgetIndex] : undefined;
    return filterDates(getAllDates(state), {
      scene: scene ?? undefined,
      area: area ?? undefined,
      budget: bucket ? [bucket.min, bucket.max] : undefined,
    });
  }, [ready, hasFilter, state, scene, area, budgetIndex]);

  if (!ready) return <LoadingState variant="list" />;

  const trending = dateRanking().slice(0, 6);
  const popularCreators = [...listUsers()]
    .filter((u) => u.specialty)
    .sort((a, b) => b.ddScore - a.ddScore)
    .slice(0, 8);
  const popularCouples = [...listCouples()]
    .sort((a, b) => b.ddScore - a.ddScore)
    .slice(0, 8);

  const chip = (active: boolean) =>
    cn(
      "h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors",
      active
        ? "border-ink bg-ink text-white"
        : "border-line bg-white text-ink/80 hover:border-ink/40"
    );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <h1 className="sr-only">Discover — デートを探す</h1>
        <Link
          href="/search"
          className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm text-muted"
        >
          <Search className="h-4 w-4" aria-hidden />
          デート・ユーザー・カップルを検索
        </Link>
      </header>

      <div className="space-y-1 pt-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
          {DISCOVER_SCENES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={scene === s}
              className={chip(scene === s)}
              onClick={() => setScene(scene === s ? null : s)}
            >
              {SCENE_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={area === a}
              className={chip(area === a)}
              onClick={() => setArea(area === a ? null : a)}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
          {BUDGET_BUCKETS.map((b, i) => (
            <button
              key={b.label}
              type="button"
              aria-pressed={budgetIndex === i}
              className={chip(budgetIndex === i)}
              onClick={() => setBudgetIndex(budgetIndex === i ? null : i)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilter ? (
        <section className="px-4 py-4">
          <h2 className="mb-3 text-sm font-semibold text-muted">
            {results.length}件のデート
          </h2>
          {results.length === 0 ? (
            <EmptyState
              title="条件に合うデートがありません"
              description="フィルターを変更してみてください"
            />
          ) : (
            <div className="space-y-3">
              {results.map((d) => (
                <DateCard key={d.id} date={d} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="px-4 pt-5">
            <h2 className="flex items-center gap-1.5 text-base font-bold">
              <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
              Trending Dates
            </h2>
            <div className="mt-3 space-y-3">
              {trending.map((row) => (
                <DateCard key={row.date.id} date={row.date} />
              ))}
            </div>
          </section>

          <section className="pt-6">
            <h2 className="px-4 text-base font-bold">Popular Couples</h2>
            <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4">
              {popularCouples.map((c) => (
                <Link
                  key={c.id}
                  href={`/couple/${c.id}`}
                  className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
                >
                  <Avatar src={c.avatar} name={c.displayName} size="lg" />
                  <span className="line-clamp-2 text-xs font-medium leading-tight">
                    {c.displayName}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="pb-6 pt-6">
            <h2 className="px-4 text-base font-bold">Popular Creators</h2>
            <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4">
              {popularCreators.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
                >
                  <Avatar src={u.avatar} name={u.displayName} size="lg" />
                  <span className="text-xs font-medium">{u.displayName}</span>
                  <span className="line-clamp-1 text-[10px] text-muted">
                    {u.specialty}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
