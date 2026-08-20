import { expect, test } from "@playwright/test";
import { FIXTURE_POLL, mockPollApi } from "./helpers";

test("poll hides the aggregate until after voting", async ({ page }) => {
  await mockPollApi(page);
  await page.goto("/poll");

  await expect(page.getByText(FIXTURE_POLL.prompt)).toBeVisible();

  // Before the vote: choices are shown, no percentages or counts anywhere.
  await expect(page.getByText(/%/)).toHaveCount(0);
  await expect(page.getByText(/票\)/)).toHaveCount(0);
  await expect(page.getByText("あなたの選択")).toHaveCount(0);

  await page
    .getByRole("button", { name: /多数派の案を認めて懸念を記録する/ })
    .click();

  // After the vote: real counts and percentages, my choice marked,
  // thinking points shown instead of a "correct answer".
  await expect(page.getByText("あなたの選択")).toBeVisible();
  await expect(page.getByText("52%")).toBeVisible(); // 13/25
  await expect(page.getByText("(13票)")).toBeVisible();
  await expect(page.getByText("考えるポイント")).toBeVisible();
  // No correct-answer feedback exists on a poll (the page only explains
  // 「正解のない質問です」).
  await expect(page.getByText("正解！")).toHaveCount(0);
  await expect(page.getByText("おすすめの判断")).toHaveCount(0);
});

test("poll degrades gracefully without a configured backend", async ({
  page,
}) => {
  await page.route("**/api/poll/current", (route) =>
    route.fulfill({ json: { poll: FIXTURE_POLL } }),
  );
  await page.route("**/api/poll/vote", (route) =>
    route.fulfill({ status: 503, json: { error: "not_configured" } }),
  );
  await page.goto("/poll");
  await page.getByRole("button", { name: /多数派に合わせる/ }).click();
  await expect(page.getByText("集計準備中です。")).toBeVisible();
  await expect(page.getByText(/%/)).toHaveCount(0);
});
