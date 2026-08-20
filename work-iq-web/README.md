# WORK IQ Web MVP

社会人力を、毎日5問で。— モバイルファーストの日本語Web MVP。

- 設計書: `docs/superpowers/specs/2026-08-21-work-iq-web-mvp-design.md`
- 実装計画: `docs/superpowers/plans/2026-08-21-work-iq-web-mvp.md`
- デプロイ手順: `docs/deployment.md`
- コンテンツ運用: `docs/content_guide.md`
- 計測SQL: `docs/analytics_queries.sql`

## 開発

```bash
npm install
npm run dev
```

## 品質ゲート

```bash
npm run lint            # ESLint
npm test                # Vitest ユニット/コンポーネントテスト
npm run validate:content # コンテンツJSONのスキーマ検証
npm run build           # 本番ビルド
npm run test:e2e        # Playwright クリティカルフロー
```

環境変数は `.env.example` を参照（実値はコミットしない）。
