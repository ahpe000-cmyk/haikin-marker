# ARC — AHPE AI社員 統括ダッシュボード

AI社員10名（現実コーチ／私コーチ／ニュース担当／つながり構築担当／LinkedIn投稿レビュー／BEFoAF担当／Jarvis／開発担当Tom／種まき担当／コミュニティマネージャー）を統括するダッシュボード。J.A.R.V.I.S.風HUDデザイン（シアン `#4FD8FF`）。

- 左：出退勤札ボード風の社員名簿（モバイルでは上部チップバー）
- 中央：執務室（各社員とのチャット）
- 共通憲章・個別雇用契約書（システムプロンプト）のエディタ
- Notion「AHPE共有ボード（AI社員の共有脳）」の同期

## 実行環境（2通り）

環境は自動判別されます（`window.storage` の有無で判定）。

### 1. WEB版（GitHub Pages）

**URL: https://haikin-marker.kaetai-sekiei-system.com/arc/**（mainへのマージ後にデプロイ）

- **APIキーが必要**: 「契約書・憲章」画面で自分のAnthropic APIキー（console.anthropic.com で発行）を保存する。キーはそのブラウザのlocalStorageにのみ保存され、Anthropic API以外には送信されない。**共有PCでは保存しないこと**
- **データ保存**: チャット履歴・憲章・契約書はブラウザのlocalStorageに保存（端末ごとに独立。ブラウザのサイトデータ削除で消える）
- **Web検索**: 利用可能
- **Notion同期の制約**: NotionのMCPサーバーはOAuth認証を要求するため、Web版では「共有脳を同期」とNotionツールは基本的に動作しない（エラーが表示される）。Notion連携を使う場合はアーティファクト版を使うこと

### 2. claude.ai アーティファクト版

`ahpe-headquarters.jsx` をclaude.aiのアーティファクト（React）として貼り付けて使用。APIキー不要・Notion連携も動作する（環境が代理認証するため）。

> 注: claude.aiのアーティファクトは単一ファイルのみ対応。現在のソースはコンポーネント分割されているため、貼り付ける場合は1ファイルへの結合が必要（結合前の単一ファイル版はコミット「ARC dashboard v1 (artifact-only)」の `ahpe-headquarters.jsx` を参照）。

## 開発

```
npm install
npm run build   # → web/dist/ に arc.js と index.html を出力
```

デプロイは `.github/workflows/deploy.yml` が main へのpush時に自動実行（`/` = 配管マーカーアプリ、`/arc/` = ARC）。

## ファイル構成

```
ahpe-headquarters.jsx        エントリ（状態管理・送信/同期ロジック）
web/
  main.jsx                   WEB版エントリ（ReactDOMマウント）
  index.html                 WEB版HTMLテンプレート
arc/
  theme.js                   パレット（JARVIS風HUD・シアン #4FD8FF）・GLOW・等幅フォント
  data.js                    社員10名の定義・共通憲章・個別契約書・Notion MCP設定
  storage.js                 永続化（window.storage / localStorage 自動フォールバック）
  api.js                     Anthropic API呼び出し（環境判別・APIキー管理）と応答パース
  components/
    HUDStyles.jsx            HUDアニメーション定義（spin / pulse / scan / grid / CRT）
    ArcRing.jsx              アークリアクター状の回転リング
    Bracket.jsx              角が切れたHUDブラケット枠
    LoadingScreen.jsx        起動時ブートシーケンス
    Sidebar.jsx              左：出退勤札ボード風の社員名簿（PC）
    MobileBar.jsx            モバイル用の社員チップバー
    ChatHeader.jsx           執務室ヘッダー（共有脳同期・契約書・履歴クリア）
    MessageList.jsx          チャット本文（待機画面・メッセージ・処理中表示）
    InputBar.jsx             入力欄＋Notion/Web検索トグル
    SettingsModal.jsx        共通憲章・個別契約書・APIキーのエディタモーダル
```
