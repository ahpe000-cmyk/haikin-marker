import { expect, test } from "@playwright/test";
import { answerCurrentQuestion, clickNext } from "./helpers";

test("home → daily quiz → five answers → result", async ({ page }) => {
  await page.goto("/");

  // Home shows brand, disclaimer-safe score state, and the primary CTA.
  await expect(page.getByText("社会人力を、毎日5問で。")).toBeVisible();
  await expect(page.getByText("測定中")).toBeVisible();
  await page.getByRole("link", { name: "今日の5問に挑戦" }).click();

  await expect(page).toHaveURL(/\/quiz\/daily/);

  for (let i = 1; i <= 5; i += 1) {
    await expect(page.getByText(`${i} / 5`)).toBeVisible();
    await answerCurrentQuestion(page, { correctly: false });
    // Feedback appears with an explanation and no auto-advance.
    await expect(
      page.getByRole("button", { name: /次の問題|結果を見る/ }),
    ).toBeVisible();
    await clickNext(page);
  }

  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByText(/5問中\d問正解/)).toBeVisible();
  // The IQ disclaimer is displayed near the score.
  await expect(
    page.getByText(/心理検査や知能指数（IQ）を測定するものではありません/),
  ).toBeVisible();
  // No fake rank or percentile anywhere on the result.
  await expect(page.getByText(/全国|上位\d+%/)).toHaveCount(0);
});

test("no horizontal overflow at 390px and keyboard flow works", async ({
  page,
}) => {
  await page.goto("/quiz/daily");
  await expect(page.getByText("1 / 5")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);

  // Answer the first question with the keyboard only.
  await page.keyboard.press("Tab");
  const focusedChoice = page.locator('div[role="group"] button:focus');
  // Tab until a choice button holds focus, then activate with Enter.
  for (let i = 0; i < 10; i += 1) {
    if ((await focusedChoice.count()) > 0) break;
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: /次の問題/ }),
  ).toBeVisible();
});
