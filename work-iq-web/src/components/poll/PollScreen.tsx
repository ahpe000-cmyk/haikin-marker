"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChoiceId, DailyPoll } from "@/lib/domain/types";
import {
  getProgressSnapshot,
  updateProgress,
} from "@/lib/storage/progress-store";
import { selectCta } from "@/lib/cta/select-cta";
import { track } from "@/lib/analytics/track";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceCta } from "@/components/cta/ServiceCta";
import { PollQuestion } from "./PollQuestion";
import { PollResults } from "./PollResults";

type PollPayload = Omit<DailyPoll, "ctaHint"> & { ctaHint: string };

interface Aggregate {
  counts: Record<ChoiceId, number>;
  total: number;
}

type Phase =
  | { name: "loading" }
  | { name: "no-poll" }
  | { name: "ready"; poll: PollPayload }
  | { name: "submitting"; poll: PollPayload }
  | { name: "voted"; poll: PollPayload; aggregate: Aggregate; myChoiceId: ChoiceId }
  | { name: "backend-missing"; poll: PollPayload };

export function PollScreen() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const viewTracked = useRef(false);

  const submitVote = useCallback(
    async (poll: PollPayload, choiceId: ChoiceId, isRevote: boolean) => {
      const progress = getProgressSnapshot();
      if (!progress) return;
      try {
        const res = await fetch("/api/poll/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pollId: poll.id,
            optionId: choiceId,
            anonId: progress.anonId,
          }),
        });
        if (res.status === 503) {
          setPhase({ name: "backend-missing", poll });
          return;
        }
        if (!res.ok) {
          setPhase({ name: "ready", poll });
          return;
        }
        const data = (await res.json()) as Aggregate & {
          alreadyVoted: boolean;
        };
        if (!isRevote) {
          updateProgress((state) => ({
            ...state,
            pollVotes: { ...state.pollVotes, [poll.id]: choiceId },
          }));
          if (!data.alreadyVoted) {
            track("poll_vote", { questionId: poll.id });
          }
        }
        setPhase({
          name: "voted",
          poll,
          aggregate: { counts: data.counts, total: data.total },
          myChoiceId: choiceId,
        });
      } catch {
        setPhase({ name: "backend-missing", poll });
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/poll/current");
        const data = (await res.json()) as { poll: PollPayload | null };
        if (cancelled) return;
        if (!viewTracked.current) {
          viewTracked.current = true;
          track("poll_view", { questionId: data.poll?.id });
        }
        if (!data.poll) {
          setPhase({ name: "no-poll" });
          return;
        }
        const progress = getProgressSnapshot();
        const existingVote = progress?.pollVotes[data.poll.id];
        if (existingVote) {
          // Returning voter: re-submit the stored choice (deduplicated
          // server-side) to fetch the live aggregate.
          setPhase({ name: "submitting", poll: data.poll });
          await submitVote(data.poll, existingVote, true);
        } else {
          setPhase({ name: "ready", poll: data.poll });
        }
      } catch {
        if (!cancelled) setPhase({ name: "no-poll" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submitVote]);

  if (phase.name === "loading") {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  if (phase.name === "no-poll") {
    return (
      <div className="py-8 text-center">
        <h1 className="text-lg font-bold">今日のアンケートは準備中です</h1>
        <p className="mt-2 text-sm text-muted">
          また明日のぞいてみてください。
        </p>
        <ButtonLink href="/quiz/daily" variant="secondary" className="mt-4">
          今日の5問に挑戦する
        </ButtonLink>
      </div>
    );
  }

  const { poll } = phase;
  const cta =
    phase.name === "voted"
      ? selectCta({ surface: "poll", pollTags: poll.tags })
      : null;

  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-xl font-bold">みんなならどうする？</h1>
      <p className="text-xs text-muted">
        正解のない質問です。投票すると、実際の回答分布が見られます。
      </p>

      <Card>
        <p className="text-[15px] font-semibold leading-relaxed">
          {poll.prompt}
        </p>
        <div className="mt-4">
          {phase.name === "voted" ? (
            <PollResults
              choices={poll.choices}
              counts={phase.aggregate.counts}
              total={phase.aggregate.total}
              myChoiceId={phase.myChoiceId}
            />
          ) : phase.name === "backend-missing" ? (
            <p className="text-sm text-muted" role="status">
              集計準備中です。しばらくしてからもう一度お試しください。
            </p>
          ) : (
            <PollQuestion
              choices={poll.choices}
              disabled={phase.name === "submitting"}
              onVote={(choiceId) => {
                setPhase({ name: "submitting", poll });
                void submitVote(poll, choiceId, false);
              }}
            />
          )}
        </div>
      </Card>

      {phase.name === "voted" && poll.thinkingPoints.length > 0 ? (
        <Card>
          <h2 className="text-sm font-bold">考えるポイント</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {poll.thinkingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {cta ? <ServiceCta selection={cta} /> : null}

      {phase.name === "voted" ? (
        <ButtonLink href="/" variant="secondary" className="w-full">
          ホームへ戻る
        </ButtonLink>
      ) : null}
    </div>
  );
}
