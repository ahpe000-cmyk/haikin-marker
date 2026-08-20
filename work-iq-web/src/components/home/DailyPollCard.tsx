"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

interface PollSummary {
  id: string;
  prompt: string;
}

export function DailyPollCard({ hasVoted }: { hasVoted: (pollId: string) => boolean }) {
  const [poll, setPoll] = useState<PollSummary | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/poll/current")
      .then((res) => (res.ok ? res.json() : { poll: null }))
      .then((data: { poll: PollSummary | null }) => {
        if (!cancelled) setPoll(data.poll);
      })
      .catch(() => {
        if (!cancelled) setPoll(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (poll === "loading" || poll === null) {
    return null;
  }

  const voted = hasVoted(poll.id);
  return (
    <Card>
      <h2 className="text-base font-bold">今日のみんなならどうする？</h2>
      <p className="mt-2 text-[15px] leading-relaxed">{poll.prompt}</p>
      <ButtonLink href="/poll" variant="secondary" className="mt-3 w-full">
        {voted ? "みんなの回答を見る" : "回答してみる"}
      </ButtonLink>
    </Card>
  );
}
