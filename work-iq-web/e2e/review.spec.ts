import { expect, test } from "@playwright/test";
import { answerCurrentQuestion, answerKey, clickNext, jstDateKey, loadContent } from "./helpers";

const judgment = loadContent("judgment.json");
const key = answerKey(judgment);
const reviewQuestion = judgment[0];

function seededProgress() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return {
    version: 1,
    anonId: "e2e-review-device-0001",
    stepUnlocks: { business_terms: 1, judgment: 1, risk: 1 },
    sessions: [
      {
        id: `${yesterday}-daily-e2e1`,
        kind: "daily",
        dateKey: yesterday,
        questionIds: [reviewQuestion.id],
        answers: [
          {
            questionId: reviewQuestion.id,
            category: "judgment",
            mode: reviewQuestion.mode,
            selectedChoiceId: "a",
            isCorrect: false,
            weight: 1.25,
          },
        ],
        completedAt: new Date().toISOString(),
        sessionScore: 40,
      },
    ],
    answerHistory: [
      {
        questionId: reviewQuestion.id,
        category: "judgment",
        isCorrect: false,
        weight: 1.25,
        dateKey: yesterday,
      },
    ],
    streak: { current: 1, lastDateKey: yesterday },
    reviewQueue: [
      {
        questionId: reviewQuestion.id,
        category: "judgment",
        intervalIndex: 0,
        dueDateKey: jstDateKey(),
        addedDateKey: yesterday,
      },
    ],
    recentQuestions: [{ id: reviewQuestion.id, dateKey: yesterday }],
    pollVotes: {},
  };
}

test("due review items surface on home and can be completed", async ({
  page,
}) => {
  const progress = seededProgress();
  await page.addInitScript((state) => {
    // Seed once; later navigations keep the app's own updates.
    if (!window.localStorage.getItem("work-iq-progress-v1")) {
      window.localStorage.setItem("work-iq-progress-v1", JSON.stringify(state));
    }
  }, progress);

  await page.goto("/");
  await expect(page.getByText("昨日の振り返り")).toBeVisible();
  await expect(page.getByText(/復習が1問たまっています/)).toBeVisible();
  await page.getByRole("link", { name: "昨日の間違いを復習" }).click();

  await expect(page).toHaveURL(/\/quiz\/review/);
  await expect(
    page.getByRole("heading", { name: reviewQuestion.prompt }),
  ).toBeVisible();

  await answerCurrentQuestion(page, { correctly: true, key });
  await clickNext(page);
  await expect(page).toHaveURL(/\/result\//);

  // A correct review advances the schedule: nothing due anymore.
  await page.goto("/quiz/review");
  await expect(page.getByText("今日の復習はありません")).toBeVisible();
});

test("no review card appears when nothing is due", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("昨日の振り返り")).toHaveCount(0);
});
