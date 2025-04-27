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

# API キーの確認と設定
if [ -z "$VAST_API_KEY" ]; then
    echo -e "${RED}API キーが設定されていません。.envファイルを確認してください。${NC}"
    exit 1
fi

# デバッグモードを有効化
export VASTAI_DEBUG=1

vastai set api-key $VAST_API_KEY

# 検索クエリの構築
SEARCH_QUERY="gpu_ram>=${MIN_VRAM}"

# GPU条件
if [ ! -z "$GPU_PREFERENCE" ]; then
    # アンダースコアをスペースに置換
    GPU_NAME=$(echo "$GPU_PREFERENCE" | tr '_' ' ')
    SEARCH_QUERY="$SEARCH_QUERY gpu_name=$GPU_NAME"
fi

# 価格条件
if [ ! -z "$MAX_PRICE" ]; then
    SEARCH_QUERY="$SEARCH_QUERY dph_total<${MAX_PRICE}"
fi

# 地域条件
if [ ! -z "$LOCATION" ]; then
    # カンマで区切られた国コードを配列に変換
    IFS=',' read -r -a COUNTRIES <<< "$LOCATION"
    # 国コードを大文字のまま使用
    COUNTRIES_LIST=""
    for country in "${COUNTRIES[@]}"; do
        # 前の要素がある場合はカンマを追加
        if [ ! -z "$COUNTRIES_LIST" ]; then
            COUNTRIES_LIST="$COUNTRIES_LIST,"
        fi
        # クォートなしで追加
        COUNTRIES_LIST="$COUNTRIES_LIST${country}"
    done
    SEARCH_QUERY="$SEARCH_QUERY geolocation in [${COUNTRIES_LIST}]"
fi

# オンデマンド条件
if [ "$ON_DEMAND" = "1" ]; then
    SEARCH_QUERY="$SEARCH_QUERY rented=False"
fi

# ソート順の設定
SORT_OPT=""
if [ ! -z "$SORT_BY" ]; then
    if [ "$SORT_ORDER" = "desc" ]; then
        SORT_OPT="-o ${SORT_BY}"
    else
        SORT_OPT="-o ${SORT_BY}-"
    fi
fi

# 検索実行と結果保存
echo -e "${GREEN}検索クエリ: $SEARCH_QUERY${NC}"

# エラーメッセージを含めて結果を取得
SEARCH_OUTPUT=$(vastai search offers "$SEARCH_QUERY" $SORT_OPT 2>&1)
EXIT_CODE=$?

# エラーチェック
if [ $EXIT_CODE -ne 0 ]; then
    echo -e "${RED}エラーが発生しました（終了コード: $EXIT_CODE）${NC}"
    echo -e "${RED}エラー詳細:${NC}"
    echo "$SEARCH_OUTPUT"
    
    # エラー内容をログに保存
    ERROR_LOG="search_results/error_$(date '+%Y%m%d_%H%M%S').log"
    mkdir -p "search_results"
    {
        echo "タイムスタンプ: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "検索クエリ: $SEARCH_QUERY"
        echo "ソートオプション: $SORT_OPT"
        echo "終了コード: $EXIT_CODE"
        echo "エラー出力:"
        echo "$SEARCH_OUTPUT"
    } > "$ERROR_LOG"
    echo -e "${RED}エラーログを保存しました: $ERROR_LOG${NC}"
    
    # エラー情報をlist.mdにも保存
    if [ "$SAVE_RESULTS" = "1" ]; then
        RESULTS_DIR="search_results"
        mkdir -p "$RESULTS_DIR"
        TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
        RESULTS_FILE="${RESULTS_DIR}/list_${TIMESTAMP}.md"

        {
            echo "# Vast.ai GPU検索結果 - $(date '+%Y-%m-%d %H:%M:%S')"
            echo ""
            echo "## 検索条件"
            echo '```'
            echo "検索クエリ: $SEARCH_QUERY"
            echo "ソート: ${SORT_BY} (${SORT_ORDER})"
            echo '```'
            echo ""
            echo "## エラー情報"
            echo '```'
            echo "終了コード: $EXIT_CODE"
            echo "エラー詳細:"
            echo "$SEARCH_OUTPUT"
            echo '```'
            echo ""
        } > "$RESULTS_FILE"

        ln -sf "$RESULTS_FILE" "list.md"
        echo -e "${GREEN}エラー情報を保存しました：${NC}"
        echo "- 詳細結果: ${RESULTS_FILE}"
        echo "- 最新結果: list.md"
    fi
    
    exit 1
fi

# 結果を表示
echo "$SEARCH_OUTPUT"

if [ "$SAVE_RESULTS" = "1" ]; then
    # 保存先ディレクトリの作成
    RESULTS_DIR="search_results"
    mkdir -p "$RESULTS_DIR"

    # タイムスタンプ付きのファイル名
    TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    RESULTS_FILE="${RESULTS_DIR}/list_${TIMESTAMP}.md"

    echo "# Vast.ai GPU検索結果 - $(date '+%Y-%m-%d %H:%M:%S')" > "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "## 検索条件" >> "$RESULTS_FILE"
    echo '```' >> "$RESULTS_FILE"
    echo "検索クエリ: $SEARCH_QUERY" >> "$RESULTS_FILE"
    echo "ソート: ${SORT_BY} (${SORT_ORDER})" >> "$RESULTS_FILE"
    echo '```' >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "## 検索結果" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"

    # ヘッダー行を取得して区切り行を生成
    HEADER=$(echo "$SEARCH_OUTPUT" | head -n 1)
    # ヘッダーをカラム配列に分割
    IFS=' ' read -r -a COLUMNS <<< "$HEADER"

    # ヘッダー行をマークダウンテーブル形式に変換
    # ヘッダー行
    printf "|" >> "$RESULTS_FILE"
    for col in "${COLUMNS[@]}"; do
        if [ ! -z "$col" ]; then
            printf " %s |" "$col" >> "$RESULTS_FILE"
        fi
    done
    echo "" >> "$RESULTS_FILE"

    # 区切り行
    printf "|" >> "$RESULTS_FILE"
    for col in "${COLUMNS[@]}"; do
        if [ ! -z "$col" ]; then
            printf " --- |" >> "$RESULTS_FILE"
        fi
    done
    echo "" >> "$RESULTS_FILE"

    # データ行を変換
    echo "$SEARCH_OUTPUT" | tail -n +2 | while read -r line; do
        IFS=' ' read -r -a FIELDS <<< "$line"
        printf "|" >> "$RESULTS_FILE"
        for field in "${FIELDS[@]}"; do
            if [ ! -z "$field" ]; then
                printf " %s |" "$field" >> "$RESULTS_FILE"
            fi
        done
        echo "" >> "$RESULTS_FILE"
    done

    # 最新の結果へのシンボリックリンクを作成
    ln -sf "$RESULTS_FILE" "list.md"

    echo -e "${GREEN}検索結果を保存しました：${NC}"
    echo "- 詳細結果: ${RESULTS_FILE}"
    echo "- 最新結果: list.md"
else
    vastai search offers "$SEARCH_QUERY" $SORT_OPT
fi 