import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPollAggregate, hashAnonId, recordVote } from "./repository";

function stubClient(handlers: {
  insert?: (row: Record<string, unknown>) => { error: { code?: string; message: string } | null };
  rows?: { option_id: string }[];
  selectError?: { message: string };
}): SupabaseClient {
  return {
    from: () => ({
      insert: (row: Record<string, unknown>) =>
        Promise.resolve(handlers.insert ? handlers.insert(row) : { error: null }),
      select: () => ({
        eq: () =>
          Promise.resolve(
            handlers.selectError
              ? { data: null, error: handlers.selectError }
              : { data: handlers.rows ?? [], error: null },
          ),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("hashAnonId", () => {
  it("is deterministic and salted", () => {
    const first = hashAnonId("device-123", "salt-a");
    expect(hashAnonId("device-123", "salt-a")).toBe(first);
    expect(hashAnonId("device-123", "salt-b")).not.toBe(first);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(first).not.toContain("device-123");
  });
});

describe("recordVote", () => {
  const vote = { pollId: "poll-x", optionId: "a" as const, voterHash: "h" };

  it("returns created on success", async () => {
    const client = stubClient({ insert: () => ({ error: null }) });
    expect(await recordVote(client, vote)).toBe("created");
  });

  it("returns duplicate on unique violation", async () => {
    const client = stubClient({
      insert: () => ({ error: { code: "23505", message: "duplicate" } }),
    });
    expect(await recordVote(client, vote)).toBe("duplicate");
  });

  it("throws on other database errors", async () => {
    const client = stubClient({
      insert: () => ({ error: { code: "500", message: "boom" } }),
    });
    await expect(recordVote(client, vote)).rejects.toThrow(/boom/);
  });
});

describe("getPollAggregate", () => {
  it("counts votes per option", async () => {
    const client = stubClient({
      rows: [
        { option_id: "a" },
        { option_id: "a" },
        { option_id: "c" },
        { option_id: "d" },
      ],
    });
    const aggregate = await getPollAggregate(client, "poll-x");
    expect(aggregate.counts).toEqual({ a: 2, b: 0, c: 1, d: 1 });
    expect(aggregate.total).toBe(4);
  });

  it("throws on query errors", async () => {
    const client = stubClient({ selectError: { message: "down" } });
    await expect(getPollAggregate(client, "poll-x")).rejects.toThrow(/down/);
  });
});
