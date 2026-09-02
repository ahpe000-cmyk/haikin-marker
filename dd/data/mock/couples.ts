import type { Couple } from "@/types";
import { avatarPhoto, photo } from "@/lib/utils";
import { calcCreatorScore } from "@/lib/score";

interface CoupleSeed {
  id: string;
  username: string;
  memberNames: [string, string];
  bio: string;
  location: string;
  datingSince: string;
  favoriteDateStyles: string[];
  followers: number;
  following: number;
  postCount: number;
  dateCount: number;
  totalSavesGenerated: number;
  totalReproductions: number;
  averageRating: number;
}

function mkCouple(seed: CoupleSeed): Couple {
  const [a, b] = seed.memberNames;
  return {
    ...seed,
    type: "couple",
    displayName: `${a} × ${b}`,
    avatar: avatarPhoto(seed.id),
    coverImage: photo(`cover-${seed.id}`, 1200, 600),
    memberIds: [`${seed.id}_a`, `${seed.id}_b`],
    ddScore: calcCreatorScore({
      totalReproductions: seed.totalReproductions,
      totalSavesGenerated: seed.totalSavesGenerated,
      averageRating: seed.averageRating,
      engagement: seed.followers,
      postCount: seed.postCount,
    }),
  };
}

/** Hero couple of the demo (Mai × Yui). */
export const HERO_COUPLE_ID = "c1";

export const mockCouples: Couple[] = [
  mkCouple({
    id: HERO_COUPLE_ID,
    username: "mai_yui",
    memberNames: ["Mai", "Yui"],
    bio: "付き合って1年。記念日と夜のデートが得意です。ふたりで行って本当に良かったコースだけを投稿しています。",
    location: "Tokyo",
    datingSince: "2025-09-01",
    favoriteDateStyles: ["記念日", "夜デート", "Luxury"],
    followers: 12400,
    following: 210,
    postCount: 24,
    dateCount: 12,
    totalSavesGenerated: 4820,
    totalReproductions: 521,
    averageRating: 4.8,
  }),
  mkCouple({
    id: "c2",
    username: "kenta_aya",
    memberNames: ["Kenta", "Aya"],
    bio: "気になるデートを再現するのが週末の楽しみ。横浜拠点。",
    location: "Yokohama",
    datingSince: "2024-05-17",
    favoriteDateStyles: ["再現デート", "カジュアル", "グルメ"],
    followers: 3650,
    following: 480,
    postCount: 15,
    dateCount: 6,
    totalSavesGenerated: 520,
    totalReproductions: 64,
    averageRating: 4.5,
  }),
  mkCouple({
    id: "c3",
    username: "shun_riko",
    memberNames: ["Shun", "Riko"],
    bio: "海と山と、ときどき温泉。アウトドア中心のふたりです。",
    location: "Kamakura",
    datingSince: "2023-11-03",
    favoriteDateStyles: ["アウトドア", "旅行", "昼デート"],
    followers: 6890,
    following: 320,
    postCount: 21,
    dateCount: 13,
    totalSavesGenerated: 1310,
    totalReproductions: 148,
    averageRating: 4.6,
  }),
  mkCouple({
    id: "c4",
    username: "takumi_emi",
    memberNames: ["Takumi", "Emi"],
    bio: "節約中でも楽しめるデートを毎週開拓。合計3,000円縛り多め。",
    location: "Shinjuku",
    datingSince: "2025-02-14",
    favoriteDateStyles: ["低予算", "昼デート", "カジュアル"],
    followers: 5120,
    following: 610,
    postCount: 19,
    dateCount: 12,
    totalSavesGenerated: 1180,
    totalReproductions: 171,
    averageRating: 4.5,
  }),
  mkCouple({
    id: "c5",
    username: "ryo_saki",
    memberNames: ["Ryo", "Saki"],
    bio: "カフェ巡りと古着屋巡り。表参道〜代官山あたりに生息。",
    location: "Omotesando",
    datingSince: "2024-09-23",
    favoriteDateStyles: ["カフェ", "散歩", "昼デート"],
    followers: 8240,
    following: 390,
    postCount: 27,
    dateCount: 14,
    totalSavesGenerated: 1890,
    totalReproductions: 167,
    averageRating: 4.6,
  }),
  mkCouple({
    id: "c6",
    username: "yuto_nao",
    memberNames: ["Yuto", "Nao"],
    bio: "夜景のきれいな場所を求めて。金曜夜の過ごし方に自信あり。",
    location: "Roppongi",
    datingSince: "2024-01-20",
    favoriteDateStyles: ["夜デート", "夜景", "バー"],
    followers: 9760,
    following: 240,
    postCount: 23,
    dateCount: 12,
    totalSavesGenerated: 2240,
    totalReproductions: 232,
    averageRating: 4.7,
  }),
  mkCouple({
    id: "c7",
    username: "kazu_mei",
    memberNames: ["Kazu", "Mei"],
    bio: "食べるために生きているふたり。恵比寿・中目黒の食べ歩き。",
    location: "Ebisu",
    datingSince: "2023-06-10",
    favoriteDateStyles: ["グルメ", "ランチ", "夜デート"],
    followers: 7310,
    following: 450,
    postCount: 25,
    dateCount: 15,
    totalSavesGenerated: 1560,
    totalReproductions: 139,
    averageRating: 4.5,
  }),
  mkCouple({
    id: "c8",
    username: "sho_rina",
    memberNames: ["Sho", "Rina"],
    bio: "予定を決めすぎない渋谷デートが好き。思いつきで動きます。",
    location: "Shibuya",
    datingSince: "2025-04-05",
    favoriteDateStyles: ["カジュアル", "散歩", "サプライズ"],
    followers: 2140,
    following: 380,
    postCount: 12,
    dateCount: 7,
    totalSavesGenerated: 390,
    totalReproductions: 52,
    averageRating: 4.3,
  }),
];
