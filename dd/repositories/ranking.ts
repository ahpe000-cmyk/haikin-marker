/**
 * Ranking repository — computes demo rankings from mock data + lib/score.ts.
 * See repositories/actors.ts for the production-swap note.
 */
import type { Actor, DateExperience } from "@/types";
import { calcDateScore, calcRisingScore } from "@/lib/score";
import { mockDates, mockPosts } from "@/data/mock";
import { listActors, listCouples, listUsers } from "./actors";

export interface DateRankingRow {
  rank: number;
  date: DateExperience;
  score: number;
}

export interface ActorRankingRow {
  rank: number;
  actor: Actor;
  score: number;
}

const FIXED_NOW = new Date("2026-09-02T12:00:00+09:00").getTime();

export function dateRanking(): DateRankingRow[] {
  return mockDates
    .map((date) => {
      const post = mockPosts.find((p) => p.id === date.postId);
      return {
        date,
        score: calcDateScore({
          reproductionCount: date.reproductionCount,
          saveCount: date.saveCount,
          rating: date.rating,
          commentsCount: post?.commentsCount ?? 0,
          createdAt: post?.createdAt ?? "2026-08-01T00:00:00+09:00",
          now: FIXED_NOW,
        }),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function coupleRanking(): ActorRankingRow[] {
  return listCouples()
    .map((actor) => ({ actor: actor as Actor, score: actor.ddScore }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function creatorRanking(): ActorRankingRow[] {
  return listUsers()
    .filter((u) => u.specialty !== undefined) // demo operator account is excluded
    .map((actor) => ({ actor: actor as Actor, score: actor.ddScore }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function risingRanking(): ActorRankingRow[] {
  return listActors()
    .filter((a) => a.dateCount > 0 && a.id !== "u_me")
    .map((actor) => ({
      actor,
      score: calcRisingScore({
        totalReproductions: actor.totalReproductions,
        dateCount: actor.dateCount,
        followers: actor.followers,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }))
    .slice(0, 10);
}

/** Ranking position of an actor in its own ranking (couple or creator). */
export function actorRankPosition(actorId: string): number | undefined {
  const rows = actorId.startsWith("c") ? coupleRanking() : creatorRanking();
  return rows.find((r) => r.actor.id === actorId)?.rank;
}

/** Ranking position of a date in the date ranking. */
export function dateRankPosition(dateId: string): number | undefined {
  return dateRanking().find((r) => r.date.id === dateId)?.rank;
}
