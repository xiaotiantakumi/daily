#!/bin/bash

# AzCopyサンプル用のインフラストラクチャをデプロイするスクリプト

set -e

# 変数の設定
RESOURCE_GROUP_NAME="rg-azcopy-sample"
LOCATION="Japan East"
TEMPLATE_FILE="main.bicep"
PARAMETERS_FILE="parameters.json"
DEPLOYMENT_NAME="azcopy-infra-deployment-$(date +%Y%m%d-%H%M%S)"

echo "🚀 AzCopyサンプル用インフラストラクチャのデプロイを開始します..."

# Azure CLIにログインしているかチェック
echo "📋 Azure CLIのログイン状態を確認中..."
if ! az account show &> /dev/null; then
    echo "❌ Azure CLIにログインしていません。ログインしてください。"
    echo "   az login を実行してください。"
    exit 1
fi

# 現在のサブスクリプション情報を表示
echo "📋 現在のサブスクリプション情報:"
az account show --query "{subscriptionId:id, subscriptionName:name, tenantId:tenantId}" --output table

# リソースグループの作成
echo "📦 リソースグループ '${RESOURCE_GROUP_NAME}' を作成中..."
if az group show --name "${RESOURCE_GROUP_NAME}" &> /dev/null; then
    echo "   ✅ リソースグループ '${RESOURCE_GROUP_NAME}' は既に存在します。"
else
    az group create \
        --name "${RESOURCE_GROUP_NAME}" \
        --location "${LOCATION}" \
        --tags "Project=AzCopySample" "Environment=Development"
    echo "   ✅ リソースグループ '${RESOURCE_GROUP_NAME}' を作成しました。"
fi

# Bicepテンプレートのデプロイ
echo "🏗️  Bicepテンプレートをデプロイ中..."
az deployment group create \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --template-file "${TEMPLATE_FILE}" \
    --parameters "@${PARAMETERS_FILE}" \
    --name "${DEPLOYMENT_NAME}" \
    --verbose

# デプロイ結果の確認
echo "📋 デプロイ結果を確認中..."
az deployment group show \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --name "${DEPLOYMENT_NAME}" \
    --query "properties.outputs" \
    --output table

# ストレージアカウントの情報を取得
echo "📋 作成されたリソースの情報:"
STORAGE_ACCOUNT_NAME=$(az deployment group show \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --name "${DEPLOYMENT_NAME}" \
    --query "properties.outputs.storageAccountName.value" \
    --output tsv)

echo "   📦 ストレージアカウント名: ${STORAGE_ACCOUNT_NAME}"
echo "   📦 BlobコンテナーURL: https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/azcopy-container"
echo "   📦 Azure Files共有URL: https://${STORAGE_ACCOUNT_NAME}.file.core.windows.net/azcopy-fileshare"

# SASトークンの生成（オプション）
echo ""
echo "🔑 SASトークンを生成しますか？ (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "📋 SASトークンを生成中..."
    
    # Blob用のSASトークン
    BLOB_SAS_TOKEN=$(az storage container generate-sas \
        --account-name "${STORAGE_ACCOUNT_NAME}" \
        --name "azcopy-container" \
        --permissions "rwdl" \
        --expiry "$(date -u -d '1 day' '+%Y-%m-%dT%H:%M:%SZ')" \
        --output tsv)
    
    echo "   🔑 Blob用SASトークン: ?${BLOB_SAS_TOKEN}"
    echo "   📋 使用例:"
    echo "      azcopy copy \"./test-file.txt\" \"https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/azcopy-container/test-file.txt?${BLOB_SAS_TOKEN}\""
fi

echo ""
echo "✅ デプロイが完了しました！"
echo "📋 次のステップ:"
echo "   1. AzCopyをインストールしてください"
echo "   2. SASトークンを使用してファイルをアップロードしてください"
echo "   3. Azure Portalでリソースを確認してください"
echo ""
echo "🔗 Azure Portal: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/${RESOURCE_GROUP_NAME}"
