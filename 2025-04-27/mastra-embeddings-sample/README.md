# Mastra Embeddings Sample

このプロジェクトは、MastraとpgvectorとHugging Face Transformersを使用して、HTMLファイルからテキストをチャンク化し、ベクトル埋め込みをPostgreSQLに保存するサンプルです。埋め込みベクトル生成には、Hugging Faceの無料で使用できるall-MiniLM-L6-v2モデルを使用しています。また、ベクトル類似度検索を使用して、テキストを検索する機能も提供します。

## 前提条件

- Node.js 18.x以上
- Docker および Docker Compose

## 主な特徴

- **@mastra/pg**: MastraのPostgreSQL連携パッケージを使用してベクトルデータを管理
- **pgvector**: PostgreSQLのベクトル拡張機能を使用したベクトル類似度検索
- **HNSWインデックス**: 高速なベクトル検索のためのHierarchical Navigable Small Worldインデックスを使用
- **Hugging Face Transformers**: JavaScriptから直接利用できるTransformersライブラリを使用
- **チャンキング**: HTMLテキストを意味のある単位で分割し、ベクトル化

## セットアップ

1. リポジトリをクローンします：

```bash
git clone <repository-url>
cd mastra-embeddings-sample
```

2. 依存関係をインストールします：

```bash
npm install
```

3. `.env.development` ファイルを作成し、以下の項目を設定します：

```
# PostgreSQL接続設定
DATABASE_URL=postgres://dev_user:dev_password@localhost:5432/embedding_db
```

4. PostgreSQLサーバーを起動します：

```bash
docker-compose up -d
```

## 使用方法

### HTMLファイルのインポートとベクトル化

以下のコマンドを実行して、HTMLファイルをチャンク化し、ベクトル埋め込みをPostgreSQLに保存します：

```bash
npm run import
```

このコマンドは以下の処理を行います：

1. `input_data/sample.html` ファイルを読み込みます
2. HTMLテキストを約500文字のチャンクに分割します（100文字のオーバーラップあり）
3. Hugging Faceのall-MiniLM-L6-v2モデルを使用して各チャンクのベクトル埋め込みを生成します（384次元）
4. @mastra/pgを使用して埋め込みベクトルとメタデータをPostgreSQLに保存します

### ベクトル類似度検索

以下のコマンドを実行して、ベクトル類似度検索を行うことができます：

```bash
npm run search
```

対話的な検索インターフェースが表示されます。検索したいテキストを入力すると、類似度の高いチャンクが返されます。検索結果には、スコア、内容、メタデータが表示されます。

## 技術詳細

### データベース構造

このプロジェクトでは、PostgreSQLとpgvector拡張を使用して、以下のようなテーブル構造を作成します：

```sql
CREATE TABLE chunks_index (
  id SERIAL PRIMARY KEY,
  vector_id TEXT NOT NULL UNIQUE,
  embedding VECTOR(384) NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- ベクトル検索用のインデックス
CREATE INDEX chunks_index_vector_idx ON chunks_index USING hnsw (embedding vector_cosine_ops);
```

- `id`: 各チャンクの一意のID
- `vector_id`: Mastraが使用する識別子
- `embedding`: 384次元のベクトル埋め込み
- `metadata`: テキスト内容やメタデータを含むJSONB型フィールド

### 使用しているモデル

このプロジェクトでは、以下のモデルを使用しています：

- **Xenova/all-MiniLM-L6-v2**
  - 軽量で高性能な埋め込みモデル（約90MB）
  - 384次元のベクトルを生成
  - オープンソースで商用利用も可能
  - APIキーなしで使用可能
  - Webブラウザ用に最適化されたバージョン

### Mastra連携

このプロジェクトでは、以下のMastraパッケージを使用しています：

- **@mastra/pg**: PostgreSQLとpgvector拡張を使用したベクトルデータベース連携
- **@mastra/core**: Mastraのコア機能

## プロジェクト構造

```
mastra-embeddings-sample/
  ├── input_data/            # インポート対象のHTMLファイル
  │   └── sample.html        # サンプルHTML
  ├── src/                   # ソースコード
  │   ├── index.ts           # インポート用スクリプト
  │   └── search.ts          # 検索用スクリプト
  ├── .env.development       # 環境変数設定
  ├── compose.yaml           # Docker Compose設定
  ├── init.sql               # PostgreSQL初期化スクリプト
  ├── package.json           # npm設定
  └── tsconfig.json          # TypeScript設定
```

## 注意事項

- 初回実行時は、Hugging Faceのモデルをダウンロードするため時間がかかる場合があります
- 大量のデータを処理する場合は、チャンクサイズや重複の設定を調整することで、結果の品質を向上させることができます
- @mastra/pgはテーブル構造に特定の要件があります（vector_id, embedding, metadataフィールドが必須）
- HNSWインデックスはANN（Approximate Nearest Neighbor）検索を行うため、正確性と速度のトレードオフがあります

## 今後の拡張

- LangChainとMastraの統合
- ベクトル検索のパフォーマンス最適化
- 類似度スコアの正規化と閾値設定
- 複数のドキュメント種類（PDFやMarkdownなど）に対応
- ローカルで動作する大規模言語モデルとの統合
- ベクトルデータの可視化機能
- 検索結果のRAG（Retrieval Augmented Generation）への応用
