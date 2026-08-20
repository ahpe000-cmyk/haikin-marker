import { describe, expect, it } from "vitest";
import {
  addWrongAnswer,
  applyReviewAnswer,
  getDueReviewItems,
} from "./scheduler";

describe("review scheduler", () => {
  it("schedules a wrong answer for the next day", () => {
    const queue = addWrongAnswer([], "bt-101", "business_terms", "2026-08-21");
    expect(queue).toHaveLength(1);
    expect(queue[0].dueDateKey).toBe("2026-08-22");
    expect(queue[0].intervalIndex).toBe(0);
  });

  it("does not duplicate an existing queue entry", () => {
    let queue = addWrongAnswer([], "bt-101", "business_terms", "2026-08-21");
    queue = applyReviewAnswer(queue, "bt-101", true, "2026-08-22");
    queue = addWrongAnswer(queue, "bt-101", "business_terms", "2026-08-23");
    expect(queue).toHaveLength(1);
    expect(queue[0].intervalIndex).toBe(0);
    expect(queue[0].dueDateKey).toBe("2026-08-24");
  });

  it("advances 1 → 3 → 7 → 30 days on correct reviews", () => {
    let queue = addWrongAnswer([], "rk-101", "risk", "2026-08-21");

    queue = applyReviewAnswer(queue, "rk-101", true, "2026-08-22");
    expect(queue[0].dueDateKey).toBe("2026-08-25"); // +3

    queue = applyReviewAnswer(queue, "rk-101", true, "2026-08-25");
    expect(queue[0].dueDateKey).toBe("2026-09-01"); // +7

    queue = applyReviewAnswer(queue, "rk-101", true, "2026-09-01");
    expect(queue[0].dueDateKey).toBe("2026-10-01"); // +30

    queue = applyReviewAnswer(queue, "rk-101", true, "2026-10-01");
    expect(queue).toHaveLength(0); // graduated
  });

  it("resets to the 1-day interval after a wrong review", () => {
    let queue = addWrongAnswer([], "jd-101", "judgment", "2026-08-21");
    queue = applyReviewAnswer(queue, "jd-101", true, "2026-08-22");
    queue = applyReviewAnswer(queue, "jd-101", true, "2026-08-25");
    expect(queue[0].intervalIndex).toBe(2);

    queue = applyReviewAnswer(queue, "jd-101", false, "2026-09-01");
    expect(queue[0].intervalIndex).toBe(0);
    expect(queue[0].dueDateKey).toBe("2026-09-02");
  });

  it("returns only due items", () => {
    let queue = addWrongAnswer([], "bt-101", "business_terms", "2026-08-21");
    queue = addWrongAnswer(queue, "bt-102", "business_terms", "2026-08-25");

    const due = getDueReviewItems(queue, "2026-08-22");
    expect(due.map((item) => item.questionId)).toEqual(["bt-101"]);
    expect(getDueReviewItems(queue, "2026-08-20")).toHaveLength(0);
    expect(getDueReviewItems(queue, "2026-08-30")).toHaveLength(2);
  });

  it("ignores answers for questions not in the queue", () => {
    const queue = addWrongAnswer([], "bt-101", "business_terms", "2026-08-21");
    expect(applyReviewAnswer(queue, "unknown", true, "2026-08-22")).toEqual(
      queue,
    );
  });
});
