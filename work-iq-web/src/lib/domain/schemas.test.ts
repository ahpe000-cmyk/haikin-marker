import { describe, expect, it } from "vitest";
import { dailyPollSchema, questionSchema } from "./schemas";

const validChoices = [
  { id: "a", text: "選択肢A" },
  { id: "b", text: "選択肢B" },
  { id: "c", text: "選択肢C" },
  { id: "d", text: "選択肢D" },
];

const validChoiceExplanations = {
  a: "Aの解説",
  b: "Bの解説",
  c: "Cの解説",
  d: "Dの解説",
};

const baseQuestion = {
  id: "bt-001",
  category: "business_terms",
  level: "beginner",
  step: 1,
  mode: "single_correct",
  prompt: "KPIの意味として最も適切なものはどれ？",
  choices: validChoices,
  correctChoiceId: "b",
  explanation: "KPIは重要業績評価指標を指します。",
  choiceExplanations: validChoiceExplanations,
  tags: ["kpi"],
};

describe("questionSchema", () => {
  it("accepts a valid single_correct question", () => {
    expect(questionSchema.safeParse(baseQuestion).success).toBe(true);
  });

  it("rejects a question without exactly four choices", () => {
    const threeChoices = {
      ...baseQuestion,
      choices: validChoices.slice(0, 3),
    };
    expect(questionSchema.safeParse(threeChoices).success).toBe(false);

    const fiveChoices = {
      ...baseQuestion,
      choices: [...validChoices, { id: "a", text: "重複" }],
    };
    expect(questionSchema.safeParse(fiveChoices).success).toBe(false);
  });

  it("rejects duplicate choice ids", () => {
    const duplicated = {
      ...baseQuestion,
      choices: [
        { id: "a", text: "1" },
        { id: "a", text: "2" },
        { id: "c", text: "3" },
        { id: "d", text: "4" },
      ],
    };
    expect(questionSchema.safeParse(duplicated).success).toBe(false);
  });

  it("requires correctChoiceId for single_correct", () => {
    const { correctChoiceId: _omitted, ...rest } = baseQuestion;
    expect(questionSchema.safeParse(rest).success).toBe(false);
  });

  it("requires recommendedChoiceId for best_answer", () => {
    const { correctChoiceId: _omitted, ...rest } = baseQuestion;
    const bestAnswer = { ...rest, mode: "best_answer" };
    expect(questionSchema.safeParse(bestAnswer).success).toBe(false);

    const valid = { ...bestAnswer, recommendedChoiceId: "c" };
    expect(questionSchema.safeParse(valid).success).toBe(true);
  });

  it("requires source for current_affairs", () => {
    const currentAffairs = {
      ...baseQuestion,
      id: "ca-001",
      category: "current_affairs",
      step: undefined,
    };
    expect(questionSchema.safeParse(currentAffairs).success).toBe(false);

    const withSource = {
      ...currentAffairs,
      source: {
        title: "出典タイトル",
        url: "https://example.com/news",
        publishedAt: "2026-08-20",
        checkedAt: "2026-08-21T09:00:00+09:00",
      },
    };
    expect(questionSchema.safeParse(withSource).success).toBe(true);
  });

  it("rejects a non-HTTPS current-affairs source URL", () => {
    const httpSource = {
      ...baseQuestion,
      id: "ca-002",
      category: "current_affairs",
      source: {
        title: "出典タイトル",
        url: "http://example.com/news",
        publishedAt: "2026-08-20",
        checkedAt: "2026-08-21T09:00:00+09:00",
      },
    };
    expect(questionSchema.safeParse(httpSource).success).toBe(false);
  });

  it("requires an explanation for every choice", () => {
    const missing = {
      ...baseQuestion,
      choiceExplanations: { a: "A", b: "B", c: "C" },
    };
    expect(questionSchema.safeParse(missing).success).toBe(false);
  });
});

describe("dailyPollSchema", () => {
  const basePoll = {
    id: "poll-2026-08-21",
    date: "2026-08-21",
    prompt: "会議で意見が割れたら、あなたならどうする？",
    choices: validChoices,
    tags: ["communication"],
    thinkingPoints: ["目的は勝ち負けではなく合意形成です。"],
  };

  it("accepts a valid poll", () => {
    expect(dailyPollSchema.safeParse(basePoll).success).toBe(true);
  });

  it("rejects a poll that declares a correct answer", () => {
    const withCorrect = { ...basePoll, correctChoiceId: "a" };
    expect(dailyPollSchema.safeParse(withCorrect).success).toBe(false);

    const withRecommended = { ...basePoll, recommendedChoiceId: "a" };
    expect(dailyPollSchema.safeParse(withRecommended).success).toBe(false);
  });

  it("rejects an invalid date key", () => {
    const badDate = { ...basePoll, date: "2026/08/21" };
    expect(dailyPollSchema.safeParse(badDate).success).toBe(false);
  });

  it("accepts only known ctaHint values", () => {
    expect(
      dailyPollSchema.safeParse({ ...basePoll, ctaHint: "honne" }).success,
    ).toBe(true);
    expect(
      dailyPollSchema.safeParse({ ...basePoll, ctaHint: "stripe" }).success,
    ).toBe(false);
  });
});
