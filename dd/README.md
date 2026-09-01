# DD — Date × Decoration（デモアプリ）

> **いいデートは、再現できる。**

AHPEの恋愛・デート領域サービス **DD** の操作可能なデモアプリです。

## DDとは

DDは **「デート特化型SNS × デート再現プラットフォーム × クリエイターエコノミー」** です。

ユーザーが他人の実際のデート体験を

**探す → 保存する → 実際に使う・再現する → 自分でも投稿する → 評価する → ランキングされる**

という循環でつなぐサービスで、「お店単体」ではなく **デートコースそのもの（タイムライン付き）を1つのコンテンツ** として扱います。

### ⚠️ マッチングアプリではありません

DDは「誰とデートするか」を扱いません。異性検索・スワイプ・マッチング・出会い目的のDMなどの機能は **存在せず、今後も本デモの範囲では実装しません**。DDが支援するのは「その人と、どんなデートをするか」です。

## Demo purpose

第三者が3〜5分デモを操作するだけで、以下を理解できることが目的です。

1. DDとは何か
2. 既存のマッチングアプリと何が違うか
3. デートをどう発見するか
4. 保存したデートをどう再現するか
5. デート後にどう投稿・評価するか
6. 良いデートがどうランキングされるか
7. デートクリエイターが将来どう収益化できるか

本番プロダクトではないため、バックエンド・認証・決済・地図連携等は意図的に省略しています。

## Setup / Run / Build / Test

Node.js 20+ / npm を想定しています。

```bash
cd dd
npm install

npm run dev        # 開発サーバー（http://localhost:3000）
npm run build      # プロダクションビルド
npm run start      # ビルド済みアプリの起動
npm run lint       # ESLint
npm run typecheck  # TypeScript（tsc --noEmit）
npm run test       # Vitest（ロジックのユニットテスト）
```

## Directory structure

```
dd/
  app/                  # Next.js App Router（画面）
    page.tsx            # Splash / Demo Start
    home/               # Home
    search/             # Search（検索＋絞り込み＋結果）
    date/[id]/          # Date Detail
    date/[id]/reproduce # Reproduce Date（再現チェックリスト）
    date/[id]/review    # Post-Date Review
    create/             # Create Post（4ステップ投稿）
    ranking/            # Ranking
    creator/[id]/       # Creator Profile
    me/                 # My Page（Creator Dashboard DEMO含む）
    me/saved/           # Saved Dates
  components/dd/        # 再利用UI（AppHeader / BottomNavigation / DateCard /
                        # CreatorCard / Rating / Tag / FilterChip / Timeline /
                        # SaveButton / FollowButton / RankingList / States /
                        # Toast / ConfirmDialog / ReportBlockMenu / CoverImage）
  data/                 # モックデータ（プラン14件・クリエイター6人・レビュー）
  lib/                  # ロジック（ranking / filter / store / format / image）
  hooks/                # DemoStoreProvider（状態管理＋localStorage永続化）
  types/                # TypeScript型定義
  tests/                # Vitest（ranking / filter / store）
```

## Main routes

| Route | 画面 |
| --- | --- |
| `/` | Splash / Demo Start |
| `/home` | Home |
| `/search` | Search（`?scene=night` 等のディープリンク対応） |
| `/date/[id]` | Date Detail |
| `/date/[id]/reproduce` | Reproduce Date |
| `/date/[id]/review` | Post-Date Review |
| `/create` | Create Post |
| `/ranking` | Ranking |
| `/creator/[id]` | Creator Profile |
| `/me` | My Page |
| `/me/saved` | Saved Dates |

## おすすめのデモ手順（3〜5分）

1. `/` →「DDを体験する」
2. Homeから「恵比寿で過ごす大人の夜デート」を開く
3. 「保存」→「このデートを再現する」
4. 「デートを開始」→ 各Stopをチェック →「デートを完了」
5. レビューを投稿（評価4項目＋また使いたい＋コメント）
6. Ranking → Creator Profile（フォロー）→ My Page → Saved Dates
7. Createから自分のデートを投稿 → My PageのPostsに反映

## Demo dataについて

**画面に表示されるデートプラン・店舗名・価格・営業情報・評価・レビュー・クリエイター・報酬額は、すべて架空の「DEMO DATA」です。** 実在の店舗・施設・人物の情報ではありません。ユーザー操作（保存・フォロー・再現・レビュー・投稿）はブラウザの `localStorage` にのみ保存されます（サーバー送信なし）。

## Demo ranking algorithm

`lib/ranking.ts` に実装。**本番アルゴリズムではありません。**

```
Ranking Score =
    (rating / 5)                × 30
  + (reproduceCount / max再現数) × 35
  + (saveCount / max保存数)      × 25
  + (reviewCount / max評価数)    × 10
```

「実際に使われている（再現されている）デート」を最も重く評価します。タブ（総合／保存／再現／評価）ごとに該当指標でソートします。

## Production未実装機能（今回のスコープ外）

- 本番DB（Supabase等）・本番認証・アカウント
- 決済（Stripe）・実際のCreator報酬（My Pageの報酬表示は**DEMO表記の架空値**）
- Google Maps / Places連携・GPS・店舗予約API
- AI API・レコメンドAI・Push通知
- 画像アップロード（画像はプレースホルダー写真＋ロード失敗時のグラデーションfallback）
- Report / Blockのサーバー処理（UI・確認モーダル・トーストのみ）
- DM・チャット・男女マッチング（**仕様として実装しない**）
