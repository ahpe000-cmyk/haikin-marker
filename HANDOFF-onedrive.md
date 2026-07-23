# 引継ぎ資料：配筋マーカー OneDrive連携の続き

> **これは別PCのClaude Codeが続きを実行するための資料です。**
> 目的：個人のOneDrive（Microsoftアカウント）にログイン → 実際に写真を保存できる状態にする。
> DropboxからOneDrive（Microsoft Graph API）への移行は**コード実装済み**。残るは「Azureでアプリ登録 → クライアントIDを埋め込む → デプロイ → 接続テスト」だけ。

---

## 1. 今どこまで終わっているか

- ✅ アプリのコードを Dropbox → OneDrive（Microsoft Graph）に**全面移行済み**
  - 認証：OAuth2 + PKCE（`login.microsoftonline.com/common`）
  - 保存：Graph API へアップロード（4MB超は分割アップロードセッションで自動対応）
  - UI表記も「OneDrive」に変更済み
- ✅ このコードは **`feature/onedrive` ブランチ** にコミット済み（`main` は従来のまま＝ライブサイトは無傷）
- ⬜ **未完了：`MS_CLIENT_ID` がプレースホルダ（`YOUR_CLIENT_ID_HERE`）のまま** → Azure登録して実IDを入れる必要がある
- ⬜ **未完了：Azureでの「APIアクセス許可」追加**
- ⬜ **未完了：main へのマージ＆デプロイ、実機での接続テスト**

---

## 2. 環境情報（重要）

| 項目 | 値 |
|---|---|
| デプロイ用リポジトリ | `ahpe000-cmyk/haikin-marker`（**こちらが本番**） |
| 本番URL | https://haikin-marker.kaetai-sekiei-system.com <br> https://ahpe000-cmyk.github.io/haikin-marker/ |
| OneDriveコードのブランチ | `feature/onedrive` |
| デプロイ方法 | `main` へ push すると GitHub Actions（`.github/workflows/deploy.yml`）が自動デプロイ |
| カスタムドメイン | Cloudflare DNS（CNAME `haikin-marker` → `ahpe000-cmyk.github.io`）。リポジトリに `CNAME` ファイルあり |
| GitHubアカウント | `ahpe000-cmyk`（本番・要 `workflow` スコープ）／ `jijikabo1-lgtm`（別ミラー） |

もう一つのミラー：`jijikabo1-lgtm/haikin-marker`（https://jijikabo1-lgtm.github.io/haikin-marker/）。本番は `ahpe000-cmyk` の方。

---

## 3. 別PCでの初期セットアップ

```bash
# 1. 本番リポジトリをクローン
git clone https://github.com/ahpe000-cmyk/haikin-marker.git
cd haikin-marker

# 2. OneDriveコードのブランチを取得
git fetch origin
git checkout feature/onedrive

# 3. GitHub CLI 認証（このPCの分。workflowスコープ必須）
gh auth login --scopes "repo,workflow"
#   → ahpe000-cmyk アカウントでログインすること
```

> `gh` 認証はマシンごと。別PCでは改めてログインが必要。`workflow` スコープが無いと
> `.github/workflows/*.yml` を含む push が拒否される（`refusing to allow an OAuth App to ...`）。

---

## 4. 残りの作業（この順番で実行）

### ステップ1：Azureでアプリ登録してクライアントIDを取得
1. https://portal.azure.com にMicrosoftアカウントでログインL
2. 「**Microsoft Entra ID**」→「**アプリの登録**」→「**＋ 新規登録**」
3. 設定：
   - **名前**：`配筋マーカー`
   - **サポートされるアカウントの種類**：「**任意の組織ディレクトリ内のアカウントと個人用 Microsoft アカウント**」
   - **リダイレクト URI**：プラットフォーム＝「**シングルページアプリケーション (SPA)**」で、**両方**登録：
     - `https://haikin-marker.kaetai-sekiei-system.com/`
     - `https://ahpe000-cmyk.github.io/haikin-marker/`
4. 「**登録**」→ 表示される「**アプリケーション (クライアント) ID**」をコピー

> ⚠ **プラットフォームは必ず「SPA」**。ここを「Web」にするとトークン取得がCORS/シークレット要求で失敗する。

### ステップ2：APIのアクセス許可を追加
1. 登録したアプリ →「**APIのアクセス許可**」→「**＋ アクセス許可の追加**」
2. 「**Microsoft Graph**」→「**委任されたアクセス許可**」
3. 次の3つにチェックして追加：
   - `Files.ReadWrite`
   - `offline_access`
   - `User.Read`
4. （個人アカウントのみで使う場合、管理者の同意は不要）

### ステップ3：クライアントIDをコードに埋め込む
`index.html` の先頭付近（`<script>` 内、`// ★ Microsoft (OneDrive) クライアントID` のすぐ下）：

```javascript
const MS_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';   // ← ここをコピーしたIDに置換
```

置換すると `DBX_ENABLED` が自動的に `true` になり、初期設定の案内バーは消える。

### ステップ4：コミット → main にマージ → デプロイ
```bash
git add index.html
git commit -m "feat(onedrive): クライアントIDを設定"
git checkout main
git merge feature/onedrive
git push origin main            # ahpe000-cmyk/haikin-marker へ。Actionsが自動デプロイ
```
`gh run watch` でデプロイ完了を確認。1〜2分で反映。

### ステップ5：接続テスト
1. https://haikin-marker.kaetai-sekiei-system.com を開く（証明書が未発行ならgithub.ioの方で）
2. 右上「**OneDrive 未接続**」バッジをクリック → Microsoftログイン画面へ
3. 個人Microsoftアカウントでサインイン → 権限に「承諾」
4. 「**OneDrive 接続済**」になればOK
5. 写真を1枚マーカー付きで「**OneDriveに保存**」→ OneDriveの `配筋写真/` フォルダにファイルが出来ることを確認

---

## 5. コードの該当箇所（Claude Code用ナビ）

すべて `index.html` 内、末尾の `<script>` ブロック：

| 機能 | 目印（関数名など） |
|---|---|
| 設定定数 | `MS_CLIENT_ID` / `MS_AUTHORITY` / `MS_SCOPES` / `DBX_ENABLED` |
| 認証開始（ログインへ飛ばす） | `dbxStartAuth()` |
| コールバック処理（トークン取得） | `dbxHandleCallback()` |
| アップロード（4MB分岐あり） | `dbxUpload(path, blob)` |
| エラー整形（401で再ログイン誘導） | `graphErr(res)` |
| バッジ表示更新 | `updateDbxBadge()` |
| 保存先フォルダのモーダル | `openDbxModal()` / `#btn-dbx-confirm` |

> 関数名が `dbx*`（Dropbox由来）のままなのは、UI側の呼び出し配線を変えずに中身だけGraphに差し替えたため。**中身はすべてOneDrive/Microsoft Graph**。

---

## 6. 技術メモ・落とし穴

- **リダイレクトURIは完全一致**。アプリが開かれているURL（末尾スラッシュ含む）とAzure登録値が1文字でも違うと認証エラー。だから本番ドメインとgithub.ioの両方を登録しておく。
- **SPAプラットフォーム必須**（前述）。
- **スコープ**：`Files.ReadWrite offline_access User.Read openid profile`（コードの `MS_SCOPES`）。
- **保存先パス**：モーダルで入力した `配筋写真/現場名` の下に `marked_元ファイル名.jpg` で保存。フォルダは自動作成される。
- **大きい写真**：4MB超は `createUploadSession` → 1リクエストで全体PUT（`Content-Range`）。`Content-Length` はブラウザが自動付与するので手動指定しない（禁止ヘッダ）。
- **カスタムドメインのHTTPS証明書**：GitHubがLet's Encryptを自動発行。DNS反映直後は `NET::ERR_CERT_COMMON_NAME_INVALID` が出るが数分〜1時間で解消。未発行の間は `ahpe000-cmyk.github.io/haikin-marker/` でテスト可。
- **トークン更新**：現状は access_token をsessionStorageに保持し、期限切れ(401)時は再ログイン。`offline_access` で refresh_token も取得済み（`dbx_refresh`）なので、必要なら自動更新を実装可能（未実装）。
- **法人OneDriveに切り替える場合**：Azureの権限に `Files.ReadWrite.All` / `Sites.ReadWrite.All` を追加し、管理者の同意が必要。詳細は別途の導入手順書を参照。

---

## 7. 完了の定義（Doneの条件）

- [ ] Azureでアプリ登録済み・クライアントID取得済み
- [ ] `MS_CLIENT_ID` に実IDを設定済み
- [ ] APIアクセス許可（Files.ReadWrite / offline_access / User.Read）追加済み
- [ ] `main` にマージして本番デプロイ済み
- [ ] 実機で Microsoftログイン → 写真がOneDriveに保存されることを確認済み
