# WORK IQ MVP デプロイ手順

新しい有料アドオンは一切不要です（Vercel既存アカウント + Supabase Freeのみ）。

## 前提

- このアプリはリポジトリの `work-iq-web/` サブディレクトリにあります。
- ランタイムのLLM API・決済・ログインはありません。
- サーバー専用シークレットは**絶対にリポジトリにコミットしない**でください。

## 1. Supabase（無料プラン）

1. 既存のSupabaseアカウントで無料プロジェクトを1つ用意します（新規作成も無料枠でOK）。
2. SQLエディタで `supabase/migrations/001_mvp.sql` の内容を実行します。
   - 作成されるのは `poll_votes` と `analytics_events` の2テーブルのみ。個人情報カラムはありません。
3. プロジェクトの `Project Settings → API` から以下を控えます。
   - Project URL → `SUPABASE_URL`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`（**サーバー専用。公開しない**）

## 2. Vercel

1. Vercelの既存アカウントでこのGitHubリポジトリをインポートします。
2. プロジェクト設定:
   - **Root Directory**: `work-iq-web`
   - Framework Preset: Next.js（自動検出）
   - 有料アドオンは有効化しない。
3. Environment Variables（Production / Preview 両方）:

   | 変数名 | 値 | 備考 |
   |---|---|---|
   | `SUPABASE_URL` | SupabaseのProject URL | サーバー専用 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_roleキー | サーバー専用・非公開 |
   | `ANON_HASH_SALT` | ランダムな長い文字列 | 例: `openssl rand -hex 32` で生成 |
   | `NEXT_PUBLIC_SITE_URL` | 公開URL（例: `https://work-iq.example.com`） | メタデータ/正規URL用 |
   | `NEXT_PUBLIC_HONNE_URL` | HONNEの本番URL | 未設定ならCTA非表示 |
   | `NEXT_PUBLIC_BEFOAF_URL` | BEFoAFの本番URL | 未設定ならCTA非表示 |

4. デプロイを実行します。

## 3. デプロイ後の確認

1. スマホ（またはDevToolsの390×844）で公開URLを開き、ログインなしで「今日の5問」を完走できること。
2. `/poll` で投票 → 実際の票数・割合が表示されること（Supabaseの `poll_votes` に行が入る）。
3. Supabaseで `select event, count(*) from analytics_events group by 1;` を実行し、`landing_view` などが記録されていること。
4. 結果画面の「結果をシェア」を実行し、別の端末/ブラウザで共有URLを開くと挑戦用ランディングが表示されること。
5. `/privacy` と `/about` が表示されること。

## 4. 日次運用

- **時事問題**: `docs/content_guide.md` の手順で `src/content/current-affairs/YYYY-MM-DD.json` を作成 → `npm run validate:content` → コミット → デプロイ。当日バッチが無い日は自動的に「更新準備中」表示になります（古いニュースは出ません）。
- **アンケート**: `src/content/polls/YYYY-MM-DD.json` を事前にまとめて仕込めます（2026-08-21〜09-03分はシード済み）。
- 計測は `docs/analytics_queries.sql` をSupabase SQLエディタで実行。

## 5. ロールバック

- アプリ: Vercelのデプロイ履歴から前のデプロイを「Promote to Production」するだけで戻せます。
- コンテンツ: 該当コミットを `git revert` して再デプロイ。
- DB: テーブルは追記のみの2つ。壊れた場合も `001_mvp.sql` を再実行すれば再作成できます（既存データを消す操作は含まれていません）。

## 6. ローカル開発

```bash
cd work-iq-web
npm install
cp .env.example .env.local   # 値を埋める（未設定でもアプリは動作、投票/計測のみ「準備中」表示）
npm run dev
```

品質ゲート:

```bash
npm run lint
npm test
npm run validate:content
npm run build
npm run test:e2e   # 事前にビルド・起動は自動
```
