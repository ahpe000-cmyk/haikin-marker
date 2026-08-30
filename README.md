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
- **共有脳の自動同期**: GitHub Actionsが6時間ごと（JST 6/12/18/24時）＋mainへのpush時にNotion「AHPE共有ボード」を取得し `/arc/brain.json` として配置。ARCは起動時と「共有脳を同期」ボタンでこれを読み込む。設定方法は下記
- **Notionツール（チャット内でのNotion操作）の制約**: NotionのMCPサーバーはOAuth認証を要求するため、Web版ではチャットのNotionトグルは動作しない。使う場合はアーティファクト版で

#### 共有脳の自動同期のセットアップ（初回のみ）

1. https://www.notion.so/my-integrations で「新しいインテグレーション」を作成（対象＝AHPEのワークスペース、権限は「コンテンツを読み取る」のみでよい）→ トークン（`ntn_…` または `secret_…`）をコピー
2. Notionで「AHPE共有ボード」ページを開き、右上「…」→「接続」→ 作成したインテグレーションを追加
3. GitHubリポジトリ → Settings → Secrets and variables → Actions → **New repository secret** で `NOTION_TOKEN` にトークンを保存
4. Actionsタブ →「Deploy to GitHub Pages」→ Run workflow で一度実行（以降は自動）

- ページはタイトル「AHPE共有ボード」で自動検索される。別ページを使う場合は Actions の **Variables** に `NOTION_PAGE_ID` を設定
- トークン未設定の間は brain.json が生成されず、ARCは保存済みの共有脳（設定画面の手動貼り付け）を使う

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
scripts/
  fetch-brain.mjs            Notion共有ボード → brain.json 生成（Actionsが定期実行）
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
