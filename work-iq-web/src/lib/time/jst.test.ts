import { describe, expect, it } from "vitest";
import { addDaysToDateKey, diffDateKeys, getJstDateKey } from "./jst";

describe("getJstDateKey", () => {
  it("formats a date as YYYY-MM-DD in JST", () => {
    // 2026-08-20T15:30:00Z = 2026-08-21T00:30 JST
    expect(getJstDateKey(new Date("2026-08-20T15:30:00Z"))).toBe("2026-08-21");
  });

  it("stays on the same JST day before midnight JST", () => {
    // 2026-08-20T14:59:00Z = 2026-08-20T23:59 JST
    expect(getJstDateKey(new Date("2026-08-20T14:59:00Z"))).toBe("2026-08-20");
  });

  it("rolls over exactly at midnight JST", () => {
    expect(getJstDateKey(new Date("2026-12-31T15:00:00Z"))).toBe("2027-01-01");
  });
});

describe("addDaysToDateKey", () => {
  it("adds days across month boundaries", () => {
    expect(addDaysToDateKey("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("supports the review intervals", () => {
    expect(addDaysToDateKey("2026-08-21", 1)).toBe("2026-08-22");
    expect(addDaysToDateKey("2026-08-21", 30)).toBe("2026-09-20");
  });
});

describe("diffDateKeys", () => {
  it("returns signed day difference", () => {
    expect(diffDateKeys("2026-08-22", "2026-08-21")).toBe(1);
    expect(diffDateKeys("2026-08-21", "2026-08-22")).toBe(-1);
    expect(diffDateKeys("2026-08-21", "2026-08-21")).toBe(0);
  });
});
