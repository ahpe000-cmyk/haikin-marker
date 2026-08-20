import { NextResponse } from "next/server";
import { loadPollForDate } from "@/lib/content/load";
import { getJstDateKey } from "@/lib/time/jst";

export const dynamic = "force-dynamic";

/**
 * Returns today's poll definition (JST). Never includes aggregate counts —
 * those are only revealed by the vote endpoint after a vote.
 */
export function GET() {
  const poll = loadPollForDate(getJstDateKey());
  if (!poll) {
    return NextResponse.json({ poll: null });
  }
  return NextResponse.json({
    poll: {
      id: poll.id,
      date: poll.date,
      prompt: poll.prompt,
      choices: poll.choices,
      tags: poll.tags,
      thinkingPoints: poll.thinkingPoints,
      ctaHint: poll.ctaHint ?? "none",
    },
  });
}
