import type { Comment } from "@/types";
import { mockPosts } from "./posts";

/**
 * Deterministic comment generation: each mock post gets 1-4 comments drawn
 * from a text pool with rotating authors (never the post's own author).
 * Generates 90+ comments in total.
 */

const COMMENT_POOL = [
  "このコース保存しました！今週末行ってきます",
  "ちょうどこのエリアでデート予定だったので助かります",
  "写真の雰囲気が素敵すぎる…",
  "再現してきました。最高でした！",
  "2軒目のお店、前から気になってたところだ",
  "予算感まで書いてあるのが本当にありがたい",
  "タイムラインの時間配分が絶妙ですね",
  "これは真似したくなる…保存！",
  "先週これ参考にして行ってきました。大成功です",
  "夜の写真きれい。何で撮ってますか？",
  "この発想はなかった。今度提案してみます",
  "Tipsが有能すぎる。予約しました",
  "おふたりの投稿いつも参考にしてます！",
  "ここのお店、たしかに窓際席が正解です",
  "低予算でこの満足度はすごい",
  "記念日はこれで決まりです。ありがとうございます",
  "雨の日プランのストックが増えました",
  "コース設計のセンスが良すぎる",
  "行ってきました！彼も大満足でした",
  "最後のお店だけ変えて再現しようかな",
];

const AUTHOR_POOL = [
  "u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13",
  "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
];

function commentsForPost(postId: string, authorId: string, index: number): Comment[] {
  const count = (index % 3) + 1 + (index % 5 === 0 ? 1 : 0); // 1-4 comments
  const base = new Date("2026-09-01T10:00:00+09:00").getTime();
  return Array.from({ length: count }, (_, i) => {
    const authorCandidates = AUTHOR_POOL.filter((a) => a !== authorId);
    const author = authorCandidates[(index * 3 + i * 7) % authorCandidates.length];
    return {
      id: `cm-${postId}-${i + 1}`,
      postId,
      authorId: author,
      text: COMMENT_POOL[(index * 5 + i * 11) % COMMENT_POOL.length],
      createdAt: new Date(base - (index * 137 + i * 61) * 60000).toISOString(),
    };
  });
}

export const mockComments: Comment[] = mockPosts.flatMap((p, i) =>
  commentsForPost(p.id, p.authorId, i)
);
