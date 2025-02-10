#!/bin/bash

# 環境変数の読み込み
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}.envファイルが見つかりません。${NC}"
    echo "先にsetup_ollama.shを実行してセットアップを完了してください。"
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

# メニュー表示
show_menu() {
    echo -e "${GREEN}Ollama 管理メニュー${NC}"
    echo "1) インスタンス一覧の表示"
    echo "2) インスタンスの停止"
    echo "3) インスタンスの開始"
    echo "4) インスタンスの削除"
    echo "5) ファイルのアップロード"
    echo "6) ファイルのダウンロード"
    echo "q) 終了"
}

# メインループ
while true; do
    show_menu
    read -p "操作を選択してください: " choice

    case $choice in
        1)
            echo -e "${GREEN}インスタンス一覧を表示します...${NC}"
            vastai show instances
            ;;
        2)
            read -p "停止するインスタンスIDを入力: " instance_id
            echo -e "${GREEN}インスタンスを停止しています...${NC}"
            vastai stop instance $instance_id
            check_error "インスタンスの停止に失敗しました"
            ;;
        3)
            read -p "開始するインスタンスIDを入力: " instance_id
            echo -e "${GREEN}インスタンスを開始しています...${NC}"
            vastai start instance $instance_id
            check_error "インスタンスの開始に失敗しました"
            ;;
        4)
            read -p "削除するインスタンスIDを入力: " instance_id
            echo -e "${RED}警告: このアクションは取り消せません${NC}"
            read -p "本当に削除しますか？ (y/N): " confirm
            if [ "$confirm" = "y" ]; then
                vastai destroy instance $instance_id
                check_error "インスタンスの削除に失敗しました"
            fi
            ;;
        5)
            read -p "インスタンスIDを入力: " instance_id
            read -p "ローカルのファイルパス: " local_path
            read -p "リモートのファイルパス: " remote_path
            vastai copy $local_path $instance_id:$remote_path
            check_error "ファイルのアップロードに失敗しました"
            ;;
        6)
            read -p "インスタンスIDを入力: " instance_id
            read -p "リモートのファイルパス: " remote_path
            read -p "ローカルのファイルパス: " local_path
            vastai copy $instance_id:$remote_path $local_path
            check_error "ファイルのダウンロードに失敗しました"
            ;;
        q)
            echo "プログラムを終了します"
            exit 0
            ;;
        *)
            echo -e "${RED}無効な選択です${NC}"
            ;;
    esac
    echo
done 