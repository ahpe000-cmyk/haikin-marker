import { describe, expect, it } from "vitest";
import type { ChoiceId, Question, QuizSession } from "@/lib/domain/types";
import { createInitialProgress } from "@/lib/storage/local-progress";
import {
  advanceStreak,
  applyCompletedSession,
  completeSession,
  createSession,
  isStepPassed,
  scoreAnswer,
} from "./session";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "bt-101",
    category: "business_terms",
    level: "beginner",
    step: 1,
    mode: "single_correct",
    prompt: "問題文",
    choices: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
    correctChoiceId: "b",
    explanation: "解説",
    choiceExplanations: { a: "a", b: "b", c: "c", d: "d" },
    tags: [],
    ...overrides,
  };
}

function completedStepSession(correct: number): QuizSession {
  const questions = Array.from({ length: 5 }, (_, i) =>
    makeQuestion({ id: `jd-10${i + 1}`, category: "judgment" }),
  );
  const session = createSession({
    kind: "step",
    questions,
    dateKey: "2026-08-21",
    category: "judgment",
    step: 1,
  });
  session.answers = questions.map((q, i) =>
    scoreAnswer(q, (i < correct ? "b" : "a") as ChoiceId),
  );
  return completeSession(session);
}

describe("scoreAnswer", () => {
  it("marks correct single_correct answers", () => {
    const answer = scoreAnswer(makeQuestion(), "b");
    expect(answer.isCorrect).toBe(true);
    expect(answer.weight).toBe(1.0);
  });

  it("scores best_answer against the recommended choice with weight 1.25", () => {
    const question = makeQuestion({
      mode: "best_answer",
      correctChoiceId: undefined,
      recommendedChoiceId: "c",
    });
    expect(scoreAnswer(question, "c").isCorrect).toBe(true);
    expect(scoreAnswer(question, "b").isCorrect).toBe(false);
    expect(scoreAnswer(question, "c").weight).toBe(1.25);
  });
});

describe("STEP unlock", () => {
  it("4/5 passes and unlocks the next STEP", () => {
    const session = completedStepSession(4);
    expect(isStepPassed(session)).toBe(true);
    const progress = applyCompletedSession(createInitialProgress(), session);
    expect(progress.stepUnlocks.judgment).toBe(2);
  });

  it("3/5 does not unlock the next STEP", () => {
    const session = completedStepSession(3);
    expect(isStepPassed(session)).toBe(false);
    const progress = applyCompletedSession(createInitialProgress(), session);
    expect(progress.stepUnlocks.judgment).toBe(1);
  });

  it("never lowers an already unlocked STEP", () => {
    const initial = createInitialProgress();
    initial.stepUnlocks.judgment = 4;
    const progress = applyCompletedSession(initial, completedStepSession(4));
    expect(progress.stepUnlocks.judgment).toBe(4);
  });
});

describe("streak (JST dates)", () => {
  it("starts at 1 on the first completed session", () => {
    expect(advanceStreak({ current: 0, lastDateKey: null }, "2026-08-21")).toEqual({
      current: 1,
      lastDateKey: "2026-08-21",
    });
  });

  it("increments on consecutive JST days", () => {
    expect(
      advanceStreak({ current: 3, lastDateKey: "2026-08-21" }, "2026-08-22"),
    ).toEqual({ current: 4, lastDateKey: "2026-08-22" });
  });

  it("does not double count the same day", () => {
    expect(
      advanceStreak({ current: 3, lastDateKey: "2026-08-21" }, "2026-08-21"),
    ).toEqual({ current: 3, lastDateKey: "2026-08-21" });
  });

  it("resets after a missed day", () => {
    expect(
      advanceStreak({ current: 9, lastDateKey: "2026-08-21" }, "2026-08-23"),
    ).toEqual({ current: 1, lastDateKey: "2026-08-23" });
  });

  it("is only advanced by 5-question scored sessions", () => {
    const question = makeQuestion();
    const session = createSession({
      kind: "review",
      questions: [question],
      dateKey: "2026-08-21",
    });
    session.answers = [scoreAnswer(question, "b")];
    const progress = applyCompletedSession(
      createInitialProgress(),
      completeSession(session),
    );
    expect(progress.streak.current).toBe(0);
  });
});

describe("applyCompletedSession", () => {
  it("adds wrong answers to the review queue due next day", () => {
    const session = completedStepSession(3);
    const progress = applyCompletedSession(createInitialProgress(), session);
    expect(progress.reviewQueue).toHaveLength(2);
    expect(progress.reviewQueue[0].dueDateKey).toBe("2026-08-22");
  });

  it("records answer history and recent questions", () => {
    const session = completedStepSession(5);
    const progress = applyCompletedSession(createInitialProgress(), session);
    expect(progress.answerHistory).toHaveLength(5);
    expect(progress.recentQuestions).toHaveLength(5);
    expect(progress.sessions).toHaveLength(1);
  });

  it("advances review scheduling for review sessions", () => {
    let progress = applyCompletedSession(
      createInitialProgress(),
      completedStepSession(3),
    );
    const dueQuestionId = progress.reviewQueue[0].questionId;
    const question = makeQuestion({ id: dueQuestionId, category: "judgment" });
    const review = createSession({
      kind: "review",
      questions: [question],
      dateKey: "2026-08-22",
    });
    review.answers = [scoreAnswer(question, "b")];
    progress = applyCompletedSession(progress, completeSession(review));
    const item = progress.reviewQueue.find(
      (entry) => entry.questionId === dueQuestionId,
    );
    expect(item?.intervalIndex).toBe(1);
    expect(item?.dueDateKey).toBe("2026-08-25");
  });
});
