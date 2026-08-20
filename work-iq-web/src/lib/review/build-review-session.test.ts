import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/domain/types";
import { createInitialProgress } from "@/lib/storage/local-progress";
import { buildReviewQuestions } from "./build-review-session";

function makeQuestion(id: string): Question {
  return {
    id,
    category: "judgment",
    level: "beginner",
    step: 1,
    mode: "single_correct",
    prompt: "問題",
    choices: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
    correctChoiceId: "a",
    explanation: "解説",
    choiceExplanations: { a: "a", b: "b", c: "c", d: "d" },
    tags: [],
  };
}

const allQuestions = ["jd-101", "jd-102", "jd-103"].map(makeQuestion);

describe("buildReviewQuestions", () => {
  it("selects only due items by JST date", () => {
    const progress = createInitialProgress();
    progress.reviewQueue = [
      {
        questionId: "jd-101",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-21",
        addedDateKey: "2026-08-20",
      },
      {
        questionId: "jd-102",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-25",
        addedDateKey: "2026-08-20",
      },
    ];
    const questions = buildReviewQuestions(progress, allQuestions, "2026-08-21");
    expect(questions.map((q) => q.id)).toEqual(["jd-101"]);
  });

  it("returns nothing when no items are due", () => {
    const progress = createInitialProgress();
    progress.reviewQueue = [
      {
        questionId: "jd-101",
        category: "judgment",
        intervalIndex: 1,
        dueDateKey: "2026-09-01",
        addedDateKey: "2026-08-20",
      },
    ];
    expect(
      buildReviewQuestions(progress, allQuestions, "2026-08-21"),
    ).toHaveLength(0);
  });

  it("skips questions missing from content and duplicate entries", () => {
    const progress = createInitialProgress();
    progress.reviewQueue = [
      {
        questionId: "gone-999",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-20",
        addedDateKey: "2026-08-19",
      },
      {
        questionId: "jd-102",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-20",
        addedDateKey: "2026-08-19",
      },
      {
        questionId: "jd-102",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-21",
        addedDateKey: "2026-08-20",
      },
    ];
    const questions = buildReviewQuestions(progress, allQuestions, "2026-08-21");
    expect(questions.map((q) => q.id)).toEqual(["jd-102"]);
  });

  it("orders oldest due items first", () => {
    const progress = createInitialProgress();
    progress.reviewQueue = [
      {
        questionId: "jd-103",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-21",
        addedDateKey: "2026-08-20",
      },
      {
        questionId: "jd-101",
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: "2026-08-19",
        addedDateKey: "2026-08-18",
      },
    ];
    const questions = buildReviewQuestions(progress, allQuestions, "2026-08-21");
    expect(questions.map((q) => q.id)).toEqual(["jd-101", "jd-103"]);
  });
});
