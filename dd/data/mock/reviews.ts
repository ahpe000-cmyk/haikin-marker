import type { Review } from "@/types";
import { mockDates } from "./dates";

/**
 * Deterministic review generation: each mock date gets 1-2 reviews
 * (34+ reviews in total across 26 dates).
 */

const REVIEW_POOL: { rating: number; text: string }[] = [
  { rating: 5, text: "タイムライン通りに回って大満足。時間配分が完璧でした。" },
  { rating: 5, text: "記念日に再現しました。相手の反応が最高で、感謝しかないです。" },
  { rating: 4, text: "2軒目が混んでいて少し待ちましたが、それ以外は完璧なコース。" },
  { rating: 5, text: "予算内でこの満足度はすごい。Tipsまで役立ちました。" },
  { rating: 4, text: "土曜は混むので、少し早めに回るのがおすすめです。" },
  { rating: 5, text: "写真で見た通りの景色でした。保存して正解。" },
  { rating: 4, text: "一部お店を変更しましたが、コースの流れ自体が優秀なので問題なしでした。" },
  { rating: 5, text: "会話が途切れない構成になっていて、初デートでも安心でした。" },
  { rating: 4, text: "雨の日でも楽しめました。屋内の選択肢が多いのが良い。" },
  { rating: 5, text: "終わり方まで設計されているのが素晴らしい。余韻が残ります。" },
];

const REVIEWER_POOL = [
  "u1", "u3", "u5", "u7", "u9", "u11", "u13",
  "c2", "c3", "c4", "c5", "c6", "c7", "c8",
];

export const mockReviews: Review[] = mockDates.flatMap((d, i) => {
  const count = (i % 2) + 1; // 1-2 reviews per date
  const base = new Date("2026-08-31T12:00:00+09:00").getTime();
  return Array.from({ length: count }, (_, j) => {
    const pool = REVIEW_POOL[(i * 3 + j * 7) % REVIEW_POOL.length];
    return {
      id: `rv-${d.id}-${j + 1}`,
      dateId: d.id,
      authorId: REVIEWER_POOL[(i * 5 + j * 3) % REVIEWER_POOL.length],
      rating: pool.rating,
      text: pool.text,
      createdAt: new Date(base - (i * 211 + j * 97) * 60000).toISOString(),
    };
  });
});
