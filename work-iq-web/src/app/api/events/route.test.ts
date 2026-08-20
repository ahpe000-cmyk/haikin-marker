import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const insertedRows: Record<string, unknown>[] = [];
let supabaseAvailable = true;

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => {
    if (!supabaseAvailable) return null;
    return {
      from: () => ({
        insert: (row: Record<string, unknown>) => {
          insertedRows.push(row);
          return Promise.resolve({ error: null });
        },
      }),
    };
  },
}));

import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validEvent = {
  anonId: "12345678-abcd",
  event: "quiz_complete",
  route: "/quiz/daily",
  category: "judgment",
  sessionId: "2026-08-21-daily-x1",
};

describe("POST /api/events", () => {
  beforeEach(() => {
    insertedRows.length = 0;
    supabaseAvailable = true;
    vi.stubEnv("ANON_HASH_SALT", "test-salt");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts an allowlisted event and stores the hashed identity", async () => {
    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(202);
    expect(insertedRows).toHaveLength(1);
    expect(insertedRows[0].event).toBe("quiz_complete");
    expect(insertedRows[0].anon_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(insertedRows[0])).not.toContain(validEvent.anonId);
  });

  it("rejects unknown event names", async () => {
    const res = await POST(
      makeRequest({ ...validEvent, event: "user_typed_text" }),
    );
    expect(res.status).toBe(400);
    expect(insertedRows).toHaveLength(0);
  });

  it("rejects free-text or unknown fields", async () => {
    const res = await POST(
      makeRequest({ ...validEvent, comment: "ここに自由入力" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects oversized payloads", async () => {
    const res = await POST(
      makeRequest({ ...validEvent, route: "x".repeat(5000) }),
    );
    expect(res.status).toBe(413);
  });

  it("rejects invalid JSON", async () => {
    const res = await POST(makeRequest("{broken"));
    expect(res.status).toBe(400);
  });

  it("returns 503 when the backend is not configured", async () => {
    supabaseAvailable = false;
    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(503);
  });
});
