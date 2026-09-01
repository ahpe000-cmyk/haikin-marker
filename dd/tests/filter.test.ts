import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, matchesFilters, searchPlans } from "@/lib/filter";
import { PLANS, PLAN_MAP } from "@/data/plans";

const ebisuNight = PLAN_MAP["d1"]; // 恵比寿 / night / ¥8,000〜¥12,000 / 240分

describe("search/filter", () => {
  it("returns everything with empty filters", () => {
    expect(searchPlans(PLANS, EMPTY_FILTERS)).toHaveLength(PLANS.length);
  });

  it("matches keyword against title, area label and tags", () => {
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, keyword: "恵比寿" }),
    ).toBe(true);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, keyword: "夜景" }),
    ).toBe(true);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, keyword: "存在しない語" }),
    ).toBe(false);
  });

  it("filters by area", () => {
    const results = searchPlans(PLANS, { ...EMPTY_FILTERS, areas: ["ebisu"] });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.area === "ebisu")).toBe(true);
  });

  it("filters by budget range overlap", () => {
    // d1 は ¥8,000〜¥12,000 → 「¥5,000〜¥10,000」(b3) と重なる
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, budgets: ["b3"] }),
    ).toBe(true);
    // 「〜¥3,000」(b1) とは重ならない
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, budgets: ["b1"] }),
    ).toBe(false);
  });

  it("filters by time of day and scene", () => {
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, times: ["night"] }),
    ).toBe(true);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, times: ["lunch"] }),
    ).toBe(false);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, scenes: ["first-date"] }),
    ).toBe(true);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, scenes: ["rainy-day"] }),
    ).toBe(false);
  });

  it("filters by duration range", () => {
    // d1 は 240分 → 「2〜4h」(medium) に含まれ、「〜2h」(short) には含まれない
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, durations: ["medium"] }),
    ).toBe(true);
    expect(
      matchesFilters(ebisuNight, { ...EMPTY_FILTERS, durations: ["short"] }),
    ).toBe(false);
  });

  it("combines multiple filter groups with AND", () => {
    const results = searchPlans(PLANS, {
      ...EMPTY_FILTERS,
      areas: ["ebisu"],
      times: ["night"],
    });
    expect(results.map((p) => p.id)).toContain("d1");
    expect(
      results.every((p) => p.area === "ebisu" && p.timeOfDay === "night"),
    ).toBe(true);
  });
});
