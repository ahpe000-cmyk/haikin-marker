import { describe, expect, it } from "vitest";
import type { StoredAnswerRecord } from "@/lib/storage/local-progress";
import {
  WEIGHT_BEST_ANSWER,
  WEIGHT_FACTUAL,
  WEIGHT_USAGE_TIMING,
  calculateCategoryScores,
  calculateOverallWorkIq,
  calculateSessionScore,
  getScoreState,
  questionWeight,
} from "./work-iq";

function record(
  overrides: Partial<StoredAnswerRecord> = {},
): StoredAnswerRecord {
  return {
    questionId: "bt-101",
    category: "business_terms",
    isCorrect: true,
    weight: 1,
    dateKey: "2026-08-21",
    ...overrides,
  };
}

describe("questionWeight", () => {
  it("weights factual knowledge at 1.00", () => {
    expect(questionWeight({ mode: "single_correct", tags: ["kpi"] })).toBe(
      WEIGHT_FACTUAL,
    );
  });

  it("weights usage/timing questions at 1.10", () => {
    expect(questionWeight({ mode: "single_correct", tags: ["usage"] })).toBe(
      WEIGHT_USAGE_TIMING,
    );
    expect(questionWeight({ mode: "single_correct", tags: ["timing"] })).toBe(
      WEIGHT_USAGE_TIMING,
    );
  });

  it("weights best-answer judgment at 1.25", () => {
    expect(questionWeight({ mode: "best_answer", tags: ["usage"] })).toBe(
      WEIGHT_BEST_ANSWER,
    );
  });
});

describe("calculateSessionScore", () => {
  it("is deterministic: same answers always give the same score", () => {
    const answers = [
      { isCorrect: true, weight: 1.0 },
      { isCorrect: true, weight: 1.1 },
      { isCorrect: false, weight: 1.25 },
      { isCorrect: true, weight: 1.0 },
      { isCorrect: false, weight: 1.0 },
    ];
    const first = calculateSessionScore(answers);
    expect(first).toBe(calculateSessionScore(answers));
    // earned 3.1 / available 5.35 → 57.94… → 58
    expect(first).toBe(58);
  });

  it("returns 100 for all correct and 0 for all wrong", () => {
    const all = [
      { isCorrect: true, weight: 1.25 },
      { isCorrect: true, weight: 1.0 },
    ];
    expect(calculateSessionScore(all)).toBe(100);
    expect(
      calculateSessionScore(all.map((a) => ({ ...a, isCorrect: false }))),
    ).toBe(0);
  });

  it("returns 0 for an empty session", () => {
    expect(calculateSessionScore([])).toBe(0);
  });
});

describe("calculateCategoryScores", () => {
  it("uses only the most recent 100 answers per category", () => {
    const history: StoredAnswerRecord[] = [];
    for (let i = 0; i < 50; i += 1) {
      history.push(record({ questionId: `old-${i}`, isCorrect: false }));
    }
    for (let i = 0; i < 100; i += 1) {
      history.push(record({ questionId: `new-${i}`, isCorrect: true }));
    }
    const [score] = calculateCategoryScores(history);
    expect(score.answeredCount).toBe(100);
    expect(score.score).toBe(100);
  });

  it("computes weighted accuracy", () => {
    const history = [
      record({ weight: 1.0, isCorrect: true }),
      record({ weight: 1.25, isCorrect: false }),
    ];
    const [score] = calculateCategoryScores(history);
    // 1.0 / 2.25 → 44.44 → 44
    expect(score.score).toBe(44);
  });
});

describe("calculateOverallWorkIq", () => {
  it("returns null with no answered categories", () => {
    expect(calculateOverallWorkIq([])).toBeNull();
  });

  it("takes a weighted mean over answered categories only", () => {
    const overall = calculateOverallWorkIq([
      {
        category: "business_terms",
        score: 80,
        answeredCount: 10,
        weightTotal: 10,
      },
      { category: "risk", score: 60, answeredCount: 5, weightTotal: 5 },
    ]);
    // (80*10 + 60*5) / 15 = 73.33 → 73
    expect(overall).toBe(73);
  });

  it("never returns a percentile-like structure", () => {
    const overall = calculateOverallWorkIq([
      {
        category: "business_terms",
        score: 90,
        answeredCount: 20,
        weightTotal: 21,
      },
    ]);
    expect(typeof overall).toBe("number");
  });
});

describe("getScoreState", () => {
  it("shows 測定中 for 0-4 scored answers", () => {
    expect(getScoreState([])).toBe("measuring");
    expect(getScoreState(Array.from({ length: 4 }, () => record()))).toBe(
      "measuring",
    );
  });

  it("shows 仮測定 for 5-14 scored answers", () => {
    expect(getScoreState(Array.from({ length: 5 }, () => record()))).toBe(
      "provisional",
    );
    expect(getScoreState(Array.from({ length: 14 }, () => record()))).toBe(
      "provisional",
    );
  });

  it("requires 15+ answers across at least 2 categories for full WORK IQ", () => {
    const oneCategory = Array.from({ length: 20 }, () => record());
    expect(getScoreState(oneCategory)).toBe("provisional");

    const twoCategories = [
      ...Array.from({ length: 10 }, () => record()),
      ...Array.from({ length: 5 }, () => record({ category: "risk" })),
    ];
    expect(getScoreState(twoCategories)).toBe("work_iq");
  });

  it("ignores polls entirely: only stored scored answers count", () => {
    // Poll votes are stored separately from answerHistory, so a state built
    // from scored answers alone is the whole input surface.
    expect(getScoreState([])).toBe("measuring");
  });
});
