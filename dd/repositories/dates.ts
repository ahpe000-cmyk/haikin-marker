/**
 * Mock repository for structured dates. See repositories/actors.ts for the swap note.
 */
import type { DateExperience, DateScene } from "@/types";
import { mockDates } from "@/data/mock";

export function getMockDate(id: string): DateExperience | undefined {
  return mockDates.find((d) => d.id === id);
}

export function listMockDates(): DateExperience[] {
  return mockDates;
}

export interface DateFilter {
  query?: string;
  area?: string;
  scene?: DateScene;
  /** Budget bucket: [min, max] per person. max = Infinity for the last bucket. */
  budget?: [number, number];
  maxDurationMinutes?: number;
}

export function filterDates(dates: DateExperience[], filter: DateFilter): DateExperience[] {
  const q = filter.query?.trim().toLowerCase() ?? "";
  return dates.filter((d) => {
    if (filter.area && d.area !== filter.area) return false;
    if (filter.scene && d.scene !== filter.scene) return false;
    if (filter.budget) {
      const [min, max] = filter.budget;
      // Overlap check between the date's budget range and the bucket
      if (d.budgetMax < min || d.budgetMin > max) return false;
    }
    if (
      filter.maxDurationMinutes !== undefined &&
      d.durationMinutes > filter.maxDurationMinutes
    )
      return false;
    if (q) {
      const haystack = [d.title, d.area, ...d.tags, ...d.timeline.map((s) => s.placeName)]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
