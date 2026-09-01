"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { DateCard } from "@/components/dd/DateCard";
import { FilterChip } from "@/components/dd/FilterChip";
import { EmptyState, LoadingState } from "@/components/dd/States";
import {
  AREAS,
  BUDGET_RANGES,
  CATEGORIES,
  CATEGORY_LABELS,
  DURATION_RANGES,
  TIME_LABELS,
  TIMES,
} from "@/data/meta";
import { activeFilterCount, EMPTY_FILTERS, searchPlans } from "@/lib/filter";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DateCategory, SearchFilters } from "@/types";

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

// SCREEN 03/04: Search + Search Results
function SearchContent() {
  const params = useSearchParams();
  const { allPlans } = useDemoStore();

  const initialScene = params.get("scene");
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...EMPTY_FILTERS,
    scenes:
      initialScene && CATEGORIES.includes(initialScene as DateCategory)
        ? [initialScene as DateCategory]
        : [],
  }));
  const [showFilters, setShowFilters] = useState(
    () => initialScene !== null,
  );

  const results = useMemo(
    () => searchPlans(allPlans, filters),
    [allPlans, filters],
  );
  const filterCount = activeFilterCount(filters);

  return (
    <AppShell>
      <AppHeader title="デートを探す" />
      <main className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">エリア・デート・キーワードから探す</span>
            <SearchIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dd-gray)]"
              aria-hidden
            />
            <input
              type="search"
              value={filters.keyword}
              onChange={(e) =>
                setFilters((f) => ({ ...f, keyword: e.target.value }))
              }
              placeholder="エリア・デート・キーワードから探す"
              className="w-full rounded-full border border-[var(--dd-line)] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--dd-ink)]"
            />
          </label>
          <button
            type="button"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((v) => !v)}
            className={`relative rounded-full border p-2.5 ${
              showFilters
                ? "border-[var(--dd-ink)] bg-[var(--dd-ink)] text-white"
                : "border-[var(--dd-line)] bg-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="sr-only">絞り込み</span>
            {filterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dd-accent)] text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4 rounded-2xl border border-[var(--dd-line)] bg-white p-4">
            <FilterSection title="エリア">
              {AREAS.map((a) => (
                <FilterChip
                  key={a.id}
                  label={a.label}
                  selected={filters.areas.includes(a.id)}
                  onToggle={() =>
                    setFilters((f) => ({
                      ...f,
                      areas: toggleValue(f.areas, a.id),
                    }))
                  }
                />
              ))}
            </FilterSection>
            <FilterSection title="予算（1人あたり）">
              {BUDGET_RANGES.map((b) => (
                <FilterChip
                  key={b.id}
                  label={b.label}
                  selected={filters.budgets.includes(b.id)}
                  onToggle={() =>
                    setFilters((f) => ({
                      ...f,
                      budgets: toggleValue(f.budgets, b.id),
                    }))
                  }
                />
              ))}
            </FilterSection>
            <FilterSection title="時間帯">
              {TIMES.map((t) => (
                <FilterChip
                  key={t}
                  label={TIME_LABELS[t]}
                  selected={filters.times.includes(t)}
                  onToggle={() =>
                    setFilters((f) => ({
                      ...f,
                      times: toggleValue(f.times, t),
                    }))
                  }
                />
              ))}
            </FilterSection>
            <FilterSection title="シーン">
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  label={CATEGORY_LABELS[c]}
                  selected={filters.scenes.includes(c)}
                  onToggle={() =>
                    setFilters((f) => ({
                      ...f,
                      scenes: toggleValue(f.scenes, c),
                    }))
                  }
                />
              ))}
            </FilterSection>
            <FilterSection title="所要時間">
              {DURATION_RANGES.map((d) => (
                <FilterChip
                  key={d.id}
                  label={d.label}
                  selected={filters.durations.includes(d.id)}
                  onToggle={() =>
                    setFilters((f) => ({
                      ...f,
                      durations: toggleValue(f.durations, d.id),
                    }))
                  }
                />
              ))}
            </FilterSection>
            {(filterCount > 0 || filters.keyword !== "") && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="inline-flex items-center gap-1 text-sm text-[var(--dd-gray)] underline"
              >
                <X className="h-4 w-4" aria-hidden />
                条件をクリア
              </button>
            )}
          </div>
        )}

        <p className="text-sm text-[var(--dd-gray)]">
          {results.length}件のデートが見つかりました
        </p>

        {results.length === 0 ? (
          <EmptyState
            title="条件に合うデートがありません"
            description="キーワードや絞り込み条件を変えて試してください。"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.map((plan) => (
              <DateCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  );
}
