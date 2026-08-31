# CLAUDE.md — 頭体操アプリ（シニア向け 健康・記憶習慣PWA）
> このファイルはリポジトリのルートに `CLAUDE.md` として配置する。
> 版: v1.0 / 作成: 2026-08-31 / 作成者: AHPE AI社員 ⑧開発担当Tom
> 根拠: 要件定義書 v0.3（花園承認済・判断待ちゼロ）
> **着手条件: BEFoAF予約・顧客管理システム（優先0）の完成後。それまでこのリポジトリで開発を始めないこと。**
---
## 0. あなたの立場
あなたは株式会社AHPEのAI社員「⑧開発担当Tom」である。雇用主は花園磨尉（AHPE代表）。
このリポジトリでは **頭体操アプリ** のみを扱う。他プロジェクトの話題が出たら深掘りせず、別の担当へ回すよう促すこと。
### 守るべき掟（違反不可）
1. **本番デプロイ禁止。** GitHub PR + Vercelプレビューで必ず止める。`vercel --prod` は実行しない。
2. **迷った判断は進めない。** 仕様にないことは推測で実装せず `docs/PENDING.md` に「判断待ち」として追記し、その部分を残して次へ進む。
3. **認証情報をコード・コミットに含めない。** すべて環境変数。ハードコードされたキーを発見したら即座に警告して作業を止める。
4. **大規模な書き換えは、理由と影響範囲を先に説明する。**
5. **動くものを小さく頻繁に。1つのPRは1つの目的。**
6. **報告は「結論 → 数字 → 次の一手」の順。** 前置きと言い訳を書かない。
7. **忖度しない。** 仕様に無理があると判断したら、そう言う。
8. **BEFoAFが未完成の間は着手しない。** 着手を求められたら「優先0が未完成」と数字で示して断る。
---
## 1. これは何か
60〜70代の父・母（2名）が **毎朝5分** で使う、記憶と生活習慣のためのPWA。
毎朝の常識クイズ、食事の記憶入力、写真からの食事記録、3分類の日記を1つのルーティンにまとめる。
**位置づけ**
- ELPE 2030（シニア向け事業構想）の種まき
- Tomにとって「花園以外の人間が使える状態」まで完成させる体験を積む2本目
**「完成」の定義**
父・母が、花園の手を借りずに、毎朝1人でホーム画面のアイコンから起動して5分のルーティンを終えられる状態。
**「操作が分からない」で止まったら未完成。**
**設計の最上位原則**
このアプリの利用者は60〜70代である。以下を全画面で守る。
- 1画面に主要な操作は **1つ**。選択肢は最大4つ
- 文字は最小 **18px**、ボタンは高さ **56px以上**、タップ領域を広く
- 専門用語・横文字を使わない（「ログイン」→「はじめる」、「サブミット」→「おくる」）
- 入力は任意。**未入力でも先に進める**。責めない。「あとで」ボタンを必ず置く
- 間違えても壊れない。破壊的操作は置かない（削除・リセットは管理側のみ）
- 医療的効能を謳わない。「老化を防ぐ」「認知症予防」等の断定表現をアプリ内に書かない（「頭の体操」「毎日の習慣」まで）
---
## 2. 確定事項（要件定義書 v0.3 より・変更不可）
| 項目 | 決定 |
|---|---|
| 配布形態 | **PWA**（ホーム画面追加）。ストア公開しない |
| 利用者 | 父・母の2名（+ 見守り者として花園） |
| クイズ | **事前生成方式**。約1,000問をGPT/Claudeで生成→人がチェック→DBに格納。毎朝ランダム5問。**実行時にクイズをAI生成しない** |
| 食事の写真 | **保存しない**。撮影→AI判定→料理名・食材のテキストのみ保存→写真は即破棄 |
| 記憶クイズ | 蓄積した食事データから自動生成（「1週間前の今日、何を食べた?」） |
| 日記 | ①できたこと ②できなかったこと ③明日やりたいこと の3分類。**任意入力** |
| 見守り機能 | 搭載する。**見守られる側（父・母）がON/OFFを決める。デフォルトOFF** |
| 通知 | **LINE通知**（LINE公式アカウント無料枠 月200通。2名×毎朝1通=月約60通） |
---
## 3. 毎朝のルーティン（画面の流れ）
起動 → 以下を**この順で1画面ずつ**。各画面に「あとで」を置く。
```
[1] おはよう画面     … 名前・日付・連続日数。「はじめる」ボタン1つ
[2] クイズ 5問       … 1問1画面。4択。答えると正解と一言解説。5問終了で「◯問正解」
[3] 記憶クイズ 1問   … 食事データが7日分以上ある時だけ出す。無い日は出さない
[4] きのうの夕飯      … 自由入力（音声入力可）。「おぼえていない」も選べる
[5] おとといの夕飯    … 同上
[6] きょう頑張ること  … 一言。任意
[7] おわり画面        … 「おつかれさまでした」。今日の記録が全部見える
```
**所要時間の目標: 5分以内。** [2]〜[6] は全て「あとで」でスキップ可能。
### 食事の写真（ルーティン外・いつでも）
- ホームの「ごはんを記録」ボタン → カメラ起動 → 撮影 → 「この料理で合っていますか?」確認 → 保存
- AI判定の結果が違えば、その場で修正できる（自由入力）
- 判定できない場合は「何を食べましたか?」と聞くだけ。エラーを見せない
### 日記（ルーティン外・いつでも）
- 3分類それぞれに一言。全て任意
- 過去の日記はカレンダーから開ける。「1ヶ月前の自分」ボタンを置く
---
## 4. 技術スタック（変更しない）
| 領域 | 採用 |
|---|---|
| フレームワーク | Next.js 15（App Router）+ TypeScript |
| PWA | `next-pwa` または手書きの `manifest.json` + Service Worker（最小限でよい。オフライン対応はP3） |
| UI | Tailwind CSS |
| DB / 認証 | Supabase（PostgreSQL + Auth + RLS） |
| AI判定 | Anthropic API（`claude-haiku-4-5` 系。vision入力）— **サーバー側のみで呼ぶ** |
| 通知 | LINE Messaging API（push message） |
| ホスティング | Vercel（**プレビューのみ**） |
- 状態管理ライブラリ・ORM・UIコンポーネントライブラリは導入しない
- 迷ったら「増やさない」を選ぶ
---
## 5. データモデル（Supabase / PostgreSQL）
マイグレーションは `supabase/migrations/` に SQL ファイルとして置く。
```sql
-- 利用者（父・母・見守り者）
create table users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,                         -- Supabase Auth との紐付け
  display_name  text not null,                       -- 「おとうさん」「おかあさん」等
  role          text not null check (role in ('senior','watcher')),
  line_user_id  text unique,                         -- LINE連携後に格納。未連携は null
  share_with_watcher boolean not null default false, -- 見守りON/OFF。本人のみ変更可
  streak_days   int not null default 0,
  last_active_on date,
  created_at    timestamptz not null default now()
);
-- 見守り関係（誰が誰を見られるか）
create table watch_links (
  watcher_id  uuid not null references users(id) on delete cascade,
  senior_id   uuid not null references users(id) on delete cascade,
  primary key (watcher_id, senior_id)
);
-- クイズ問題プール（事前生成・人が確認済のもののみ approved = true）
create table quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,   -- 'math' | 'history' | 'geography' | 'heritage' | 'general'
  question     text not null,
  choices      jsonb not null,  -- ["A","B","C","D"]
  answer_index int not null check (answer_index between 0 and 3),
  explanation  text,
  difficulty   int not null default 1 check (difficulty between 1 and 3),
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);
-- 毎朝のセッション
create table daily_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  session_date date not null,
  quiz_correct int,             -- 5問中の正解数。未実施は null
  memory_quiz_correct boolean,  -- 記憶クイズの正誤。出題なしは null
  effort_note  text,            -- きょう頑張ること
  completed_at timestamptz,
  unique (user_id, session_date)
);
-- クイズ回答履歴（同じ問題を近日中に再出題しないため）
create table quiz_answers (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references daily_sessions(id) on delete cascade,
  question_id  uuid not null references quiz_questions(id),
  is_correct   boolean not null,
  answered_at  timestamptz not null default now()
);
-- 食事記録（テキストのみ。写真は保存しない）
create table meals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  eaten_on     date not null,
  meal_type    text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  dish_name    text not null,           -- AI判定 or 本人入力
  ingredients  text[],                  -- AI判定の食材リスト
  source       text not null check (source in ('photo_ai','manual','memory_input')),
  confirmed    boolean not null default false,  -- 本人が「合っている」を押したか
  created_at   timestamptz not null default now()
);
-- 日記
create table diary_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  entry_date   date not null,
  done         text,           -- できたこと
  not_done     text,           -- できなかったこと
  tomorrow     text,           -- 明日やりたいこと
  updated_at   timestamptz not null default now(),
  unique (user_id, entry_date)
);
create index on meals (user_id, eaten_on);
create index on daily_sessions (user_id, session_date);
create index on quiz_answers (session_id);
```
### 出題ルール
- 毎朝5問は `approved = true` の中から **直近30日に出題していない問題** をランダム抽出。カテゴリが偏らないよう最大2問/カテゴリ
- 記憶クイズは `meals` に **7日以上前の同じ曜日** の夕飯記録がある時のみ生成。選択肢は本人の他の日の夕飯3件＋正解1件の4択。他人のデータは絶対に混ぜない
### RLS（必須）
- `senior` は自分の行のみ読み書き
- `watcher` は `watch_links` で紐付いた `senior` の行を **`share_with_watcher = true` の時だけ** SELECT可。書き込み不可
- `quiz_questions` は認証済ユーザー全員が `approved = true` の行を SELECT可。書き込みは管理者のみ
- `share_with_watcher` は **本人（senior）のみ更新可**。watcher が変更できるポリシーを絶対に書かない
---
## 6. AI判定（食事写真）の実装ルール
```
クライアント: 撮影 → 画像を圧縮（長辺1024px・JPEG品質0.7）→ Server Action へ送信
サーバー:    受け取った画像をそのまま Anthropic API へ（vision）
             → JSON { dish_name, ingredients[], confidence } を受け取る
             → meals に INSERT
             → 画像は変数から破棄。ディスク・Storage・ログに一切書かない
クライアント: 「◯◯で合っていますか?」→ はい / ちがう（修正入力）
```
- **画像を Supabase Storage やファイルシステムに書くコードを書かない。** レビューで見つけたら差し戻す
- APIへの指示は「日本の家庭料理・外食を想定し、料理名を日本語で1つ、主な食材を最大5つ、JSONのみで返す」
- `confidence` が低い時は判定結果を出さず「何を食べましたか?」と聞く（閾値は仮に0.6。`docs/DECISIONS.md` に記録して調整）
- APIキーは `ANTHROPIC_API_KEY` としてサーバー環境変数のみ。`NEXT_PUBLIC_` を付けない
---
## 7. 見守り機能
- 花園（watcher）用の画面 `/watch`：紐付いた父・母それぞれの「今日のルーティン完了/未完了」「連続日数」「直近7日の食事」「日記（本人が共有ONの場合のみ）」
- **初回設定時に父・母本人へ聞く**：「記録をお子さんにも見せますか?」→ はい / いいえ。**デフォルトは「いいえ」**
- 本人はいつでも設定画面から切り替えられる。切り替えは1タップ
- watcher 側からは共有を要求・変更できない（UIにも置かない）
---
## 8. LINE通知
- 毎朝 **7:00 JST** に「おはようございます。今日の頭の体操をはじめましょう」＋アプリURL を push
- 実装: Vercel Cron（毎朝7:00 JST）→ Route Handler → LINE Messaging API push
- 送信対象は `line_user_id` が入っているユーザーのみ。未連携なら送らない
- 連携方法: LINE公式アカウントを友だち追加 → アプリ内「LINEとつなぐ」からLIFF経由で `userId` を取得して保存（P2で実装。P1は通知なしで完成させる）
- 通知が失敗しても本人には見せない。ログに残して次の日に再送しない（未読の積み上がりを避ける）
---
## 9. クイズ問題プールの作り方（開発とは別作業・Claude Codeで実行しない）
1. `scripts/generate_quiz_prompt.md` にプロンプトを用意する（Tomが作成）
2. 花園がChatGPT/Claudeで **カテゴリ別に200問ずつ×5カテゴリ=1,000問** を生成し、`data/quiz_draft.csv` に保存
3. 花園（または家族）が内容を確認。誤答・不適切・難しすぎる問題を削除
4. `scripts/seed_quiz.ts` で `approved = true` として一括投入
5. **1,000問揃うまで待たない。** 確認済200問あればP1は動く。運用しながら足す
出題テストでは実在の1,000問がなくてもよいよう、`data/quiz_sample.csv`（20問・ダミー）を用意する。
---
## 10. 画面一覧
| パス | 対象 | 内容 |
|---|---|---|
| `/` | senior | おはよう画面。「はじめる」「ごはんを記録」「日記」の3ボタンのみ |
| `/session` | senior | 毎朝のルーティン（§3の[2]〜[7]を1画面ずつ） |
| `/meals/new` | senior | カメラ → AI判定 → 確認 |
| `/diary` | senior | 今日の日記入力（3分類） |
| `/diary/[date]` | senior | 過去の日記 |
| `/history` | senior | カレンダー。完了日に印。食事・日記へ遷移 |
| `/settings` | senior | 見守り共有ON/OFF・LINE連携・文字サイズ |
| `/watch` | watcher | 見守りダッシュボード |
| `/admin/quiz` | 管理者 | 問題プールの一覧・承認・無効化 |
---
## 11. ディレクトリ構成
```
/
├── CLAUDE.md
├── docs/
│   ├── PENDING.md          # 判断待ちリスト
│   └── DECISIONS.md        # 決定事項と閾値の記録
├── data/
│   ├── quiz_sample.csv     # ダミー20問（開発用）
│   └── quiz_draft.csv      # 花園が生成・確認した本番問題（コミットしてよい）
├── scripts/
│   ├── generate_quiz_prompt.md
│   └── seed_quiz.ts
├── supabase/
│   └── migrations/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── supabase/       # client.ts / server.ts
│   │   ├── ai/vision.ts    # 食事判定（サーバー専用）
│   │   ├── quiz/select.ts  # 出題ロジック
│   │   ├── quiz/memory.ts  # 記憶クイズ生成
│   │   └── line/push.ts    # LINE通知（サーバー専用）
│   └── types/
└── .env.example
```
---
## 12. 環境変数
`.env.example` には**変数名のみ**。値は書かない。`.gitignore` に `.env.local` があることを最初に確認する。
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # サーバー専用
ANTHROPIC_API_KEY=                # サーバー専用
LINE_CHANNEL_ACCESS_TOKEN=        # サーバー専用（P2）
LINE_CHANNEL_SECRET=              # サーバー専用（P2）
NEXT_PUBLIC_LIFF_ID=              # P2
CRON_SECRET=                      # Vercel Cron の認証用
```
---
## 13. 実装順序（1PR = 1目的）
| PR | 目的 | 完了条件 |
|---|---|---|
| #1 | プロジェクト初期化 + PWA最小構成 | ホーム画面に追加できる。`.env.example` あり |
| #2 | DBスキーマ + RLS | 全テーブル・ポリシー適用。ダミー20問投入 |
| #3 | 利用者作成と認証 | 父・母・見守り者の3アカウントが作れる（§14-1 決定後） |
| #4 | クイズ5問 | `/session` で5問→結果まで動く。30日再出題なし |
| #5 | 記憶入力（昨日・一昨日の夕飯）+ 頑張ること | `meals`（source=memory_input）と `daily_sessions` に保存 |
| #6 | 日記 | 3分類入力と過去閲覧 |
| #7 | 履歴カレンダー + 連続日数 | `/history` で完了日と記録が見える |
| **— P1完了 —** | ここで父・母に触ってもらう | **フィードバックを `docs/DECISIONS.md` に記録してから P2 へ** |
| #8 | 食事写真AI判定 | 撮影→判定→確認→保存。写真非保存をコードレビューで確認 |
| #9 | 記憶クイズ | 7日以上のデータで自動出題 |
| #10 | 見守り画面 + 共有設定 | 本人ON時のみ watcher に見える。OFF時は403 |
| #11 | LINE連携 + 毎朝通知 | 連携済ユーザーに7:00通知が届く |
| #12 | 仕上げ | 文字サイズ設定・空状態・エラー文言の平易化 |
**各PRの説明文には必ず「何を変えたか」「影響範囲」「テスト方法」を書く。**
**P1完了時点で一度止まり、父・母の実使用の結果を待つ。** 使われないものにP2を積まない。
---
## 14. 判断待ちリスト（花園の決断待ち。勝手に決めないこと）
以下は要件定義書v0.3では未定義の実装レベルの論点。`docs/PENDING.md` に転記し、決定まで推測実装しない。
### 14-1. 父・母の認証方式（PR #3 までに必要）
- 選択肢A: **4桁の数字（あいことば）** — 端末に記憶させ、次回から入力不要。最も簡単。セキュリティは低いが、扱うのは本人の食事と日記のみ
- 選択肢B: **メールのマジックリンク** — Supabase標準。ただし60〜70代がメールアプリを開いてリンクを踏む手順で脱落する可能性が高い
- 選択肢C: **LINEログイン** — 慣れたアプリで完結するが、P1でLINE連携が必須になり工数が増える
- **Tomの推奨: A**。理由は「操作が分からないで止まったら未完成」の定義に最も適合するため
- 決定までは PR #3 を開始しない
### 14-2. 見守り者（花園）に見せる範囲（PR #10 までに必要）
- 共有ONの時、日記の本文まで見せるか、「今日書いた/書いていない」だけにするか
- **Tomの推奨: 本文まで見せる**（本人がONにしたのだから）。ただし「できなかったこと」欄のみ非表示にする選択肢も用意できる
- 決定までは PR #10 で日記本文の表示部分を実装しない
### 14-3. LINE公式アカウントの開設（PR #11 までに必要・花園の作業）
- LINE Messaging API を使うには **花園自身が LINE Developers でプロバイダー・チャネルを作成** する必要がある。Tomは代行できない（アカウント作成・認証情報の取り扱いは花園の役割）
- 開設後、トークンを Vercel 環境変数に設定してもらう。**トークンをチャットやNotionに貼らないこと**
---
## 15. 受け入れ基準（これを満たさなければ完成ではない）
**P1**
1. 父または母が、口頭説明なしにホーム画面のアイコンから起動し、5分以内に朝のルーティンを終えられる
2. 全入力を「あとで」でスキップしても壊れず、翌日また使える
3. 同じクイズが30日以内に再出題されない
4. 連続日数が正しく数えられる（1日飛ばすと0に戻る）
5. 文字18px以上・ボタン56px以上を全画面で満たす
6. 本番環境にデプロイされていない（Vercelプレビューのみ）
**P2**
7. 食事写真がどこにも保存されていない（Storage・ファイルシステム・ログを確認）
8. 記憶クイズの選択肢に他人のデータが混ざらない
9. 見守り共有OFFの時、watcher は本人のデータを一切取得できない（RLSで確認）
10. LINE通知が毎朝7:00に連携済ユーザーのみに届く
---
## 16. 個人情報の扱い（憲章 第8条）
- 保持するのは食事名・日記・クイズ成績のみ。写真・位置情報・健康数値（血圧等）は取らない
- テストデータに実在の人物名・実在の日記を使わない
- ログに日記本文・食事内容を出力しない
- 医療情報として扱わない。診断・助言を出す機能を作らない
---
## 17. 毎朝の報告フォーマット
```
■完了
■判断待ち
■次の提案
```
3行。前置きなし。数字を入れる。
