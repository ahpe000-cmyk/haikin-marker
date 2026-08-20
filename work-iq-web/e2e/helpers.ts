import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface ContentQuestion {
  id: string;
  prompt: string;
  mode: "single_correct" | "best_answer";
  choices: { id: "a" | "b" | "c" | "d"; text: string }[];
  correctChoiceId?: "a" | "b" | "c" | "d";
  recommendedChoiceId?: "a" | "b" | "c" | "d";
}

export function loadContent(file: string): ContentQuestion[] {
  return JSON.parse(
    readFileSync(join(process.cwd(), "src", "content", file), "utf8"),
  ) as ContentQuestion[];
}

/** prompt text → the text of the correct/recommended choice. */
export function answerKey(
  questions: ContentQuestion[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const question of questions) {
    const answerId =
      question.mode === "single_correct"
        ? question.correctChoiceId
        : question.recommendedChoiceId;
    const choice = question.choices.find((c) => c.id === answerId);
    if (choice) map.set(question.prompt, choice.text);
  }
  return map;
}

/**
 * Answers the currently displayed question. Picks the correct choice when
 * `correctly` is true and a key is provided, otherwise the first choice.
 */
export async function answerCurrentQuestion(
  page: Page,
  options: { correctly: boolean; key?: Map<string, string> },
): Promise<void> {
  const prompt = await page.locator("h1").first().innerText();
  const choices = page.locator('div[role="group"] button');
  if (options.correctly && options.key?.has(prompt)) {
    const answerText = options.key.get(prompt) as string;
    await choices.filter({ hasText: answerText }).first().click();
  } else {
    await choices.first().click();
  }
}

export async function clickNext(page: Page): Promise<void> {
  const next = page.getByRole("button", { name: /次の問題|結果を見る/ });
  await next.click();
}

/** The JST calendar date used across the app. */
export function jstDateKey(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const FIXTURE_POLL = {
  id: "poll-e2e",
  date: "2099-01-01",
  prompt: "E2Eテスト：会議で意見が割れたら、あなたならどうする？",
  choices: [
    { id: "a", text: "自分の意見を主張し続ける" },
    { id: "b", text: "多数派の案を認めて懸念を記録する" },
    { id: "c", text: "決定権者に個別に伝える" },
    { id: "d", text: "多数派に合わせる" },
  ],
  tags: ["communication"],
  thinkingPoints: ["目的は合意形成です。"],
  ctaHint: "befoaf",
};

/** Mocks the poll endpoints so e2e runs without a Supabase backend. */
export async function mockPollApi(page: Page): Promise<void> {
  await page.route("**/api/poll/current", (route) =>
    route.fulfill({ json: { poll: FIXTURE_POLL } }),
  );
  await page.route("**/api/poll/vote", async (route) => {
    const body = route.request().postDataJSON() as { optionId: string };
    const counts = { a: 4, b: 12, c: 6, d: 2 } as Record<string, number>;
    counts[body.optionId] += 1;
    await route.fulfill({
      json: {
        alreadyVoted: false,
        counts,
        total: 25,
      },
    });
  });
}
