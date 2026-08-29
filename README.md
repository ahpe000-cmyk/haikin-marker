# ARC — AHPE AI社員 統括ダッシュボード

AI社員10名（現実コーチ／私コーチ／ニュース担当／つながり構築担当／LinkedIn投稿レビュー／BEFoAF担当／Jarvis／開発担当Tom／種まき担当／コミュニティマネージャー）を統括するダッシュボード。J.A.R.V.I.S.風HUDデザイン（シアン `#4FD8FF`）。

- 左：出退勤札ボード風の社員名簿（モバイルでは上部チップバー）
- 中央：執務室（各社員とのチャット）
- 共通憲章・個別雇用契約書（システムプロンプト）のエディタ
- Notion「AHPE共有ボード（AI社員の共有脳）」の同期

## ⚠️ 実行環境について（重要）

**このファイルは claude.ai のアーティファクト環境専用です。**

以下の機能に依存しているため、**通常のホスティング（GitHub Pages・Vercel 等）では動作しません**：

1. **`window.storage`** — アーティファクト環境が提供する永続化API。通常のブラウザには存在しない
2. **APIキーなしの fetch** — `https://api.anthropic.com/v1/messages` を認証ヘッダーなしで直接呼び出す。アーティファクト環境内でのみ通る仕組みで、外部ではCORS／認証エラーになる
3. **MCP連携** — リクエストの `mcp_servers` パラメータによる Notion MCP（`https://mcp.notion.com/mcp`）接続

## ファイル構成

```
ahpe-headquarters.jsx        エントリ（状態管理・送信/同期ロジック）
arc/
  theme.js                   パレット（JARVIS風HUD・シアン #4FD8FF）・GLOW・等幅フォント
  data.js                    社員10名の定義・共通憲章・個別契約書・Notion MCP設定
  storage.js                 window.storage の安全ラッパー（sGet / sSet）
  api.js                     Anthropic Messages API 呼び出しと応答パース
  components/
    HUDStyles.jsx            HUDアニメーション定義（spin / pulse / scan / grid）
    ArcRing.jsx              アークリアクター状の回転リング
    Bracket.jsx              角が切れたHUDブラケット枠
    LoadingScreen.jsx        起動時ロード画面
    Sidebar.jsx              左：出退勤札ボード風の社員名簿（PC）
    MobileBar.jsx            モバイル用の社員チップバー
    ChatHeader.jsx           執務室ヘッダー（共有脳同期・契約書・履歴クリア）
    MessageList.jsx          チャット本文（待機画面・メッセージ・処理中表示）
    InputBar.jsx             入力欄＋Notion/Web検索トグル
    SettingsModal.jsx        共通憲章・個別契約書のエディタモーダル
```

## 使い方

`ahpe-headquarters.jsx` の内容を claude.ai のアーティファクト（React）として貼り付けて使用する。

> 注: claude.ai のアーティファクトは単一ファイルのみ対応。コンポーネント分割後のソースを使う場合は、1ファイルに結合してから貼り付けること（単一ファイル版はコミット「ARC dashboard v1 (artifact-only)」の `ahpe-headquarters.jsx` を参照）。
