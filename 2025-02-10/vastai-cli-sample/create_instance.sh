#!/bin/bash

# 環境変数の読み込み
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}.envファイルが見つかりません。${NC}"
    exit 1
fi

# カラー出力用の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# 関数: エラーチェック
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}エラーが発生しました: $1${NC}"
        exit 1
    fi
}

# API キーの確認と設定
if [ -z "$VAST_API_KEY" ]; then
    echo -e "${RED}API キーが設定されていません。.envファイルを確認してください。${NC}"
    exit 1
fi
vastai set api-key $VAST_API_KEY

# オファーIDの取得（コマンドライン引数またはユーザー入力）
OFFER_ID=$1
if [ -z "$OFFER_ID" ]; then
    echo "オファーIDを入力してください（./search_offers.sh で検索可能）："
    read OFFER_ID
fi

# インスタンスの作成
echo -e "${GREEN}インスタンスを作成しています...${NC}"
INSTANCE_ID=$(vastai create instance $OFFER_ID \
    --image $DOCKER_IMAGE \
    --disk $DISK_SIZE \
    --ssh --direct \
    --env "-e TZ=$TIME_ZONE -p $SSH_PORT:$SSH_PORT -p $WEBUI_PORT:$WEBUI_PORT -p $OLLAMA_PORT:$OLLAMA_PORT" \
    | grep -oP 'Started instance \K[0-9]+')
check_error "インスタンスの作成に失敗しました"

# インスタンス情報の表示
echo -e "${GREEN}インスタンス情報を取得しています...${NC}"
vastai show instances
check_error "インスタンス情報の取得に失敗しました"

echo -e "${GREEN}セットアップが完了しました！${NC}"
echo "インスタンスID: $INSTANCE_ID"
echo "WebUIにアクセスして初期設定を行ってください。" 