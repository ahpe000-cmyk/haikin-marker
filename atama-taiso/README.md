# 頭の体操（シニア向け 健康・記憶習慣PWA）

仕様はリポジトリルートの `CLAUDE.md` を参照。判断待ちは `docs/PENDING.md`、決定の記録は `docs/DECISIONS.md`。

## セットアップ状況

初期セットアップ（Supabaseプロジェクト作成・マイグレーション・利用者3名の
認証アカウント・ダミー20問投入・Vercelプレビューデプロイ）は **Tomが実施済み**。
残っている花園の作業は次の2つだけ。

1. **ANTHROPIC_API_KEY の設定**（食事写真のAI判定用・任意）
   - Vercel の Project Settings → Environment Variables に `ANTHROPIC_API_KEY` を追加
   - 未設定でもアプリは動く（写真判定だけ「何を食べましたか?」の手入力になる）
2. **本番クイズの投入**（ダミー20問はTomが投入済み）
   - `scripts/generate_quiz_prompt.md` の手順で `data/quiz_draft.csv` を作成・確認
   - `npm run seed:quiz -- data/quiz_draft.csv` で投入
     （要 `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY`）

問題の承認・無効化は Supabase の Table Editor で `quiz_questions.approved` を切り替える。
あいことばの変更は `supabase/setup/create_auth_users.sql` 末尾のSQLコメント参照。
**デプロイはプレビューのみ**（`vercel --prod` は使わない。CLAUDE.md 掟1）

## 開発

```bash
cd atama-taiso
npm install
npm run dev
```

## 動作確認の要点（受け入れ基準の抜粋）

- ホーム画面追加 → アイコンから起動 → あいことば入力（初回のみ）→ 朝のルーティンが5分以内
- すべて「あとで」でスキップしても壊れない
- 同じクイズは30日以内に再出題されない
- 食事写真はどこにも保存されない（Storage・ファイル・ログを確認）
- 見守り共有OFFの間、みまもり側から本人のデータは一切見えない
