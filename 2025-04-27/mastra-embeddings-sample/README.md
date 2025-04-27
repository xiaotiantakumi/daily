# PostgreSQL Vector Database サンプル

このプロジェクトは、PostgreSQL のベクトルデータベース拡張機能 [pgvector](https://github.com/pgvector/pgvector) を使用したサンプルプロジェクトです。テキストの埋め込みベクトルを保存し、類似度検索を行うことができます。

## 前提条件

- Docker
- Docker Compose

## セットアップ手順

1. リポジトリをクローンまたはダウンロードします

2. Docker コンテナを起動します

```bash
docker-compose up -d
```

データベースの初期化は自動的に行われます。

## データベースへの接続

PostgreSQL に接続するには以下のコマンドを使用します：

```bash
docker exec -it postgres-pgvector psql -U dev_user -d embedding_db
```

もしくは、お好みの PostgreSQL クライアントから以下の接続情報を使用して接続できます：

- ホスト: `localhost`
- ポート: `5432`
- データベース: `embedding_db`
- ユーザー名: `dev_user`
- パスワード: `dev_password`

jdbc:postgresql://localhost:5432/embedding_db

## データベース構造

`items` テーブルには以下のカラムが含まれています：

- `id`: 主キー（自動採番）
- `embedding`: 3 次元のベクトルデータ
- `description`: ベクトルデータの説明

## サンプルデータ

初期データとして、以下の 3 つのベクトルが挿入されます：

1. 正の感情を表すベクトル: `[0.8549, -0.4251, 0.2981]`
2. 負の感情を表すベクトル: `[-0.7403, 0.2845, 0.6079]`
3. 中立的な感情を表すベクトル: `[0.1257, 0.9124, -0.3891]`

## 使用例

類似度検索の例：

```sql
-- コサイン類似度を使用して最も近いベクトルを検索
docker exec postgres-pgvector psql -U dev_user -d embedding_db -c "SELECT id, description, embedding <=> '[0.8549,-0.4251,0.2981]' as distance FROM items ORDER BY distance LIMIT 5;"
```

## 環境変数

- データベース名: `embedding_db`
- ユーザー名: `dev_user`
- パスワード: `dev_password`
- ポート: `5432`

## 注意事項

- このプロジェクトはデモンストレーション用です
- 本番環境で使用する場合は、適切なセキュリティ設定を行ってください
- パスワードは環境変数として管理することを推奨します
