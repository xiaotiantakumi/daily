#!/bin/bash

# カラー出力用の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# .env.templateが存在するか確認
if [ ! -f .env.template ]; then
    echo -e "${RED}.env.templateが見つかりません${NC}"
    exit 1
fi

# .envファイルが既に存在するか確認
if [ -f .env ]; then
    echo -e "${RED}.envファイルは既に存在します${NC}"
    read -p "上書きしますか？ (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        echo "セットアップを中止します"
        exit 1
    fi
fi

# .env.templateをコピー
cp .env.template .env
echo -e "${GREEN}.envファイルを作成しました${NC}"
echo "次のステップ："
echo "1. .envファイルを編集して必要な情報を設定してください"
echo "2. setup_ollama.shを実行してインスタンスをセットアップしてください"

# 実行権限の付与
chmod +x setup_ollama.sh manage_ollama.sh 