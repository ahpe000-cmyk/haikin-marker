import { NextResponse } from "next/server";
import { z } from "zod";
import { ALLOWED_EVENTS } from "@/lib/analytics/track";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hashAnonId } from "@/lib/poll/repository";

export const dynamic = "force-dynamic";

const eventSchema = z
  .object({
    anonId: z.string().min(8).max(64),
    event: z.enum(ALLOWED_EVENTS),
    route: z.string().max(200).optional(),
    category: z.string().max(40).optional(),
    step: z.number().int().min(1).max(5).optional(),
    questionId: z.string().max(64).optional(),
    sessionId: z.string().max(80).optional(),
    cta: z.enum(["honne", "befoaf"]).optional(),
    clientTimestamp: z.string().max(40).optional(),
  })
  .strict();

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const salt = process.env.ANON_HASH_SALT;
  const client = getSupabaseServerClient();
  if (!client || !salt) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { anonId, event, route, category, step, questionId, sessionId, cta, clientTimestamp } =
    parsed.data;

  const { error } = await client.from("analytics_events").insert({
    event,
    anon_hash: hashAnonId(anonId, salt),
    route,
    category,
    step,
    question_id: questionId,
    session_id: sessionId,
    metadata: cta ? { cta } : {},
    client_timestamp: clientTimestamp,
  });
  if (error) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
