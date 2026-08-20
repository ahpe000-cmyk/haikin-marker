import { expect, test } from "@playwright/test";
import { answerCurrentQuestion, clickNext } from "./helpers";

test("share falls back to the clipboard and contains no fake rank", async ({
  page,
}) => {
  const copied: string[] = [];
  await page.exposeFunction("__recordCopy", (text: string) => {
    copied.push(text);
  });
  await page.addInitScript(() => {
    // Force the clipboard fallback: no Web Share API in this context.
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: (text: string) => {
          (window as unknown as { __recordCopy: (t: string) => void }).__recordCopy(
            text,
          );
          return Promise.resolve();
        },
      },
      configurable: true,
    });
  });

  await page.goto("/quiz/daily");
  for (let i = 1; i <= 5; i += 1) {
    await answerCurrentQuestion(page, { correctly: false });
    await clickNext(page);
  }
  await expect(page).toHaveURL(/\/result\//);

  await page.getByRole("button", { name: "結果をシェア" }).click();
  await expect(
    page.getByText("シェア用テキストをコピーしました"),
  ).toBeVisible();

  expect(copied).toHaveLength(1);
  expect(copied[0]).toContain("あなたの社会人力は何点？");
  expect(copied[0]).toContain("/result/");
  expect(copied[0]).not.toMatch(/全国|上位|位/);
});
