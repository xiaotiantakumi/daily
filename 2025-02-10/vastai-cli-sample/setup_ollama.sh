#!/bin/bash

# 環境変数の読み込み
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}.envファイルが見つかりません。${NC}"
    echo -e "${GREEN}.env.templateをコピーして必要な情報を設定してください。${NC}"
    if [ ! -f .env.template ]; then
        echo -e "${RED}.env.templateも見つかりません。${NC}"
        exit 1
    fi
    cp .env.template .env
    echo "セットアップを続行する前に、.envファイルを編集してください。"
    exit 1
fi

# 設定値
OFFER_ID=""        # vast.ai のオファーID
DISK_SIZE=${DISK_SIZE:-"50"}     # デフォルト値: 50GB
TIME_ZONE=${TIME_ZONE:-"Asia/Tokyo"}

# カラー出力用の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 実行権限の確認と付与
chmod +x search_offers.sh create_instance.sh

# GPU検索の実行
./search_offers.sh

# インスタンス作成
./create_instance.sh

echo -e "${GREEN}セットアップが完了しました！${NC}" 