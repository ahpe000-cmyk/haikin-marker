# DD — Date × Decoration

> デートを投稿する。見つける。真似する。
> 誰かの最高のデートが、次の誰かの思い出になる。

DDは、**個人・カップルが実際に体験・設計したデートをSNSとして投稿し、他のユーザーが閲覧・フォロー・保存・再現できる「デート体験SNS」** です。

## DDとは何か（Product Concept）

- **SNSが主役** — Homeは人と投稿を発見する縦型フィード
- **デート体験がコンテンツ** — 投稿にはエリア・予算・タイムラインを持つStructured Dateを紐づけられる（Optional）
- **再現がDD独自機能** — 気に入ったデートは「保存（あとで見る）」とは別に「再現（実際にやる）」できる

DDはマッチングアプリでは**ありません**。解決するのは「誰とデートするか」ではなく「その相手とどんなデートをするか」です。

### DD Social Loop

```
投稿を見る → Follow → Save → デート詳細 → 「このデートを再現」
→ 実際にデートする → 再現投稿 → Original Creatorへ実績還元
→ Creator Score上昇 → ランキング上昇
```

## Demo Purpose

これは本番サービスではなく、**SNS版DDの事業仮説を検証する操作可能デモ**です。

検証仮説:
1. 他人・他カップルのデート体験をSNSとして見たい
2. 気に入ったデートを保存したい
3. 保存だけでなく「実際にやってみる」再現行動が発生する
4. 自分のデート体験を投稿したいユーザーが存在する
5. 個人・カップル・Creatorランキングが投稿動機になる
6. 「再現された回数」がDD独自のSocial Proofとして機能する

## Tech Stack

- Next.js 14 (App Router) / TypeScript (strict) / Tailwind CSS
- shadcn/uiスタイルの自作UIプリミティブ + Lucide Icons
- 状態管理: React Context + pure reducer + localStorage永続化
- テスト: Vitest
- Package Manager: pnpm

バックエンドなし（Supabase / Firebase / Auth / 決済 / Push / Maps / AI APIすべて不使用）。

## Setup / Development / Build / Tests

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Vitest (58 tests)
```

## Routes

| Route | Screen |
|---|---|
| `/` | SCREEN 02 Home Feed（初回のみSCREEN 01 Onboardingオーバーレイ） |
| `/home` | `/`へのalias |
| `/discover` | SCREEN 04 Discover（デートを探す場所） |
| `/search` | SCREEN 05 Search Results（Dates / Users / Couples） |
| `/post/[id]` | SCREEN 03 Post Detail（コメント投稿可） |
| `/date/[id]` | SCREEN 06 Date Detail（Timeline / Tips / Reviews / 再現一覧） |
| `/date/[id]/reproduce` | SCREEN 07 Reproduce Date + SCREEN 08 Reproduction Complete |
| `/create` | SCREEN 09 Create Post（7 Step / Date情報はOptional / 再現投稿対応） |
| `/ranking` | SCREEN 10 Ranking（Dates / Couples / Creators / Rising） |
| `/couple/[id]` | SCREEN 11 Couple Profile |
| `/profile/[id]` | SCREEN 12 Individual Profile |
| `/me` | SCREEN 13 My Page（Edit Profileモーダル） |
| `/me/saved` | SCREEN 14 Saved（投稿 / デート） |
| `/notifications` | SCREEN 15 Notifications（UIのみ） |

## Directory Structure

```
dd/
├── app/                  # App Router pages（全てClient Component）
├── components/
│   ├── social/           # FeedPost, PostHeader, PostActions, Comment系, Follow系
│   ├── date/             # DateSummary, DateCard, Timeline
│   ├── profile/          # ProfileStats, DdStats, ProfileContent
│   ├── create/           # Create Postの各Step
│   ├── shared/           # AppHeader, BottomNavigation, SmartImage, 状態系
│   └── ui/               # Button, Badge, Dialog, Tabs, Toast, Avatar等
├── data/mock/            # Mock Data（UIから分離）
├── repositories/         # Mock Repository層（将来Supabase実装へ差し替え）
├── lib/                  # score.ts, state.ts(pure reducer), store.tsx, selectors.ts
├── types/                # ドメイン型定義
└── tests/                # Vitestユニット/フローテスト
```

### Repository Pattern

UIはMock Dataを直接importせず、`repositories/`（同期Mock実装）と`lib/selectors.ts`（Mock + ユーザー操作stateの合成）を経由します。本番化時は`repositories/`を同一シグネチャのSupabase実装（async化）へ差し替える想定です。

## Data Model

主要型（`types/index.ts`）:

- **Actor** — 投稿者の抽象型。`User`（individual）と`Couple`が実装。UI側の分岐を最小化
- **Post** — `normal` / `date` / `reproduction`の3タイプ。`dateId` / `originalDateId` / `originalPostId`で構造化データと再現元にリンク
- **DateExperience** — Structured Date（title / area / budget / duration / scene / tags / timeline / tips / rating / saveCount / reproductionCount）
- **DateStop** — Timeline上の1スポット（time / placeName / category / durationMinutes / estimatedCost）
- **Reproduction** — 再現記録（originalDateId / reproductionPostId / changedStops / rating）
- **Comment / Review / RankingEntry / AppNotification / SavedItem**

## Mock Data

`data/mock/` に分離。Individual 14名（うち1名は操作用Demo User「Rin」）、Couple 8組、投稿48件（date 26 / reproduction 16 / normal 6）、Structured Date 26件、Reproduction記録16件、コメント90件超、レビュー34件超。

Hero Case: **Mai × Yui**（c1）の「銀座で少し背伸びする1周年デート」（d01 / p01、438再現）。

## State Persistence

ユーザー操作は`localStorage`キー`dd-demo-state-v1`に保存されます（`lib/store.tsx`）:

- Like / Unlike、Save / Unsave（投稿・デート別）、Follow / Unfollow
- コメント投稿、新規投稿（通常 / デート付き / 再現）
- 再現の進行状況（開始 / Stop完了 / 完走）
- Report / Block、通知既読、Onboarding完了、プロフィール編集

reducerは純関数（`lib/state.ts`）でユニットテスト済み。

## Demo Algorithms（デモ用 — 本番アルゴリズムではない）

### Demo Feed Score（おすすめフィード順）
`Reproduction 40% + Save 25% + Engagement 20% + Freshness 15%`（`lib/score.ts calcFeedScore`）。デモ作成投稿は最上部に固定。

### Demo Creator DD Score
`Reproduction貢献 40% + Save→Reproduction転換 20% + 平均評価 20% + Engagement 10% + 投稿継続性 10%`（`calcCreatorScore`）。**Follower数を主軸にしない**（既存SNSインフルエンサーのランキング独占を防ぎ、DD内部で価値を生んだCreatorを評価）。

### Demo Date Ranking Score
`正規化Reproduction ×40 + 正規化Save ×25 + Rating ×20 + 正規化Comment ×10 + Freshness ×5`（`calcDateScore`）。

### Rising Ranking
再現効率（再現数/デート数）×小規模アカウント補正（`calcRisingScore`）。大手Creatorの固定上位化を防ぐデモ用ヒューリスティック。

## Analytics（将来取得すべきEvent）

本番検証時に実装するイベント: `feed_view` / `post_open` / `follow` / `save` / `reproduce_start` / `reproduce_complete` / `reproduction_post` / `create_post` / `ranking_open`

最重要KPI: **Reproduction Rate = Reproduction Starts ÷ Date Detail Views**、Reproduction Completion Rate、Post Creation Rate、Save Rate、D1/D7 Retention。

## Non-goals（今回実装しない）

本番Auth、Couple招待処理、DM / Messaging、Dating Matching（異性検索・Swipe等は仕様上禁止）、決済 / Stripe、実地図 / 予約API、AI推薦、Push通知、Creator payout、管理画面、動画アップロード基盤、リアルタイムチャット。

## Future Production Architecture

Supabase Auth + PostgreSQL + Storage、`repositories/`のSupabase実装差し替え、Realtime通知、検索基盤、予約/店舗送客アフィリエイト、Creator Reward、Premium Subscription、AI Date Assistant。

## Known Limitations

- 画像は`picsum.photos`のプレースホルダー（オフライン時はフォールバック表示）
- 通知はUIのみ・投稿画像は用意されたサンプルからの選択（アップロードなし）
- 検索・フィルタはクライアントサイドの単純一致
- Mock Actorの統計値（followers等）はフィード上の実投稿数とは独立したデモ値
- 再現によるカウント増加（元デートのreproductionCount等）は表示上の集計のみで、Mock数値自体は更新しない
