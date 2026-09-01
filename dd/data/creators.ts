import type { CreatorProfile, User } from "@/types";

// DEMO DATA — すべて架空のクリエイターです。実在の人物とは関係ありません。
export const CREATORS: CreatorProfile[] = [
  {
    id: "c1",
    name: "Rin | 夜デート研究家",
    bio: "都内の夜景とバーを巡って5年。「会話が続く夜デート」だけを投稿しています。",
    avatarSeed: "creator-rin",
    followers: 12400,
    following: 180,
    totalDates: 34,
    totalReproductions: 2180,
    averageRating: 4.7,
  },
  {
    id: "c2",
    name: "Sota / 低予算デート職人",
    bio: "合計¥5,000以下でも満足度の高いデートは作れる。学生・社会人1年目の味方。",
    avatarSeed: "creator-sota",
    followers: 8900,
    following: 320,
    totalDates: 41,
    totalReproductions: 1850,
    averageRating: 4.5,
  },
  {
    id: "c3",
    name: "Mio | 記念日プランナー",
    bio: "元ホテルコンシェルジュ。記念日・誕生日の「外さない」プランを設計します。",
    avatarSeed: "creator-mio",
    followers: 15600,
    following: 95,
    totalDates: 28,
    totalReproductions: 1620,
    averageRating: 4.8,
  },
  {
    id: "c4",
    name: "Kai / 雨の日スペシャリスト",
    bio: "雨予報でも予定を変えない。屋内で完結する濃いデートコースを集めています。",
    avatarSeed: "creator-kai",
    followers: 6700,
    following: 410,
    totalDates: 22,
    totalReproductions: 980,
    averageRating: 4.4,
  },
  {
    id: "c5",
    name: "Yua | カフェと散歩",
    bio: "昼デート専門。カフェ・ギャラリー・公園をつなぐ、ゆるくて心地いい休日を。",
    avatarSeed: "creator-yua",
    followers: 10300,
    following: 260,
    totalDates: 37,
    totalReproductions: 1440,
    averageRating: 4.6,
  },
  {
    id: "c6",
    name: "Haru / アクティブ担当",
    bio: "座りっぱなしのデートが苦手な2人へ。体を動かして距離が縮まるプランを投稿。",
    avatarSeed: "creator-haru",
    followers: 5400,
    following: 150,
    totalDates: 19,
    totalReproductions: 760,
    averageRating: 4.3,
  },
];

export const CREATOR_MAP: Record<string, CreatorProfile> = Object.fromEntries(
  CREATORS.map((c) => [c.id, c]),
);

// デモの操作ユーザー（ログイン概念なし）
export const DEMO_USER: User = {
  id: "me",
  name: "you_demo",
  bio: "DDデモを体験中のユーザー。良かったデートを再現していきます。",
  avatarSeed: "demo-user",
  followers: 12,
  following: 0,
};
