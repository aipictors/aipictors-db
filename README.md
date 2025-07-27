# AiPictors Database API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![CI](https://github.com/aipictors/aipictors-db/actions/workflows/ci.yml/badge.svg)](https://github.com/aipictors/aipictors-db/actions/workflows/ci.yml)

**AiPictors**のバックエンドAPIサービスです。Cloudflare Workersを使用してSupabaseデータベースへのアクセスを提供し、GraphQLとREST APIの両方をサポートしています。

🌐 **本番環境**: https://aipictors-db.aipictors.workers.dev/ictors Database API

**Aipictors**のバックエンドAPIサービスです。Cloudflare Workersを使用してSupabaseデータベースへのアクセスを提供し、GraphQLとREST APIの両方をサポートしています。

🌐 **本番環境**: https://aipictors-db.aipictors.workers.dev/

## 📋 目次

- [概要](#概要)
- [技術スタック](#技術スタック)
- [前提条件](#前提条件)
- [初期セットアップ](#初期セットアップ)
- [開発](#開発)
- [API仕様](#api仕様)
- [デプロイ](#デプロイ)
- [テスト](#テスト)
- [プロジェクト構造](#プロジェクト構造)
- [トラブルシューティング](#トラブルシューティング)

## 🎯 概要

このプロジェクトは、AipictorsプラットフォームのバックエンドAPIを提供します。主な機能：

- **ユーザーいいねランキング管理**: ユーザーのいいね数の取得・更新
- **GraphQL API**: 柔軟なクエリとミューテーション
- **REST API**: シンプルなHTTPエンドポイント
- **Cloudflare Workers**: エッジコンピューティングによる高速レスポンス
- **Supabase統合**: PostgreSQLデータベースへの安全なアクセス

## 🛠 技術スタック

- **ランタイム**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **フレームワーク**: [Hono](https://hono.dev/) - 軽量Webフレームワーク
- **GraphQL**: [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - GraphQLサーバー
- **データベース**: [Supabase](https://supabase.com/) - PostgreSQLクラウドデータベース
- **言語**: TypeScript
- **パッケージマネージャー**: [Bun](https://bun.sh/)
- **デプロイツール**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## 📋 前提条件

開発を始める前に、以下のツールがインストールされていることを確認してください：

- **Node.js** (v18以上推奨)
- **Bun** (最新版)
- **Git**
- **Cloudflareアカウント** (デプロイ用)
- **Supabaseプロジェクト** (データベース用)

### Bunのインストール

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# または Homebrew (macOS)
brew install bun

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

## 🚀 初期セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/aipictors/aipictors-db.git
cd aipictors-db
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. 環境変数の設定

#### 3.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. **Settings** → **API** から以下の情報を取得：
   - **Project URL** (SUPABASE_URL)
   - **anon/public** キー (SUPABASE_ANON_KEY)

#### 3.2 Wranglerでシークレットを設定

```bash
# Cloudflareアカウントにログイン
npx wrangler login

# 環境変数を設定
npx wrangler secret put SUPABASE_URL
# プロンプトが表示されたら、SupabaseのProject URLを入力

npx wrangler secret put SUPABASE_ANON_KEY
# プロンプトが表示されたら、Supabaseのanon keyを入力
```

### 4. データベーステーブルの作成

Supabaseのダッシュボードで以下のSQLを実行してテーブルを作成：

```sql
-- ユーザーいいねランキングテーブル
CREATE TABLE IF NOT EXISTS user_like_ranking (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_like_ranking_count ON user_like_ranking(count DESC);
CREATE INDEX IF NOT EXISTS idx_user_like_ranking_user_id ON user_like_ranking(user_id);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_like_ranking_updated_at
    BEFORE UPDATE ON user_like_ranking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 開発

### 開発サーバーの起動

```bash
bun run dev
```

開発サーバーが起動すると、以下のURLでアクセスできます：

- **メインページ**: http://localhost:8787/
- **GraphQL Playground**: http://localhost:8787/graphql
- **REST API**: http://localhost:8787/api/\*

### ホットリロード

ファイルを変更すると自動的にサーバーが再起動されます。

## 📚 API仕様

### REST API

#### GET /api/user_like_ranking

ユーザーいいねランキングを取得します。

**レスポンス例:**

```json
{
  "data": [
    {
      "id": "1",
      "user_id": "user123",
      "count": 150,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### GraphQL API

#### エンドポイント

- **URL**: `/graphql`
- **GraphQL Playground**: ブラウザで `/graphql` にアクセス

#### クエリ例

**ユーザーいいねランキング取得:**

```graphql
query GetUserLikeRankings($limit: Int) {
  userLikeRankings(limit: $limit) {
    id
    user_id
    count
    created_at
    updated_at
  }
}
```

**特定ユーザーのいいね情報取得:**

```graphql
query GetUserLikeRanking($id: ID!) {
  userLikeRanking(id: $id) {
    id
    user_id
    count
    created_at
    updated_at
  }
}
```

#### ミューテーション例

**ユーザーいいね数インクリメント:**

```graphql
mutation IncrementUserLikeCount($user_id: String!) {
  incrementUserLikeCount(user_id: $user_id) {
    id
    user_id
    count
    updated_at
  }
}
```

## 🚢 デプロイ

### 自動デプロイ (推奨)

このプロジェクトでは、GitHub Actionsを使用した自動デプロイが設定されています：

1. **PR作成時**: 自動でビルドチェック、テスト、フォーマットチェックが実行
2. **mainブランチへのマージ**: 自動でCloudflare Workersにデプロイ

#### GitHub Actionsの設定

リポジトリのSecrets設定で以下の環境変数を設定してください：

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

**Cloudflare API Tokenの取得方法:**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) にアクセス
2. "Create Token" をクリック
3. "Custom token" を選択
4. 以下の権限を設定：
   - **Zone Resources**: Include - All zones
   - **Zone Permissions**: Zone Settings:Read, Zone:Read
   - **Account Resources**: Include - All accounts
   - **Account Permissions**: Cloudflare Workers:Edit

### 手動デプロイ

### 手動デプロイ

緊急時や開発環境からの手動デプロイも可能です：

```bash
bun run deploy
```

### デプロイ前の確認事項

1. **環境変数が設定されているか確認:**

   ```bash
   npx wrangler secret list
   ```

2. **wrangler.jsonc の設定確認:**
   - プロジェクト名が正しいか
   - 互換性日付が最新か

3. **ビルドエラーがないか確認:**
   ```bash
   npx wrangler publish --dry-run
   ```

### コードフォーマット

プロジェクトではPrettierを使用してコードフォーマットを統一しています：

```bash
# フォーマットを実行
bun run format

# フォーマットをチェック（CIで使用）
bun run format:check
```

## 🧪 テスト

### テストの実行

```bash
# 全てのテストを実行
bun test

# 特定のテストファイルを実行
bun test test/index.spec.ts

# ウォッチモードでテストを実行
bun test --watch
```

### テストの追加

`test/` ディレクトリにテストファイルを追加してください。ファイル名は `*.spec.ts` または `*.test.ts` にしてください。

## 📁 プロジェクト構造

```
aipictors-db/
├── src/                    # ソースコード
│   ├── index.ts           # メインエントリーポイント
│   ├── context.ts         # TypeScript型定義
│   ├── schema.ts          # GraphQLスキーマとリゾルバー
│   └── yoga.ts            # GraphQL Yoga設定
├── test/                   # テストファイル
│   ├── index.spec.ts      # メインテスト
│   ├── env.d.ts          # テスト環境の型定義
│   └── tsconfig.json     # テスト用TypeScript設定
├── public/                 # 静的ファイル
│   └── index.html         # ランディングページ
├── package.json           # プロジェクト設定と依存関係
├── bun.lock              # Bunのロックファイル
├── wrangler.jsonc        # Cloudflare Workers設定
├── tsconfig.json         # TypeScript設定
├── vitest.config.mts     # Vitestテスト設定
└── README.md             # このファイル
```

### 主要ファイルの説明

- **`src/index.ts`**: Honoアプリケーションのメイン設定
- **`src/schema.ts`**: GraphQLのスキーマ定義とリゾルバー
- **`src/yoga.ts`**: GraphQL Yogaサーバーの設定
- **`src/context.ts`**: TypeScript型定義（環境変数など）
- **`wrangler.jsonc`**: Cloudflare Workersのデプロイ設定

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. デプロイ時にSecretが見つからないエラー

**エラー:** `Error: Missing binding for SUPABASE_URL`

**解決方法:**

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
```

#### 2. Supabaseへの接続エラー

**エラー:** `Failed to fetch user like rankings`

**解決方法:**

1. Supabaseの環境変数が正しく設定されているか確認
2. Supabaseプロジェクトがアクティブか確認
3. テーブルが正しく作成されているか確認

#### 3. GraphQL Playgroundが表示されない

**解決方法:**

- `/graphql` エンドポイントに直接アクセス
- ブラウザのキャッシュをクリア
- 開発者ツールでエラーを確認

#### 4. Bunのインストールエラー

**解決方法:**

```bash
# キャッシュをクリア
bun install --force

# node_modulesを削除して再インストール
rm -rf node_modules bun.lock
bun install
```

### ログの確認

#### 本番環境のログ

```bash
npx wrangler tail
```

#### 開発環境のログ

開発サーバーのコンソール出力を確認してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下でオープンソースとして公開されています。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔗 関連リンク

- **メインサイト**: https://aipictors.com/
- **GitHub Organization**: https://github.com/aipictors
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Supabase Docs**: https://supabase.com/docs
- **GraphQL Yoga Docs**: https://the-guild.dev/graphql/yoga-server/docs

---

**Aipictorsチーム** | 作成日: 2025年7月28日
