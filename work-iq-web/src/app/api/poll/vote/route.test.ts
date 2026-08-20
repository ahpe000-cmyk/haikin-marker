import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyPoll } from "@/lib/domain/types";

const insertedRows: Record<string, unknown>[] = [];
let supabaseAvailable = true;

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => {
    if (!supabaseAvailable) return null;
    return {
      from: () => ({
        insert: (row: Record<string, unknown>) => {
          const duplicate = insertedRows.some(
            (existing) =>
              existing.poll_id === row.poll_id &&
              existing.voter_hash === row.voter_hash,
          );
          if (duplicate) {
            return Promise.resolve({
              error: { code: "23505", message: "duplicate key" },
            });
          }
          insertedRows.push(row);
          return Promise.resolve({ error: null });
        },
        select: () => ({
          eq: (_column: string, pollId: string) =>
            Promise.resolve({
              data: insertedRows
                .filter((row) => row.poll_id === pollId)
                .map((row) => ({ option_id: row.option_id })),
              error: null,
            }),
        }),
      }),
    };
  },
}));

const todaysPoll: DailyPoll = {
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
  loadPollForDate: () => todaysPoll,
}));

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/poll/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validVote = {
  pollId: "poll-2026-08-21",
  optionId: "b",
  anonId: "12345678-abcd-efgh",
};

describe("POST /api/poll/vote", () => {
  beforeEach(() => {
    insertedRows.length = 0;
    supabaseAvailable = true;
    vi.stubEnv("ANON_HASH_SALT", "test-salt");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a malformed choice", async () => {
    const res = await POST(makeRequest({ ...validVote, optionId: "e" }));
    expect(res.status).toBe(400);
    expect(insertedRows).toHaveLength(0);
  });

  it("rejects extra fields and missing fields", async () => {
    expect(
      (await POST(makeRequest({ ...validVote, email: "a@b.c" }))).status,
    ).toBe(400);
    expect(
      (await POST(makeRequest({ pollId: "poll-2026-08-21" }))).status,
    ).toBe(400);
  });

  it("rejects a vote for a poll that is not today's", async () => {
    const res = await POST(makeRequest({ ...validVote, pollId: "poll-old" }));
    expect(res.status).toBe(404);
  });

  it("accepts a vote and returns the aggregate", async () => {
    const res = await POST(makeRequest(validVote));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.alreadyVoted).toBe(false);
    expect(data.counts).toEqual({ a: 0, b: 1, c: 0, d: 0 });
    expect(data.total).toBe(1);
  });

  it("never creates a second row for the same browser identity", async () => {
    await POST(makeRequest(validVote));
    const res = await POST(makeRequest({ ...validVote, optionId: "c" }));
    const data = await res.json();
    expect(data.alreadyVoted).toBe(true);
    expect(insertedRows).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it("stores the hashed voter identity, never the raw anon id", async () => {
    await POST(makeRequest(validVote));
    expect(insertedRows[0].voter_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(insertedRows[0].voter_hash).not.toContain(validVote.anonId);
  });

  it("returns 503 when the backend is not configured", async () => {
    supabaseAvailable = false;
    const res = await POST(makeRequest(validVote));
    expect(res.status).toBe(503);
  });
});
