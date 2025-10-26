# AzCopy サンプル用インフラストラクチャ

このディレクトリには、AzCopy サンプル用の Azure リソースを作成するための Bicep テンプレートが含まれています。

## ファイル構成

- `main.bicep` - メインの Bicep テンプレート
- `parameters.json` - パラメータファイル
- `deploy.sh` - デプロイメントスクリプト

## 作成されるリソース

1. **リソースグループ**: `rg-azcopy-sample`
2. **ストレージアカウント**: `stazcopysample` + 一意の文字列
3. **Blob コンテナー**: `azcopy-container`
4. **Azure Files 共有**: `azcopy-fileshare`

## デプロイ方法

### 方法 1: スクリプトを使用（推奨）

```bash
cd infra
./deploy.sh
```

### 方法 2: Azure CLI を直接使用

```bash
# リソースグループの作成
az group create --name "rg-azcopy-sample" --location "Japan East"

# Bicepテンプレートのデプロイ
az deployment group create \
  --resource-group "rg-azcopy-sample" \
  --template-file "main.bicep" \
  --parameters "@parameters.json"
```

## パラメータのカスタマイズ

`parameters.json`ファイルを編集して、以下の値をカスタマイズできます：

- `resourceGroupName`: リソースグループ名
- `storageAccountName`: ストレージアカウント名（グローバルに一意である必要があります）
- `blobContainerName`: Blob コンテナー名
- `fileShareName`: Azure Files 共有名
- `location`: デプロイメントの場所
- `storageSku`: ストレージアカウントの SKU（Standard_LRS, Standard_GRS, etc.）
- `fileShareQuota`: Azure Files 共有のクォータ（GB）

## デプロイ後の確認

デプロイが完了すると、以下の情報が出力されます：

- ストレージアカウント名
- Blob コンテナー URL
- Azure Files 共有 URL
- 接続文字列

## SAS トークンの生成

デプロイスクリプトでは、オプションで SAS トークンの生成も行います。これにより、AzCopy でファイルをアップロードする際に使用できます。

## セキュリティ設定

作成されるストレージアカウントには以下のセキュリティ設定が適用されます：

- HTTPS 必須
- TLS 1.2 以上
- Blob パブリックアクセス無効
- 共有キーアクセス有効
- ネットワークアクセス制御（デフォルト: Allow）

## クリーンアップ

リソースを削除する場合：

```bash
az group delete --name "rg-azcopy-sample" --yes --no-wait
```
