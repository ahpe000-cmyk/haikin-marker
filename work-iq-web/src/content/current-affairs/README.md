# 時事問題バッチ

このディレクトリには、日付ごとの時事問題バッチを `YYYY-MM-DD.json` として置きます。

- バッチはその日付（JST）のみ「今日の時事5問」として表示されます。
- 当日のバッチが無い日は、アプリは自動的に「今日の時事問題は更新準備中です。」を表示し、今日の5問は判断/リスクの問題で補完されます。古いニュースが「今日」と表示されることはありません。
- ランタイムのLLM API呼び出しはありません。バッチは開発・編集作業として作成し、コミットして公開します。

## ファイル形式

```json
{
  "batchDate": "2026-08-21",
  "questions": [
    {
      "id": "ca-2026-08-21-1",
      "category": "current_affairs",
      "level": "beginner",
      "mode": "single_correct",
      "prompt": "…",
      "choices": [
        { "id": "a", "text": "…" },
        { "id": "b", "text": "…" },
        { "id": "c", "text": "…" },
        { "id": "d", "text": "…" }
      ],
      "correctChoiceId": "b",
      "explanation": "事実の説明。必要なら「仕事にどう関係する？」の一言を添える。",
      "choiceExplanations": { "a": "…", "b": "…", "c": "…", "d": "…" },
      "tags": ["news"],
      "source": {
        "title": "記事タイトル",
        "url": "https://…",
        "publishedAt": "2026-08-20",
        "eventDate": "2026-08-20",
        "checkedAt": "2026-08-21T09:00:00+09:00"
      }
    }
  ]
}
```

## 編集ルール

1. 事実が先、解釈は後。
2. 出典は必須（HTTPSのみ）。`publishedAt` と `checkedAt` は必ず実際の日付。
3. 絶対日付を使う（「昨日」「先週」は不可）。
4. 未検証のSNS発の主張は使わない。
5. 作成後は必ず `npm run validate:content` を実行してからコミットする。

詳しい手順は `docs/content_guide.md` を参照してください。
