# 仕様パターン実装プロジェクト

## 概要

このプロジェクトは、仕様パターン(Specification Pattern)を TypeScript で実装したものです。仕様パターンは、ビジネスルールをカプセル化し、再利用可能な方法で組み合わせることができるデザインパターンです。

## 仕様パターンの説明

仕様パターンは、以下の主要なコンポーネントで構成されています:

- `Specification<T>`インターフェース: 仕様の基本契約を定義
- `AbstractSpecification<T>`クラス: 共通の振る舞いを実装
- 具体的な仕様クラス: 特定のビジネスルールを実装

仕様は、`and`、`or`、`not`の論理演算で組み合わせることができます。

## 実装済み仕様

- AgeSpecification: 年齢による検証
- AndSpecification: 論理積
- OrSpecification: 論理和
- NotSpecification: 論理否定
- ClassCapacitySpecification: クラスの定員検証
- MembershipSpecification: 会員ステータス検証
- PaymentSpecification: 支払い状況検証

## 使用方法

1. プロジェクトをクローン:

   ```bash
   git clone https://github.com/your-repo/spec-ptn.git
   cd spec-ptn
   ```

2. 依存関係をインストール:

   ```bash
   npm install
   ```

3. ビルド:

   ```bash
   npm run build
   ```

4. 実行:
   ```bash
   npm start
   ```

## テスト

プロジェクトには Jest を使用した単体テストが含まれています。

テストを実行:

```bash
npm test
```

ウォッチモードでテストを実行:

```bash
npm run test:watch
```

## ライセンス

MIT
