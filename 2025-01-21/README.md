# 2025-01-21 Project

## 概要

このプロジェクトは、自治体への寄付と返礼品に関する計算を行うREST APIサーバーです。Express.jsとTypeScriptを使用して構築されています。

## インストール方法

1. Node.jsとnpmがインストールされていることを確認してください
2. プロジェクトルートで以下のコマンドを実行：

```bash
npm install
```

## 実行方法

- 開発モードで実行：

```bash
npm run dev
```

- 本番ビルド：

```bash
npm run build
npm start
```

## APIエンドポイント

### ヘルスチェック

- `GET /health`
  - サーバーの状態を確認

### 計算関連

- `POST /api/calculate`
  - リクエストボディ：
    ```json
    {
      "donationAmount": number, // 寄付金額
      "giftValue": number,      // 返礼品価値
      "municipalityId": string  // 自治体ID
    }
    ```
  - バリデーションエラー時は400エラーを返す

### 自治体関連

- `GET /api/municipalities`
  - 全自治体情報を取得
- `GET /api/municipalities/:id`
  - 特定の自治体情報を取得

## テスト

```bash
npm test
```

## 技術スタック

- Node.js
- Express.js
- TypeScript
- Jest (テストフレームワーク)
- express-validator (リクエストバリデーション)

## ライセンス

ISC License
