#!/bin/bash

# File ShareとBlob ContainerのSASトークンを生成するスクリプト
# 使用方法: source ./get-sas-tokens.sh [有効期限日数]
# 例: source ./get-sas-tokens.sh 7  # 7日間有効

# set -eは削除（source実行時に親シェルが終了しないように）

# 設定
STORAGE_ACCOUNT_NAME="stazcopysample"
BLOB_CONTAINER_NAME="azcopy-container"
FILE_SHARE_NAME="azcopy-fileshare"

# 引数処理: 有効期限日数 (デフォルト: 1日)
EXPIRY_DAYS=1  # デフォルト値を設定

# 引数の検証（引数が数値の場合のみ使用）
if [ $# -gt 0 ] && [[ "$1" =~ ^[0-9]+$ ]]; then
    EXPIRY_DAYS=$1
fi

# OS判定と日付コマンドの設定
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    EXPIRY_DATE=$(date -u -v +${EXPIRY_DAYS}d '+%Y-%m-%dT%H:%M:%SZ')
    echo "OS: macOS detected"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    EXPIRY_DATE=$(date -u -d "${EXPIRY_DAYS} days" '+%Y-%m-%dT%H:%M:%SZ')
    echo "OS: Linux detected"
else
    echo "Error: Unsupported OS: $OSTYPE"
    exit 1
fi

echo "SAS有効期限: ${EXPIRY_DATE} (${EXPIRY_DAYS}日後)"
echo "ストレージアカウント: ${STORAGE_ACCOUNT_NAME}"
echo ""

# File Share用SASトークンの生成
echo "File Share用SASトークンを生成中..."
FILE_SHARE_SAS_TOKEN=$(az storage share generate-sas \
    --account-name "${STORAGE_ACCOUNT_NAME}" \
    --name "${FILE_SHARE_NAME}" \
    --permissions "rl" \
    --expiry "${EXPIRY_DATE}" \
    --output tsv)

if [ $? -eq 0 ] && [ -n "${FILE_SHARE_SAS_TOKEN}" ]; then
    echo "✓ File Share SASトークン生成成功"
    export FILE_SHARE_SAS_TOKEN
else
    echo "✗ File Share SASトークン生成失敗"
    exit 1
fi

# Blob Container用SASトークンの生成
echo "Blob Container用SASトークンを生成中..."
BLOB_SAS_TOKEN=$(az storage container generate-sas \
    --account-name "${STORAGE_ACCOUNT_NAME}" \
    --name "${BLOB_CONTAINER_NAME}" \
    --permissions "wc" \
    --expiry "${EXPIRY_DATE}" \
    --output tsv)

if [ $? -eq 0 ] && [ -n "${BLOB_SAS_TOKEN}" ]; then
    echo "✓ Blob Container SASトークン生成成功"
    export BLOB_SAS_TOKEN
else
    echo "✗ Blob Container SASトークン生成失敗"
    exit 1
fi

# 有効期限を環境変数にエクスポート
export SAS_EXPIRY_DATE="${EXPIRY_DATE}"

echo ""
echo "=== SASトークン生成完了 ==="
echo "有効期限: ${EXPIRY_DATE}"
echo "File Share SAS: ${FILE_SHARE_SAS_TOKEN:0:50}..."
echo "Blob Container SAS: ${BLOB_SAS_TOKEN:0:50}..."
echo ""
echo "環境変数が設定されました:"
echo "- FILE_SHARE_SAS_TOKEN"
echo "- BLOB_SAS_TOKEN"
echo "- SAS_EXPIRY_DATE"
echo ""

# 直接実行された場合の警告
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "⚠️  警告: 直接実行されています。環境変数は別のターミナルセッションでは利用できません。"
    echo "環境変数を現在のセッションで利用するには、以下を実行してください:"
    echo "source ./get-sas-tokens.sh"
    echo ""
    echo "このまま続行してAzCopyを実行する場合は:"
    echo "./az-copy.sh"
fi
