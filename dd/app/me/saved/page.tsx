"use client";

import { AppHeader } from "@/components/dd/AppHeader";
import { AppShell } from "@/components/dd/AppShell";
import { DateCard } from "@/components/dd/DateCard";
import { EmptyState } from "@/components/dd/States";
import { useDemoStore } from "@/hooks/useDemoStore";
import type { DatePlan } from "@/types";

// SCREEN 12: Saved Dates
export default function SavedDatesPage() {
  const { state, getPlan } = useDemoStore();
  const savedPlans = state.savedDates
    .map((s) => getPlan(s.planId))
    .filter((p): p is DatePlan => p !== undefined);

  return (
    <AppShell>
      <AppHeader showBack title="保存したデート" />
      <main className="space-y-4 px-4 py-4">
        <p className="text-sm text-[var(--dd-gray)]">
          {savedPlans.length}件のデートを保存しています
        </p>
        {savedPlans.length === 0 ? (
          <EmptyState
            title="保存したデートがありません"
            description="気になるデートをブックマークするとここに表示されます。"
            actionLabel="デートを探す"
            actionHref="/search"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {savedPlans.map((plan) => (
              <DateCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
