# WORK IQ コンテンツガイド

すべての出題データは `src/content/` 配下のJSONとしてコミットされます。ランタイムでのAI生成はありません。

## 共通ルール

- 職場で実際に交わされる自然な日本語にする。
- ひっかけ問題、明らかにふざけた選択肢は禁止。誤答も「実際にやってしまいがちな行動・誤解」にする。
- 解説は「Cが正解」で終わらせず、なぜ強いか・他の選択肢がなぜ弱いかを教える。
- `best_answer` の解説は前提条件やトレードオフに必ず言及する。
- 医療・法律・税務の個別アドバイスは書かない。
- 変更後は必ず `npm run validate:content` を実行する。

## 常設問題（3カテゴリ × STEP 1–5 × 5問）

| ファイル | カテゴリ | ID接頭辞 |
|---|---|---|
| `src/content/business-terms.json` | `business_terms` | `bt-` |
| `src/content/judgment.json` | `judgment` | `jd-` |
| `src/content/risk.json` | `risk` | `rk-` |

- IDは `bt-XYZ`（X = STEP番号）の形式。
- ビジネス用語は `term` オブジェクト必須（略語は `expansion` に正式な英語表記）。
- 使い方・使う相手やタイミングを問う問題には `tags` に `"usage"` / `"timing"` を付ける（スコア重み1.10が適用される）。
- `best_answer` は重み1.25、事実知識は1.00。

### 問題オブジェクトの完全な形

```json
{
  "id": "bt-101",
  "category": "business_terms",
  "level": "beginner",
  "step": 1,
  "mode": "single_correct",
  "prompt": "…",
  "choices": [
    { "id": "a", "text": "…" },
    { "id": "b", "text": "…" },
    { "id": "c", "text": "…" },
    { "id": "d", "text": "…" }
  ],
  "correctChoiceId": "b",
  "explanation": "…",
  "choiceExplanations": { "a": "…", "b": "…", "c": "…", "d": "…" },
  "tags": ["kpi", "meaning"],
  "term": {
    "label": "KPI",
    "expansion": "Key Performance Indicator",
    "plainDefinition": "…",
    "goodUsage": "…",
    "badUsage": "…"
  }
}
```

`mode` が `best_answer` の場合は `correctChoiceId` の代わりに `recommendedChoiceId` を使います。

## 時事問題（日付付きバッチ）

`src/content/current-affairs/YYYY-MM-DD.json`。形式と編集ルールは `src/content/current-affairs/README.md` を参照。

### 編集ワークフロー（毎日 or 更新したい日に実施）

1. 信頼できる報道機関のビジネス関連記事を選ぶ（一次情報を確認する）。
2. 手元のAIツール（ChatGPT / Claude / Cursor の既存サブスクリプション）で下書きを作る。**API連携ではなく、エディタ/チャットでの編集作業として行う。**
3. 出典URL・公開日・イベント日を記事の実物と照合し、`checkedAt` に確認日時（JST）を記録する。
4. 「仕事にどう関係する？」の一言を解説に添える（適切な場合）。
5. `npm run validate:content` を実行する。
6. コミットしてデプロイする。

当日バッチが無い日はアプリが自動的に「更新準備中」を表示します。**古いバッチの日付を書き換えて再利用してはいけません。**

## デイリーアンケート（みんなならどうする？）

`src/content/polls/YYYY-MM-DD.json`。形式は `src/content/polls/README.md` を参照。正解を設定できない構造になっています。

## スコアリングとの関係

- `single_correct`（事実知識）: 重み 1.00
- `single_correct` + `usage`/`timing` タグ: 重み 1.10
- `best_answer`: 重み 1.25
- アンケート回答はWORK IQに一切影響しません。
