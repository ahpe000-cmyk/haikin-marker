# 頭の体操（シニア向け 健康・記憶習慣PWA）

仕様はリポジトリルートの `CLAUDE.md` を参照。判断待ちは `docs/PENDING.md`、決定の記録は `docs/DECISIONS.md`。

## セットアップ（花園向け・初回のみ）

1. **Supabase プロジェクトを作成**し、以下を行う
   - SQL Editor で `supabase/migrations/` の4ファイルを番号順に実行
     （スキーマ → RLS → 利用者3名 → 日記の見守りポリシー）
   - Authentication → Sign In / Up で **Anonymous Sign-ins を有効化**
     （あいことばログインが匿名認証を使うため）
2. **環境変数を設定**（Vercel の Project Settings → Environment Variables。
   ローカルは `atama-taiso/.env.local`）
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（サーバー専用）
   - `ANTHROPIC_API_KEY`（食事写真の判定用・サーバー専用）
   - `APP_PASSCODE`（4桁のあいことば。**値はチャット・Notion・リポジトリに書かない**）
3. **クイズを投入**
   ```bash
   cd atama-taiso
   npm install
   npm run seed:quiz -- data/quiz_sample.csv   # まずは開発用ダミー20問
   ```
   本番問題は `scripts/generate_quiz_prompt.md` の手順で `data/quiz_draft.csv` を
   作って確認後、同じコマンドで投入する
4. **Vercel** はプロジェクト設定で Root Directory を `atama-taiso` にする。
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
