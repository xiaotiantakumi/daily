#!/bin/bash

# File ShareからBlob ContainerへのAzCopy実行スクリプト
# 使用方法: ./az-copy.sh
# 事前に get-sas-tokens.sh を実行してSASトークンを環境変数に設定してください

set -e

# 設定
STORAGE_ACCOUNT_NAME="stazcopysample"
BLOB_CONTAINER_NAME="azcopy-container"
FILE_SHARE_NAME="azcopy-fileshare"

echo "=== AzCopy File Share to Blob Container ==="
echo "ストレージアカウント: ${STORAGE_ACCOUNT_NAME}"
echo "File Share: ${FILE_SHARE_NAME}"
echo "Blob Container: ${BLOB_CONTAINER_NAME}"
echo ""

# 環境変数チェック
if [ -z "${FILE_SHARE_SAS_TOKEN}" ]; then
    echo "✗ エラー: FILE_SHARE_SAS_TOKEN が設定されていません"
    echo "事前に get-sas-tokens.sh を実行してください:"
    echo "source ./get-sas-tokens.sh"
    exit 1
fi

if [ -z "${BLOB_SAS_TOKEN}" ]; then
    echo "✗ エラー: BLOB_SAS_TOKEN が設定されていません"
    echo "事前に get-sas-tokens.sh を実行してください:"
    echo "source ./get-sas-tokens.sh"
    exit 1
fi

if [ -n "${SAS_EXPIRY_DATE}" ]; then
    echo "SAS有効期限: ${SAS_EXPIRY_DATE}"
fi
echo ""

# URL構築
SOURCE_URL="https://${STORAGE_ACCOUNT_NAME}.file.core.windows.net/${FILE_SHARE_NAME}?${FILE_SHARE_SAS_TOKEN}"
TARGET_URL="https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${BLOB_CONTAINER_NAME}?${BLOB_SAS_TOKEN}"

echo "=== AzCopy実行 ==="
echo "ソース: ${SOURCE_URL}"
echo "ターゲット: ${TARGET_URL}"
echo ""

# AzCopyコマンド実行
echo "AzCopyコマンドを実行中..."
# -from-to FileBlobを指定することで、最適化された方法でコピーされる。
azcopy copy "${SOURCE_URL}" "${TARGET_URL}" --from-to FileBlob --recursive=true

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ AzCopy実行完了"
    echo "File Share '${FILE_SHARE_NAME}' から Blob Container '${BLOB_CONTAINER_NAME}' へのコピーが成功しました"
else
    echo ""
    echo "✗ AzCopy実行失敗"
    exit 1
fi