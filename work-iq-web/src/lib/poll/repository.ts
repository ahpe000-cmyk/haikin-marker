import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChoiceId } from "@/lib/domain/types";

/**
 * Server-side hash of the anonymous device token. The raw token is never
 * stored — only this salted SHA-256 digest.
 */
export function hashAnonId(anonId: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${anonId}`).digest("hex");
}

export type VoteOutcome = "created" | "duplicate";

const UNIQUE_VIOLATION = "23505";

export async function recordVote(
  client: SupabaseClient,
  vote: { pollId: string; optionId: ChoiceId; voterHash: string },
): Promise<VoteOutcome> {
  const { error } = await client.from("poll_votes").insert({
    poll_id: vote.pollId,
    option_id: vote.optionId,
    voter_hash: vote.voterHash,
  });
  if (!error) return "created";
  if (error.code === UNIQUE_VIOLATION) return "duplicate";
  throw new Error(`poll vote insert failed: ${error.message}`);
}

export interface PollAggregate {
  counts: Record<ChoiceId, number>;
  total: number;
}

export async function getPollAggregate(
  client: SupabaseClient,
  pollId: string,
): Promise<PollAggregate> {
  const { data, error } = await client
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId);
  if (error) {
    throw new Error(`poll aggregate query failed: ${error.message}`);
  }
  const counts: Record<ChoiceId, number> = { a: 0, b: 0, c: 0, d: 0 };
  for (const row of data ?? []) {
    const optionId = row.option_id as ChoiceId;
    if (optionId in counts) counts[optionId] += 1;
  }
  return {
    counts,
    total: counts.a + counts.b + counts.c + counts.d,
  };
}
