import { describe, expect, it, vi } from "vitest";
import type { DailyPoll } from "@/lib/domain/types";

const poll: DailyPoll = {
  id: "poll-2026-08-21",
  date: "2026-08-21",
  prompt: "あなたならどうする？",
  choices: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
  ],
  tags: ["communication"],
  thinkingPoints: ["ポイント"],
};

vi.mock("@/lib/content/load", () => ({
  loadPollForDate: () => poll,
}));

import { GET } from "./route";

describe("GET /api/poll/current", () => {
  it("returns the poll definition without any aggregate counts", async () => {
    const res = GET();
    const data = await res.json();
    expect(data.poll.id).toBe(poll.id);
    expect(data.poll.prompt).toBe(poll.prompt);
    // Aggregate is never exposed before voting.
    expect(JSON.stringify(data)).not.toContain("counts");
    expect(JSON.stringify(data)).not.toContain("total");
    // A poll never carries a correct answer.
    expect(JSON.stringify(data)).not.toContain("correctChoiceId");
  });
});
