import type { Reproduction, ActorType } from "@/types";

interface ReproSeed {
  id: string;
  originalDateId: string;
  originalPostId: string;
  reproductionPostId: string;
  reproducerId: string;
  /** [stopOrder, changed, note][] — stopId is derived as `${dateId}-s${order}`. */
  stops: [number, boolean, string][];
  comment: string;
  rating: number;
  createdAt: string;
}

function mkRepro(seed: ReproSeed): Reproduction {
  return {
    id: seed.id,
    originalDateId: seed.originalDateId,
    originalPostId: seed.originalPostId,
    reproductionPostId: seed.reproductionPostId,
    reproducerId: seed.reproducerId,
    reproducerType: (seed.reproducerId.startsWith("c") ? "couple" : "individual") as ActorType,
    changedStops: seed.stops.map(([order, changed, note]) => ({
      stopId: `${seed.originalDateId}-s${order}`,
      changed,
      note,
    })),
    comment: seed.comment,
    rating: seed.rating,
    createdAt: seed.createdAt,
  };
}

export const mockReproductions: Reproduction[] = (
  [
    { id: "r01", originalDateId: "d01", originalPostId: "p01", reproductionPostId: "p27", reproducerId: "c2", rating: 4.9, createdAt: "2026-09-01T22:20:00+09:00",
      comment: "ディナーの窓際席が最高でした。バーだけ好みで変更。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"], [4, true, "行きつけのバーに変更"]] },
    { id: "r02", originalDateId: "d06", originalPostId: "p06", reproductionPostId: "p28", reproducerId: "u10", rating: 4.7, createdAt: "2026-08-29T21:10:00+09:00",
      comment: "低予算デートのお手本。都庁展望室は反則級。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"]] },
    { id: "r03", originalDateId: "d09", originalPostId: "p09", reproductionPostId: "p29", reproducerId: "c4", rating: 4.6, createdAt: "2026-08-28T18:40:00+09:00",
      comment: "服を選び合う企画が想像以上に楽しい。",
      stops: [[1, false, "Same"], [2, true, "スープカレーの店に変更"], [3, false, "Same"]] },
    { id: "r04", originalDateId: "d03", originalPostId: "p03", reproductionPostId: "p30", reproducerId: "c5", rating: 4.5, createdAt: "2026-08-27T13:00:00+09:00",
      comment: "朝の表参道は別世界。2軒目だけ定番店へ。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, true, "いつものカフェに変更"]] },
    { id: "r05", originalDateId: "d02", originalPostId: "p02", reproductionPostId: "p31", reproducerId: "u1", rating: 4.8, createdAt: "2026-08-26T22:50:00+09:00",
      comment: "散歩専門として認めざるを得ない完成度。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"]] },
    { id: "r06", originalDateId: "d24", originalPostId: "p24", reproductionPostId: "p32", reproducerId: "c8", rating: 4.4, createdAt: "2026-08-31T18:20:00+09:00",
      comment: "付き合っていても初デートコースは新鮮でした。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"], [4, true, "クレープに変更"]] },
    { id: "r07", originalDateId: "d08", originalPostId: "p08", reproductionPostId: "p33", reproducerId: "u5", rating: 4.7, createdAt: "2026-08-30T20:30:00+09:00",
      comment: "夕暮れの時間帯設定が写真的にも完璧。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"]] },
    { id: "r08", originalDateId: "d07", originalPostId: "p07", reproductionPostId: "p34", reproducerId: "c6", rating: 4.6, createdAt: "2026-08-24T23:20:00+09:00",
      comment: "撮り合いスタイル採用決定。照れるけど楽しい。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, true, "ラーメンに変更"]] },
    { id: "r09", originalDateId: "d13", originalPostId: "p13", reproductionPostId: "p35", reproducerId: "u12", rating: 4.5, createdAt: "2026-08-23T17:30:00+09:00",
      comment: "雨の日デートの新しい選択肢になりました。",
      stops: [[1, false, "Same"], [2, true, "雨のため科学博物館に変更"], [3, false, "Same"]] },
    { id: "r10", originalDateId: "d22", originalPostId: "p22", reproductionPostId: "p36", reproducerId: "c3", rating: 4.6, createdAt: "2026-08-22T16:10:00+09:00",
      comment: "6号路に変更してガチハイクに。蕎麦は正義。",
      stops: [[1, false, "Same"], [2, true, "ケーブルカーなしの6号路に変更"], [3, false, "Same"], [4, false, "Same"]] },
    { id: "r11", originalDateId: "d15", originalPostId: "p15", reproductionPostId: "p37", reproducerId: "u9", rating: 4.8, createdAt: "2026-08-21T23:55:00+09:00",
      comment: "余韻まで設計されたコース。1杯目から完璧。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, true, "行きつけのバーで〆に変更"]] },
    { id: "r12", originalDateId: "d04", originalPostId: "p04", reproductionPostId: "p38", reproducerId: "c7", rating: 4.7, createdAt: "2026-08-25T15:45:00+09:00",
      comment: "地元でも知らない店があって悔しい。優勝は同じ。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"], [4, false, "Same"]] },
    { id: "r13", originalDateId: "d23", originalPostId: "p23", reproductionPostId: "p39", reproducerId: "u4", rating: 4.4, createdAt: "2026-08-20T14:30:00+09:00",
      comment: "採点表持参で挑戦。2軒目が僅差で優勝でした。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"], [4, false, "Same"]] },
    { id: "r14", originalDateId: "d16", originalPostId: "p16", reproductionPostId: "p40", reproducerId: "c1", rating: 4.9, createdAt: "2026-09-01T19:15:00+09:00",
      comment: "全カップルが見るべき夕日。完璧なコース設計。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"]] },
    { id: "r15", originalDateId: "d10", originalPostId: "p10", reproductionPostId: "p41", reproducerId: "u2", rating: 4.6, createdAt: "2026-08-18T16:50:00+09:00",
      comment: "3軒の配分が完璧。本の見せ合い企画も採用。",
      stops: [[1, false, "Same"], [2, false, "Same"], [3, false, "Same"], [4, true, "季節限定の店に変更"]] },
    { id: "r16", originalDateId: "d01", originalPostId: "p01", reproductionPostId: "p42", reproducerId: "u13", rating: 4.8, createdAt: "2026-08-30T23:00:00+09:00",
      comment: "誕生日サプライズ用にアレンジ。元が強いと決まる。",
      stops: [[1, false, "Same"], [2, true, "ケーキのサプライズを追加"], [3, false, "Same"], [4, false, "Same"]] },
  ] satisfies ReproSeed[]
).map(mkRepro);
