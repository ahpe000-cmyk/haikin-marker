import { NextResponse } from "next/server";
import { z } from "zod";
import { choiceIdSchema } from "@/lib/domain/schemas";
import { loadPollForDate } from "@/lib/content/load";
import { getJstDateKey } from "@/lib/time/jst";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getPollAggregate,
  hashAnonId,
  recordVote,
} from "@/lib/poll/repository";

export const dynamic = "force-dynamic";

const voteSchema = z
  .object({
    pollId: z.string().min(1).max(64),
    optionId: choiceIdSchema,
    anonId: z.string().min(8).max(64),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const { pollId, optionId, anonId } = parsed.data;

  // Only today's poll accepts votes, and the option must exist on it.
  const todaysPoll = loadPollForDate(getJstDateKey());
  if (!todaysPoll || todaysPoll.id !== pollId) {
    return NextResponse.json({ error: "unknown_poll" }, { status: 404 });
  }
  if (!todaysPoll.choices.some((choice) => choice.id === optionId)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const salt = process.env.ANON_HASH_SALT;
  const client = getSupabaseServerClient();
  if (!client || !salt) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const voterHash = hashAnonId(anonId, salt);
    const outcome = await recordVote(client, { pollId, optionId, voterHash });
    const aggregate = await getPollAggregate(client, pollId);
    return NextResponse.json({
      alreadyVoted: outcome === "duplicate",
      counts: aggregate.counts,
      total: aggregate.total,
    });
  } catch {
    return NextResponse.json({ error: "vote_failed" }, { status: 500 });
  }
}
