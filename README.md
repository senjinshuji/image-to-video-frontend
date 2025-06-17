# Image to Video Generator - Frontend

Next.js 14アプリケーション - 画像から動画を生成するワークフローUI

## 機能

- **ダッシュボード**: Google Sheets行データの一覧表示
- **画像生成**: テキストプロンプトまたは参考画像から画像生成
- **動画生成**: VeoとKlingモデルでの並列動画生成
- **完了確認**: 動画選択と保存

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR for data fetching
- react-hot-toast for notifications

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

```bash
vercel
```

### 2. 環境変数の設定

Vercelダッシュボードで以下を設定:
- `NEXT_PUBLIC_API_URL`: RenderのAPIエンドポイント

### 3. GitHub Actionsの設定

以下のシークレットをGitHubリポジトリに追加:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

## ビルド

```bash
npm run build
npm start
```

## ディレクトリ構造

```
src/
├── app/              # ページコンポーネント
├── components/       # 再利用可能なコンポーネント
└── lib/             # ユーティリティとAPI
```