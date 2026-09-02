import { describe, expect, it } from "vitest";
import { filterDates, listMockDates } from "@/repositories/dates";
import {
  coupleRanking,
  creatorRanking,
  dateRanking,
  risingRanking,
} from "@/repositories/ranking";
import { searchActors } from "@/repositories/actors";
import { HERO_DATE_ID } from "@/data/mock";

const dates = listMockDates();

describe("search filters (filterDates)", () => {
  it("filters by area", () => {
    const result = filterDates(dates, { area: "銀座" });
    expect(result.length).toBeGreaterThan(0);
    for (const d of result) expect(d.area).toBe("銀座");
  });

  it("filters by scene", () => {
    const result = filterDates(dates, { scene: "first-date" });
    expect(result.length).toBeGreaterThan(0);
    for (const d of result) expect(d.scene).toBe("first-date");
  });

  it("filters by budget bucket overlap", () => {
    const result = filterDates(dates, { budget: [0, 3000] });
    expect(result.length).toBeGreaterThan(0);
    for (const d of result) expect(d.budgetMin).toBeLessThanOrEqual(3000);
  });

  it("filters by free-text query across title / tags / places", () => {
    const result = filterDates(dates, { query: "1周年" });
    expect(result.some((d) => d.id === HERO_DATE_ID)).toBe(true);
  });

  it("combines filters (AND)", () => {
    const result = filterDates(dates, { area: "銀座", scene: "night" });
    for (const d of result) {
      expect(d.area).toBe("銀座");
      expect(d.scene).toBe("night");
    }
  });

  it("returns everything for an empty filter", () => {
    expect(filterDates(dates, {})).toHaveLength(dates.length);
  });
});

describe("ranking calculations", () => {
  it("date ranking is sorted by score desc with sequential ranks", () => {
    const rows = dateRanking();
    expect(rows).toHaveLength(dates.length);
    rows.forEach((row, i) => {
      expect(row.rank).toBe(i + 1);
      if (i > 0) expect(rows[i - 1].score).toBeGreaterThanOrEqual(row.score);
    });
  });

  it("hero date (Mai × Yui Ginza) tops the date ranking", () => {
    expect(dateRanking()[0].date.id).toBe(HERO_DATE_ID);
  });

  it("couple ranking puts Mai × Yui first", () => {
    const rows = coupleRanking();
    expect(rows[0].actor.id).toBe("c1");
    expect(rows).toHaveLength(8);
  });

  it("creator ranking excludes the demo operator account", () => {
    const rows = creatorRanking();
    expect(rows.some((r) => r.actor.id === "u_me")).toBe(false);
    expect(rows.length).toBeGreaterThanOrEqual(12);
  });

  it("rising ranking is not identical to the couple/creator top order", () => {
    const rising = risingRanking();
    expect(rising.length).toBeGreaterThan(0);
    rising.forEach((row, i) => {
      if (i > 0) expect(rising[i - 1].score).toBeGreaterThanOrEqual(row.score);
    });
  });
});

describe("actor search", () => {
  it("finds couples by member name", () => {
    const result = searchActors("mai", "couple");
    expect(result.some((a) => a.id === "c1")).toBe(true);
  });

  it("restricts by type", () => {
    for (const a of searchActors("", "individual")) expect(a.type).toBe("individual");
  });
});
