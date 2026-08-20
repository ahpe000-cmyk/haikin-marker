import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Question } from "@/lib/domain/types";
import { QuizRunner } from "./QuizRunner";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/quiz/daily",
}));

function makeQuestion(id: string, index: number): Question {
  return {
    id,
    category: "business_terms",
    level: "beginner",
    step: 1,
    mode: "single_correct",
    prompt: `問題${index}: KPIの意味は？`,
    choices: [
      { id: "a", text: `選択肢A-${index}` },
      { id: "b", text: `選択肢B-${index}` },
      { id: "c", text: `選択肢C-${index}` },
      { id: "d", text: `選択肢D-${index}` },
    ],
    correctChoiceId: "b",
    explanation: "Bが適切です。理由の解説。",
    choiceExplanations: {
      a: "Aの解説",
      b: "Bの解説",
      c: "Cの解説",
      d: "Dの解説",
    },
    tags: [],
  };
}

const questions = Array.from({ length: 5 }, (_, i) =>
  makeQuestion(`bt-10${i + 1}`, i + 1),
);

describe("QuizRunner", () => {
  it("locks the answer after the first tap and cannot change it", async () => {
    const user = userEvent.setup();
    render(<QuizRunner questions={questions} kind="daily" />);

    const wrong = await screen.findByRole("button", { name: /選択肢A-1/ });
    await user.click(wrong);

    // All choice buttons are disabled after locking.
    const correct = screen.getByRole("button", { name: /選択肢B-1/ });
    expect(correct).toBeDisabled();
    expect(screen.getByRole("button", { name: /選択肢A-1/ })).toBeDisabled();

    // Clicking again does not add another answer: feedback stays singular.
    expect(screen.getAllByText(/不正解/).length).toBeGreaterThan(0);
  });

  it("conveys correctness with text, not color alone", async () => {
    const user = userEvent.setup();
    render(<QuizRunner questions={questions} kind="daily" />);

    await user.click(await screen.findByRole("button", { name: /選択肢A-1/ }));

    // Textual labels appear for the user's choice and the correct answer.
    expect(screen.getByText("あなたの選択")).toBeInTheDocument();
    expect(screen.getAllByText("正解").length).toBeGreaterThan(0);
    expect(screen.getByText(/Bが適切です/)).toBeInTheDocument();
  });

  it("does not auto-advance after answering", async () => {
    const user = userEvent.setup();
    render(<QuizRunner questions={questions} kind="daily" />);

    await user.click(await screen.findByRole("button", { name: /選択肢B-1/ }));

    // Still on question 1 with an explicit next button.
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "次の問題" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "次の問題" }));
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("shows the progress indicator n / 5", async () => {
    render(<QuizRunner questions={questions} kind="daily" />);
    expect(await screen.findByText("1 / 5")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("persists answers so a refresh cannot silently lose them", async () => {
    const user = userEvent.setup();
    render(<QuizRunner questions={questions} kind="daily" />);
    await user.click(await screen.findByRole("button", { name: /選択肢B-1/ }));

    const stored = JSON.parse(
      window.localStorage.getItem("work-iq-active-session-v1") ?? "null",
    );
    expect(stored).not.toBeNull();
    expect(stored.answers).toHaveLength(1);
    expect(stored.answers[0].questionId).toBe("bt-101");
  });

  it("routes to the result page after the fifth answer", async () => {
    const user = userEvent.setup();
    pushMock.mockClear();
    render(<QuizRunner questions={questions} kind="daily" />);

    for (let i = 1; i <= 5; i += 1) {
      await user.click(
        await screen.findByRole("button", { name: new RegExp(`選択肢B-${i}`) }),
      );
      await user.click(
        screen.getByRole("button", {
          name: i === 5 ? "結果を見る" : "次の問題",
        }),
      );
    }
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock.mock.calls[0][0]).toMatch(/^\/result\//);
  });
});
