import { expect, test } from "@playwright/test";
import { answerCurrentQuestion, answerKey, clickNext, loadContent } from "./helpers";

const key = answerKey(loadContent("business-terms.json"));

test("4/5 or better on STEP 1 unlocks STEP 2", async ({ page }) => {
  await page.goto("/learn/business-terms");

  // STEP 1 is open, STEP 2 starts locked.
  await expect(page.getByRole("link", { name: /STEP 1/ })).toBeVisible();
  await expect(page.getByText("STEP 2（ロック中）")).toBeVisible();

  await page.getByRole("link", { name: /STEP 1/ }).click();
  await expect(page).toHaveURL(/\/quiz\/business-terms\/step\/1/);

  for (let i = 1; i <= 5; i += 1) {
    await answerCurrentQuestion(page, { correctly: true, key });
    await clickNext(page);
  }

  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByText(/STEP 2が解放されました/)).toBeVisible();

  await page.goto("/learn/business-terms");
  await expect(page.getByRole("link", { name: /STEP 2/ })).toBeVisible();
  await expect(page.getByText("STEP 3（ロック中）")).toBeVisible();
});

test("a locked STEP page refuses to start", async ({ page }) => {
  await page.goto("/quiz/risk/step/3");
  await expect(page.getByText("STEP 3はまだロック中です")).toBeVisible();
  await expect(page.getByRole("link", { name: "STEP一覧へ戻る" })).toBeVisible();
});
