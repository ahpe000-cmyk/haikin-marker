import type { AppNotification } from "@/types";

/** Demo notifications for the operator account (UI only — no push). */
export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    kind: "follow",
    actorId: "c1",
    message: "Mai × Yui があなたをフォローしました",
    createdAt: "2026-09-02T08:40:00+09:00",
    read: false,
  },
  {
    id: "n2",
    kind: "reproduction",
    dateId: "d01",
    postId: "p01",
    message: "保存したデート「銀座で少し背伸びする1周年デート」が今週32回再現されました",
    createdAt: "2026-09-01T21:15:00+09:00",
    read: false,
  },
  {
    id: "n3",
    kind: "comment",
    actorId: "u2",
    postId: "p48",
    message: "Hina があなたの投稿にコメントしました：「気になるコース、ぜひ再現レポお願いします！」",
    createdAt: "2026-09-01T18:30:00+09:00",
    read: false,
  },
  {
    id: "n4",
    kind: "like",
    actorId: "c2",
    postId: "p48",
    message: "Kenta × Aya があなたの投稿にいいねしました",
    createdAt: "2026-08-31T22:05:00+09:00",
    read: true,
  },
  {
    id: "n5",
    kind: "ranking",
    actorId: "c1",
    message: "フォロー中の Mai × Yui がCoupleランキング1位になりました",
    createdAt: "2026-08-31T09:00:00+09:00",
    read: true,
  },
  {
    id: "n6",
    kind: "trending",
    dateId: "d24",
    message: "保存したデート「会話が続く、初デートの表参道」が急上昇しています",
    createdAt: "2026-08-30T20:45:00+09:00",
    read: true,
  },
  {
    id: "n7",
    kind: "follow",
    actorId: "u10",
    message: "Mio があなたをフォローしました",
    createdAt: "2026-08-29T15:20:00+09:00",
    read: true,
  },
];
