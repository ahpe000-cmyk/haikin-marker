import type { Post, PostMedia, PostType, ActorType } from "@/types";
import { photo } from "@/lib/utils";

interface PostSeed {
  id: string;
  authorId: string;
  type: PostType;
  caption: string;
  mediaCount: number;
  location?: string;
  dateId?: string;
  originalDateId?: string;
  originalPostId?: string;
  likes: number;
  comments: number;
  saves: number;
  repros: number;
  createdAt: string;
}

function mkMedia(postId: string, count: number): PostMedia[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${postId}-m${i + 1}`,
    type: "image" as const,
    url: photo(`${postId}-m${i + 1}`),
    alt: `投稿写真 ${i + 1}`,
  }));
}

function mkPost(seed: PostSeed): Post {
  return {
    id: seed.id,
    authorId: seed.authorId,
    authorType: (seed.authorId.startsWith("c") ? "couple" : "individual") as ActorType,
    type: seed.type,
    caption: seed.caption,
    media: mkMedia(seed.id, seed.mediaCount),
    location: seed.location,
    dateId: seed.dateId,
    originalDateId: seed.originalDateId,
    originalPostId: seed.originalPostId,
    likesCount: seed.likes,
    commentsCount: seed.comments,
    savesCount: seed.saves,
    reproductionsCount: seed.repros,
    isLiked: false,
    isSaved: false,
    createdAt: seed.createdAt,
  };
}

/** Hero post — Mai × Yui's Ginza anniversary date post. */
export const HERO_POST_ID = "p01";

// ---------------------------------------------------------------------------
// Date posts (p01-p26) — each links to date dNN in data/mock/dates.ts
// ---------------------------------------------------------------------------
const datePosts: PostSeed[] = [
  { id: "p01", authorId: "c1", type: "date", dateId: "d01", location: "銀座", mediaCount: 4, likes: 8420, comments: 132, saves: 2913, repros: 438, createdAt: "2026-08-28T21:40:00+09:00",
    caption: "付き合って1周年。銀座で少し背伸びした夜。最後に行ったバーが予想以上によかった。全部のお店をタイムラインにまとめたので、記念日デートの参考にどうぞ。" },
  { id: "p02", authorId: "c1", type: "date", dateId: "d02", location: "中目黒", mediaCount: 2, likes: 4210, comments: 58, saves: 1340, repros: 187, createdAt: "2026-08-15T22:10:00+09:00",
    caption: "お金をかけない夜の正解、見つけた気がする。中目黒の川沿いをテイクアウトのコーヒー片手にただ歩くだけ。" },
  { id: "p03", authorId: "u2", type: "date", dateId: "d03", location: "表参道", mediaCount: 3, likes: 3120, comments: 44, saves: 1120, repros: 96, createdAt: "2026-08-24T11:20:00+09:00",
    caption: "朝活デートのすすめ。表参道でモーニング2軒はしごしてきた。朝の並木道、ほんとうに空いてて静かで良い。" },
  { id: "p04", authorId: "u3", type: "date", dateId: "d04", location: "恵比寿", mediaCount: 4, likes: 5230, comments: 71, saves: 1890, repros: 154, createdAt: "2026-08-20T16:45:00+09:00",
    caption: "恵比寿食べ歩き、4軒回る欲張りコース組んだ。全部シェア前提で頼むのがコツです。優勝はチーズバーガー。" },
  { id: "p05", authorId: "c3", type: "date", dateId: "d05", location: "鎌倉", mediaCount: 3, likes: 4680, comments: 62, saves: 1560, repros: 173, createdAt: "2026-08-10T18:30:00+09:00",
    caption: "鎌倉の海沿いを電動自転車で走ってきた。稲村ヶ崎で撮った1枚が今年のベストショットかもしれない。" },
  { id: "p06", authorId: "c4", type: "date", dateId: "d06", location: "新宿", mediaCount: 2, likes: 5890, comments: 88, saves: 1430, repros: 198, createdAt: "2026-08-26T20:00:00+09:00",
    caption: "ふたり合計2,000円の新宿デート。御苑の芝生→都庁展望室（無料）→思い出横丁。安いのに満足度が高すぎる。" },
  { id: "p07", authorId: "u5", type: "date", dateId: "d07", location: "六本木", mediaCount: 3, likes: 6120, comments: 54, saves: 1720, repros: 161, createdAt: "2026-08-18T23:05:00+09:00",
    caption: "夜景を「見に行く」んじゃなくて「撮りに行く」デート。お互いを撮り合うと自然な表情になる。けやき坂は22時前がベストライト。" },
  { id: "p08", authorId: "c6", type: "date", dateId: "d08", location: "六本木", mediaCount: 3, likes: 7040, comments: 92, saves: 2010, repros: 224, createdAt: "2026-08-29T19:30:00+09:00",
    caption: "金曜の夜はルーフトップバー直行が正解。仕事終わりの1杯目、夕暮れから夜景に変わる時間。〆はたい焼き半分こ。" },
  { id: "p09", authorId: "u10", type: "date", dateId: "d09", location: "下北沢", mediaCount: 2, likes: 4450, comments: 67, saves: 1280, repros: 176, createdAt: "2026-08-22T17:15:00+09:00",
    caption: "1,500円で下北沢を遊び尽くす。古着屋でお互いの1着を選び合う→あいがけカレー。低予算デートの完成形です。" },
  { id: "p10", authorId: "c5", type: "date", dateId: "d10", location: "表参道", mediaCount: 4, likes: 5310, comments: 49, saves: 1610, repros: 142, createdAt: "2026-08-12T15:40:00+09:00",
    caption: "表参道から代官山までカフェ3軒。蔦屋書店で本を1冊ずつ選んで見せ合うの、おすすめです。相手の意外な一面が見える。" },
  { id: "p11", authorId: "u4", type: "date", dateId: "d11", location: "横浜", mediaCount: 5, likes: 5720, comments: 76, saves: 1950, repros: 168, createdAt: "2026-08-08T21:00:00+09:00",
    caption: "みなとみらい、王道だけど全部盛りの日帰りプラン。観覧車は日没直後を狙って。夜景ディナーまで入れて1人1万円弱。" },
  { id: "p12", authorId: "c7", type: "date", dateId: "d12", location: "恵比寿", mediaCount: 3, likes: 4980, comments: 83, saves: 1740, repros: 129, createdAt: "2026-08-25T22:30:00+09:00",
    caption: "肉づくしの夜。焼肉→イルミネーション散歩→〆の担々麺。カロリーは幸福で相殺されるという学説を提唱したい。" },
  { id: "p13", authorId: "u6", type: "date", dateId: "d13", location: "上野", mediaCount: 2, likes: 2340, comments: 31, saves: 890, repros: 84, createdAt: "2026-08-05T17:50:00+09:00",
    caption: "美術館デートのコツは「感想はあとで言う」。静かに観て、あんみつ食べながら感想会。この時間差が良いんです。" },
  { id: "p14", authorId: "u12", type: "date", dateId: "d14", location: "新宿", mediaCount: 2, likes: 3670, comments: 47, saves: 1180, repros: 157, createdAt: "2026-08-21T14:20:00+09:00",
    caption: "雨予報でも中止にしない。新宿の地下街だけで完結するデートコースを組みました。傘は駅までしか使いません。" },
  { id: "p15", authorId: "u11", type: "date", dateId: "d15", location: "銀座", mediaCount: 3, likes: 6890, comments: 61, saves: 2380, repros: 118, createdAt: "2026-08-14T23:15:00+09:00",
    caption: "記念日のフルコース、これが今のところの正解です。アペリティフ→フレンチ→和光の時計台前で写真。1ヶ月前予約は必須。" },
  { id: "p16", authorId: "c3", type: "date", dateId: "d16", location: "江ノ島", mediaCount: 3, likes: 5140, comments: 69, saves: 1490, repros: 182, createdAt: "2026-08-30T19:45:00+09:00",
    caption: "江ノ島で夕日を追いかけてきた。稚児ヶ淵の岩場から見る夕日、言葉がいらなくなる。日没から逆算して15時スタートで。" },
  { id: "p17", authorId: "u9", type: "date", dateId: "d17", location: "銀座", mediaCount: 2, likes: 3210, comments: 38, saves: 1080, repros: 93, createdAt: "2026-08-06T23:50:00+09:00",
    caption: "銀座のバー2軒はしご。1軒目はフルーツカクテル、2軒目はウイスキー。この順番が一番きれいに酔えます。" },
  { id: "p18", authorId: "u1", type: "date", dateId: "d18", location: "谷中", mediaCount: 3, likes: 2890, comments: 42, saves: 940, repros: 108, createdAt: "2026-08-17T18:10:00+09:00",
    caption: "谷根千さんぽ。メンチカツ食べて、夕焼けだんだんで写真撮って、老舗喫茶でたまごサンド。休日の午後はこれでいい。" },
  { id: "p19", authorId: "c8", type: "date", dateId: "d19", location: "渋谷", mediaCount: 2, likes: 1820, comments: 26, saves: 620, repros: 71, createdAt: "2026-08-23T19:20:00+09:00",
    caption: "あえてノープランで渋谷デート。決めたのは集合場所と解散時間だけ。「お互い1回ずつ行き先指名権」ルールが盛り上がる。" },
  { id: "p20", authorId: "u8", type: "date", dateId: "d20", location: "自宅", mediaCount: 2, likes: 3450, comments: 52, saves: 870, repros: 132, createdAt: "2026-08-27T23:40:00+09:00",
    caption: "おうち映画祭を開催しました。交互に1本ずつ選んで、上映前に30秒プレゼン。途中で夜食のパスタを2人で作るのが最高。" },
  { id: "p21", authorId: "u13", type: "date", dateId: "d21", location: "渋谷", mediaCount: 2, likes: 3980, comments: 64, saves: 1150, repros: 89, createdAt: "2026-08-09T22:00:00+09:00",
    caption: "誕生日サプライズの設計図を公開します。ポイントは「普通のデートを装う」こと。サプライズは1回に絞る。手紙が一番効く。" },
  { id: "p22", authorId: "u7", type: "date", dateId: "d22", location: "高尾山", mediaCount: 3, likes: 3560, comments: 45, saves: 1210, repros: 141, createdAt: "2026-08-11T16:30:00+09:00",
    caption: "高尾山ゆるハイク。ケーブルカー使えば普段着でOK。下山後のとろろ蕎麦が本体なので、朝食は軽めに。" },
  { id: "p23", authorId: "c2", type: "date", dateId: "d23", location: "横浜中華街", mediaCount: 4, likes: 4120, comments: 59, saves: 1380, repros: 126, createdAt: "2026-08-19T15:55:00+09:00",
    caption: "中華街で小籠包食べ比べマラソン。2店舗回って優勝を決めるスタイル。真剣に採点するほど楽しい。" },
  { id: "p24", authorId: "u2", type: "date", dateId: "d24", location: "表参道", mediaCount: 2, likes: 6240, comments: 97, saves: 1830, repros: 214, createdAt: "2026-08-31T12:40:00+09:00",
    caption: "「初デート、どこ行けばいい？」と聞かれ続けたのでコース化しました。2時間で切り上げるのが次につながります。" },
  { id: "p25", authorId: "u3", type: "date", dateId: "d25", location: "恵比寿", mediaCount: 2, likes: 4470, comments: 66, saves: 1270, repros: 138, createdAt: "2026-08-13T21:25:00+09:00",
    caption: "初デートで外さない恵比寿の夜、作りました。個室より半個室。2軒目に誘うかは残り30分で判断しましょう。" },
  { id: "p26", authorId: "c6", type: "date", dateId: "d26", location: "お台場", mediaCount: 3, likes: 2760, comments: 35, saves: 780, repros: 66, createdAt: "2026-08-07T23:30:00+09:00",
    caption: "夜のドライブデート。レインボーブリッジは往復して2回楽しむのが正解。カーシェアで十分です。" },
];

// ---------------------------------------------------------------------------
// Reproduction posts (p27-p42) — each has a record rNN in reproductions.ts
// ---------------------------------------------------------------------------
const reproductionPosts: PostSeed[] = [
  { id: "p27", authorId: "c2", type: "reproduction", dateId: "d01", originalDateId: "d01", originalPostId: "p01", location: "銀座", mediaCount: 3, likes: 2140, comments: 48, saves: 520, repros: 0, createdAt: "2026-09-01T22:20:00+09:00",
    caption: "Mai × Yuiさんの銀座1周年デートを再現しました。バーだけ自分たちの好きな店に変更。ディナーの窓際席、ほんとうに夜景がきれいでした。真似して正解。" },
  { id: "p28", authorId: "u10", type: "reproduction", dateId: "d06", originalDateId: "d06", originalPostId: "p06", location: "新宿", mediaCount: 2, likes: 1890, comments: 29, saves: 340, repros: 0, createdAt: "2026-08-29T21:10:00+09:00",
    caption: "Takumi × Emiさんの2,000円新宿デートを再現。都庁展望室、無料であの夜景は反則です。低予算デート研究家として脱帽。" },
  { id: "p29", authorId: "c4", type: "reproduction", dateId: "d09", originalDateId: "d09", originalPostId: "p09", location: "下北沢", mediaCount: 2, likes: 1560, comments: 24, saves: 280, repros: 0, createdAt: "2026-08-28T18:40:00+09:00",
    caption: "Mioさんの下北沢1,500円コースを再現してきた。古着屋でお互いの服を選び合うやつ、想像の3倍盛り上がった。" },
  { id: "p30", authorId: "c5", type: "reproduction", dateId: "d03", originalDateId: "d03", originalPostId: "p03", location: "表参道", mediaCount: 3, likes: 1720, comments: 21, saves: 310, repros: 0, createdAt: "2026-08-27T13:00:00+09:00",
    caption: "Hinaさんのモーニングはしごを再現。朝9時の表参道がこんなに気持ちいいなんて。2軒目は自分たちの定番店に変更しました。" },
  { id: "p31", authorId: "u1", type: "reproduction", dateId: "d02", originalDateId: "d02", originalPostId: "p02", location: "中目黒", mediaCount: 2, likes: 1340, comments: 18, saves: 240, repros: 0, createdAt: "2026-08-26T22:50:00+09:00",
    caption: "Mai × Yuiさんの中目黒夜さんぽを再現。散歩デート専門の自分から見ても、このコース設計は完璧です。" },
  { id: "p32", authorId: "c8", type: "reproduction", dateId: "d24", originalDateId: "d24", originalPostId: "p24", location: "表参道", mediaCount: 2, likes: 980, comments: 15, saves: 190, repros: 0, createdAt: "2026-08-31T18:20:00+09:00",
    caption: "付き合う前に戻った気分で、Hinaさんの初デートコースを再現。ブックカフェの本棚、たしかに会話が途切れない。" },
  { id: "p33", authorId: "u5", type: "reproduction", dateId: "d08", originalDateId: "d08", originalPostId: "p08", location: "六本木", mediaCount: 3, likes: 2230, comments: 33, saves: 410, repros: 0, createdAt: "2026-08-30T20:30:00+09:00",
    caption: "Yuto × Naoさんのルーフトップバー直行プランを再現。夕暮れ→夜景のグラデーション、写真好きにはたまらない時間帯でした。" },
  { id: "p34", authorId: "c6", type: "reproduction", dateId: "d07", originalDateId: "d07", originalPostId: "p07", location: "六本木", mediaCount: 2, likes: 1870, comments: 27, saves: 350, repros: 0, createdAt: "2026-08-24T23:20:00+09:00",
    caption: "Kaitoさんの夜景撮影デートを再現。「見に行く」んじゃなくて「撮りに行く」、この発想の転換すごい。お互いを撮り合うの照れるけど楽しい。" },
  { id: "p35", authorId: "u12", type: "reproduction", dateId: "d13", originalDateId: "d13", originalPostId: "p13", location: "上野", mediaCount: 2, likes: 890, comments: 12, saves: 160, repros: 0, createdAt: "2026-08-23T17:30:00+09:00",
    caption: "雨の日にYunaさんの美術館デートを再現。「感想はあとで言う」ルール、時間差で会話が深くなる。雨の日の選択肢が増えました。" },
  { id: "p36", authorId: "c3", type: "reproduction", dateId: "d22", originalDateId: "d22", originalPostId: "p22", location: "高尾山", mediaCount: 3, likes: 1450, comments: 20, saves: 270, repros: 0, createdAt: "2026-08-22T16:10:00+09:00",
    caption: "Tsubasaさんの高尾山ゆるハイクを再現。アウトドア派のわたしたちはケーブルカーなしの6号路に変更。蕎麦は正義。" },
  { id: "p37", authorId: "u9", type: "reproduction", dateId: "d15", originalDateId: "d15", originalPostId: "p15", location: "銀座", mediaCount: 2, likes: 1680, comments: 19, saves: 380, repros: 0, createdAt: "2026-08-21T23:55:00+09:00",
    caption: "Harutoさんの記念日フルコースを再現。食後の1杯だけ、行きつけのバーに変更させてもらいました。余韻まで設計されたコース。" },
  { id: "p38", authorId: "c7", type: "reproduction", dateId: "d04", originalDateId: "d04", originalPostId: "p04", location: "恵比寿", mediaCount: 3, likes: 1980, comments: 31, saves: 360, repros: 0, createdAt: "2026-08-25T15:45:00+09:00",
    caption: "地元・恵比寿でRenさんの食べ歩きコースを再現。地元民でも知らない店が2軒あって悔しい。優勝は同じくチーズバーガーでした。" },
  { id: "p39", authorId: "u4", type: "reproduction", dateId: "d23", originalDateId: "d23", originalPostId: "p23", location: "横浜中華街", mediaCount: 2, likes: 1230, comments: 17, saves: 220, repros: 0, createdAt: "2026-08-20T14:30:00+09:00",
    caption: "Kenta × Ayaさんの小籠包マラソンを再現。採点表まで作って挑みました。僅差で2軒目の優勝。異論は認めます。" },
  { id: "p40", authorId: "c1", type: "reproduction", dateId: "d16", originalDateId: "d16", originalPostId: "p16", location: "江ノ島", mediaCount: 3, likes: 3240, comments: 41, saves: 610, repros: 0, createdAt: "2026-09-01T19:15:00+09:00",
    caption: "いつも再現してもらう側のわたしたちが、Shun × Rikoさんの江ノ島夕日ハイクを再現。稚児ヶ淵の夕日、これは全カップルが見るべき。" },
  { id: "p41", authorId: "u2", type: "reproduction", dateId: "d10", originalDateId: "d10", originalPostId: "p10", location: "代官山", mediaCount: 2, likes: 1540, comments: 22, saves: 290, repros: 0, createdAt: "2026-08-18T16:50:00+09:00",
    caption: "Ryo × Sakiさんのカフェ3軒巡りを再現。カフェ専門の身として3軒の配分が完璧すぎて感動。本の見せ合いも採用します。" },
  { id: "p42", authorId: "u13", type: "reproduction", dateId: "d01", originalDateId: "d01", originalPostId: "p01", location: "銀座", mediaCount: 2, likes: 2020, comments: 26, saves: 430, repros: 0, createdAt: "2026-08-30T23:00:00+09:00",
    caption: "Mai × Yuiさんの銀座デートを、彼女の誕生日サプライズ用にアレンジして再現。ディナーでケーキを仕込みました。元コースが強いとサプライズも決まる。" },
];

// ---------------------------------------------------------------------------
// Normal lifestyle posts (p43-p48)
// ---------------------------------------------------------------------------
const normalPosts: PostSeed[] = [
  { id: "p43", authorId: "c1", type: "normal", location: "自宅", mediaCount: 1, likes: 5120, comments: 74, saves: 210, repros: 0, createdAt: "2026-09-01T09:30:00+09:00",
    caption: "日曜の朝。ふたりでパンケーキ焼くだけの日も、ちゃんと良い日。" },
  { id: "p44", authorId: "u2", type: "normal", location: "表参道", mediaCount: 1, likes: 1870, comments: 23, saves: 90, repros: 0, createdAt: "2026-08-29T10:15:00+09:00",
    caption: "新しく見つけたカフェのカヌレが優勝だった。今度のコースに組み込みます。" },
  { id: "p45", authorId: "c5", type: "normal", location: "代官山", mediaCount: 2, likes: 2340, comments: 28, saves: 110, repros: 0, createdAt: "2026-08-28T17:00:00+09:00",
    caption: "古着屋で色違いのシャツを買ってしまった。ペアルックではない。断じて。" },
  { id: "p46", authorId: "u7", type: "normal", location: "鎌倉", mediaCount: 1, likes: 1450, comments: 16, saves: 60, repros: 0, createdAt: "2026-08-27T07:45:00+09:00",
    caption: "朝の海。次のアウトドアデートの下見も兼ねて。波の音だけでいい朝もある。" },
  { id: "p47", authorId: "c6", type: "normal", location: "六本木", mediaCount: 1, likes: 2980, comments: 39, saves: 130, repros: 0, createdAt: "2026-08-26T21:50:00+09:00",
    caption: "今夜は月がきれいなので急遽ベランダバー開店。おつまみはコンビニ。それでも景色は一流。" },
  { id: "p48", authorId: "u_me", type: "normal", location: "東京", mediaCount: 1, likes: 42, comments: 5, saves: 3, repros: 0, createdAt: "2026-08-25T19:20:00+09:00",
    caption: "週末に再現したいデートを集め始めました。気になるコースが多すぎて困る。" },
];

export const mockPosts: Post[] = [...datePosts, ...reproductionPosts, ...normalPosts].map(mkPost);
