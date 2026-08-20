# みんなならどうする？（デイリーアンケート）

このディレクトリには、日付ごとのアンケートを `YYYY-MM-DD.json` として置きます（1日1件）。

- 正解はありません（`correctChoiceId` / `recommendedChoiceId` を含めるとバリデーションで弾かれます）。
- 投票するまで集計は表示されません。投票後に実際の票数と割合のみを表示します。
- 「考えるポイント」を示し、「正解」は示しません。
- 属性別の集計や全国データをでっち上げることは禁止です。

## ファイル形式

```json
{
  "id": "poll-2026-08-21",
  "date": "2026-08-21",
  "prompt": "…、あなたならどうする？",
  "choices": [
    { "id": "a", "text": "…" },
    { "id": "b", "text": "…" },
    { "id": "c", "text": "…" },
    { "id": "d", "text": "…" }
  ],
  "tags": ["communication"],
  "thinkingPoints": ["…", "…"],
  "ctaHint": "befoaf"
}
```

- `tags` に `communication` / `relationship` / `social` を含むアンケートの後にのみ、BEFoAFのCTAが表示され得ます。
- `ctaHint` は任意（`"honne" | "befoaf" | "none"`）。
- 作成後は `npm run validate:content` を実行してからコミットしてください。
