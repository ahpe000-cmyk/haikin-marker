import { AREA_LABELS, BUDGET_RANGES, DURATION_RANGES } from "@/data/meta";
import type { DatePlan, SearchFilters } from "@/types";

export const EMPTY_FILTERS: SearchFilters = {
  keyword: "",
  areas: [],
  budgets: [],
  times: [],
  scenes: [],
  durations: [],
};

export function activeFilterCount(f: SearchFilters): number {
  return (
    f.areas.length +
    f.budgets.length +
    f.times.length +
    f.scenes.length +
    f.durations.length
  );
}

function matchesKeyword(plan: DatePlan, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (q === "") return true;
  const haystack = [
    plan.title,
    plan.description,
    AREA_LABELS[plan.area],
    ...plan.tags,
    ...plan.stops.map((s) => s.name),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

function overlaps(
  min: number,
  max: number,
  rangeMin: number,
  rangeMax: number | null,
): boolean {
  return max >= rangeMin && (rangeMax === null || min <= rangeMax);
}

export function matchesFilters(plan: DatePlan, f: SearchFilters): boolean {
  if (!matchesKeyword(plan, f.keyword)) return false;
  if (f.areas.length > 0 && !f.areas.includes(plan.area)) return false;
  if (f.times.length > 0 && !f.times.includes(plan.timeOfDay)) return false;
  if (
    f.scenes.length > 0 &&
    !f.scenes.some((scene) => plan.categories.includes(scene))
  ) {
    return false;
  }
  if (f.budgets.length > 0) {
    const ok = f.budgets.some((id) => {
      const range = BUDGET_RANGES.find((r) => r.id === id);
      return range
        ? overlaps(plan.budgetMin, plan.budgetMax, range.min, range.max)
        : false;
    });
    if (!ok) return false;
  }
  if (f.durations.length > 0) {
    const ok = f.durations.some((id) => {
      const range = DURATION_RANGES.find((r) => r.id === id);
      return range
        ? plan.durationMinutes >= range.minMinutes &&
            (range.maxMinutes === null ||
              plan.durationMinutes <= range.maxMinutes)
        : false;
    });
    if (!ok) return false;
  }
  return true;
}

export function searchPlans(plans: DatePlan[], f: SearchFilters): DatePlan[] {
  return plans.filter((p) => matchesFilters(p, f));
}
