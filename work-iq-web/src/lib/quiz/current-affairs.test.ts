import { describe, expect, it } from "vitest";
import type { CurrentAffairsBatch, Question } from "@/lib/domain/types";
import { sourceInfoSchema } from "@/lib/domain/schemas";
import { getFreshCurrentAffairs, hasFreshCurrentAffairs } from "./current-affairs";

function makeCaQuestion(id: string, withSource = true): Question {
  return {
    id,
    category: "current_affairs",
    level: "beginner",
    mode: "single_correct",
    prompt: "時事問題",
    choices: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
    correctChoiceId: "a",
    explanation: "解説",
    choiceExplanations: { a: "a", b: "b", c: "c", d: "d" },
    tags: ["news"],
    source: withSource
      ? {
          title: "出典",
          url: "https://example.com/article",
          publishedAt: "2026-08-20",
          checkedAt: "2026-08-21T09:00:00+09:00",
        }
      : undefined,
  };
}

function makeBatch(date: string, count = 5): CurrentAffairsBatch {
  return {
    batchDate: date,
    questions: Array.from({ length: count }, (_, i) =>
      makeCaQuestion(`ca-${date}-${i}`),
    ),
  };
}

describe("getFreshCurrentAffairs", () => {
  it("returns today's batch questions", () => {
    const batches = [makeBatch("2026-08-20"), makeBatch("2026-08-21")];
    const fresh = getFreshCurrentAffairs(batches, "2026-08-21");
    expect(fresh).toHaveLength(5);
    expect(fresh.every((q) => q.id.includes("2026-08-21"))).toBe(true);
  });

  it("never surfaces a stale batch as today", () => {
    const batches = [makeBatch("2026-08-19"), makeBatch("2026-08-20")];
    expect(getFreshCurrentAffairs(batches, "2026-08-21")).toHaveLength(0);
    expect(hasFreshCurrentAffairs(batches, "2026-08-21")).toBe(false);
  });

  it("handles the empty state gracefully", () => {
    expect(getFreshCurrentAffairs([], "2026-08-21")).toEqual([]);
    expect(hasFreshCurrentAffairs([], "2026-08-21")).toBe(false);
  });

  it("filters out questions missing a source", () => {
    const batch: CurrentAffairsBatch = {
      batchDate: "2026-08-21",
      questions: [
        makeCaQuestion("ca-1"),
        makeCaQuestion("ca-2", false),
      ],
    };
    const fresh = getFreshCurrentAffairs([batch], "2026-08-21");
    expect(fresh.map((q) => q.id)).toEqual(["ca-1"]);
  });
});

describe("source date parsing", () => {
  it("accepts valid publishedAt/checkedAt values", () => {
    const parsed = sourceInfoSchema.safeParse({
      title: "出典",
      url: "https://example.com/a",
      publishedAt: "2026-08-20",
      eventDate: "2026-08-19",
      checkedAt: "2026-08-21T09:00:00+09:00",
    });
    expect(parsed.success).toBe(true);
    expect(Number.isNaN(Date.parse("2026-08-21T09:00:00+09:00"))).toBe(false);
  });

  it("rejects malformed dates", () => {
    const parsed = sourceInfoSchema.safeParse({
      title: "出典",
      url: "https://example.com/a",
      publishedAt: "20 Aug 2026",
      checkedAt: "2026-08-21T09:00:00+09:00",
    });
    expect(parsed.success).toBe(false);
  });
});
