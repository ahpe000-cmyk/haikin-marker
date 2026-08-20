import { describe, expect, it } from "vitest";
import type { Category, Question, Step } from "@/lib/domain/types";
import { getStepQuestions, selectDailyQuestions } from "./select-questions";

function makePool(
  category: Category,
  prefix: string,
  count: number,
): Question[] {
  return Array.from({ length: count }, (_, i) => {
    const step = ((i % 5) + 1) as Step;
    return {
      id: `${prefix}-${step}0${Math.floor(i / 5) + 1}`,
      category,
      level: "beginner" as const,
      step: category === "current_affairs" ? undefined : step,
      mode: "single_correct" as const,
      prompt: `問題${i}`,
      choices: [
        { id: "a" as const, text: "A" },
        { id: "b" as const, text: "B" },
        { id: "c" as const, text: "C" },
        { id: "d" as const, text: "D" },
      ],
      correctChoiceId: "a" as const,
      explanation: "解説",
      choiceExplanations: { a: "a", b: "b", c: "c", d: "d" },
      tags: [],
    };
  });
}

const businessTerms = makePool("business_terms", "bt", 25);
const judgment = makePool("judgment", "jd", 25);
const risk = makePool("risk", "rk", 25);
const currentAffairs = makePool("current_affairs", "ca", 5);

describe("selectDailyQuestions", () => {
  it("returns the preferred mix with fresh current affairs", () => {
    const questions = selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: [],
      seed: "user-2026-08-21",
    });
    expect(questions).toHaveLength(5);
    const byCategory = questions.map((q) => q.category);
    expect(byCategory.filter((c) => c === "business_terms")).toHaveLength(2);
    expect(byCategory.filter((c) => c === "judgment")).toHaveLength(1);
    expect(byCategory.filter((c) => c === "risk")).toHaveLength(1);
    expect(byCategory.filter((c) => c === "current_affairs")).toHaveLength(1);
  });

  it("falls back to judgment/risk when no fresh current affairs exists", () => {
    const questions = selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs: [],
      recentQuestionIds: [],
      seed: "user-2026-08-21",
    });
    expect(questions).toHaveLength(5);
    expect(
      questions.filter((q) => q.category === "current_affairs"),
    ).toHaveLength(0);
    expect(
      questions.filter(
        (q) => q.category === "judgment" || q.category === "risk",
      ),
    ).toHaveLength(3);
  });

  it("is deterministic for the same seed and differs across seeds", () => {
    const input = {
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: [],
      seed: "seed-a",
    };
    const first = selectDailyQuestions(input).map((q) => q.id);
    const second = selectDailyQuestions(input).map((q) => q.id);
    expect(second).toEqual(first);

    const other = selectDailyQuestions({ ...input, seed: "seed-b" }).map(
      (q) => q.id,
    );
    expect(other).not.toEqual(first);
  });

  it("avoids questions answered in the last 7 days when the pool permits", () => {
    const recent = businessTerms.slice(0, 20).map((q) => q.id);
    const questions = selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: recent,
      seed: "user-2026-08-21",
    });
    const chosenBt = questions.filter((q) => q.category === "business_terms");
    for (const q of chosenBt) {
      expect(recent).not.toContain(q.id);
    }
  });

  it("still fills the session when everything is recent", () => {
    const allIds = [...businessTerms, ...judgment, ...risk, ...currentAffairs].map(
      (q) => q.id,
    );
    const questions = selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: allIds,
      seed: "user-2026-08-21",
    });
    expect(questions).toHaveLength(5);
  });

  it("never repeats a question inside one session", () => {
    const questions = selectDailyQuestions({
      businessTerms,
      judgment,
      risk,
      currentAffairs,
      recentQuestionIds: [],
      seed: "dup-check",
    });
    expect(new Set(questions.map((q) => q.id)).size).toBe(5);
  });
});

describe("getStepQuestions", () => {
  it("returns exactly the 5 questions of a STEP in stable order", () => {
    const step2 = getStepQuestions(judgment, "judgment", 2);
    expect(step2).toHaveLength(5);
    expect(step2.every((q) => q.step === 2)).toBe(true);
    expect(step2.map((q) => q.id)).toEqual(
      [...step2.map((q) => q.id)].sort(),
    );
  });

  it("returns nothing for another category's pool", () => {
    expect(getStepQuestions(judgment, "risk", 1)).toHaveLength(0);
  });
});
