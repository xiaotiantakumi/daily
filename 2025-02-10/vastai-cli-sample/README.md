# Vast.ai Ollama 管理スクリプト

このリポジトリには、[vast.ai](https://vast.ai/) 上で [Ollama](https://ollama.ai/) インスタンスを簡単に管理するためのスクリプト群が含まれています。

## Ollama とは

Ollama は、ローカル環境で LLM（大規模言語モデル）を実行するためのオープンソースフレームワークです。
以下のような機能を提供します：

- Llama 2、CodeLlama、Mixtral、その他の様々なオープンソースモデルの実行
- API によるモデルの制御
- WebUI による対話インターフェース
- モデルの管理とカスタマイズ

## このツールの目的

このツールは以下を実現します：

1. vast.ai 上で GPU インスタンスを借りて Ollama を実行
2. 必要なときだけインスタンスを起動し、使わないときは停止してコストを節約
3. WebUI を通じて簡単に LLM と対話
4. API を使用して外部アプリケーションから利用

特に、ローカルの GPU では実行が難しい大規模なモデル（70B パラメータなど）を
必要なときだけクラウド GPU で実行する用途に適しています。

## 機能

- Ollama インスタンスの作成
- インスタンスの起動/停止
- ファイル転送
- インスタンスの削除
- その他の管理機能

## 使用可能なモデル

Ollama では以下のような様々なモデルが利用可能です：

- Llama 2（Meta）: チャット、コード生成など
- CodeLlama（Meta）: プログラミング特化
- Mixtral 8x7B（Mistral AI）: 高性能な汎用モデル
- Mistral 7B（Mistral AI）: 効率的な中規模モデル
- その他多数のオープンソースモデル

詳細は[Ollama のモデルライブラリ](https://ollama.ai/library)をご覧ください。

## 前提条件

- [vast.ai](https://vast.ai/) のアカウント
- vast.ai の API キー
- Python 3.8 以上

## 環境構築

1. Python 仮想環境の作成とアクティベート

   ```bash
   # 仮想環境の作成
   python -m venv venv

   # 仮想環境のアクティベート
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. 必要なパッケージのインストール

   ```bash
   pip install -r requirements.txt
   ```

## セットアップ手順

1. リポジトリのクローン

   ```bash
   git clone https://github.com/yourusername/vast-ollama-manager.git
   cd vast-ollama-manager
   ```

   > Note: このリポジトリは、vast.ai 上で Ollama を簡単に実行・管理するためのスクリプト集です。
   > 以下のファイルが含まれています：
   >
   > - `search_offers.sh`: GPU インスタンスの検索
   > - `create_instance.sh`: Ollama インスタンスの作成
   > - `setup_ollama.sh`: 上記 2 つのスクリプトを順に実行
   > - `manage_ollama.sh`: インスタンスの管理（起動/停止/削除など）
   > - `init.sh`: 初期セットアップ
   > - `.env.template`: 環境変数のテンプレート

2. スクリプトに実行権限を付与

   ```bash
   chmod +x init.sh setup_ollama.sh search_offers.sh create_instance.sh manage_ollama.sh
   ```

3. 初期化スクリプトの実行

   ```bash
   ./init.sh
   ```

4. 環境変数の設定

   - `.env` ファイルを開き、必要な情報を入力

   ```bash
   # vast.ai の設定
   VAST_API_KEY="your-api-key-here"

   # インスタンスの設定
   DISK_SIZE="50"
   TIME_ZONE="Asia/Tokyo"

   # Dockerイメージの設定
   DOCKER_IMAGE="ollama/webui:latest"

   # ポート設定
   SSH_PORT="22"
   WEBUI_PORT="8080"
   OLLAMA_PORT="11434"

   # GPU設定
   MIN_VRAM="24"           # 最小VRAM容量（GB）
   GPU_PREFERENCE="RTX_4090"    # 優先するGPUタイプ（例: "RTX_4090", "A100"）
   MAX_PRICE="0.4"        # 1時間あたりの最大料金（USD）

   # 検索条件
   LOCATION="JP,CN,IN,KR,TW,SG,HK,MY,TH,VN,PH,ID,PK,BD,LK"  # 地域（カンマ区切りの国コード）
   # JP=日本, CN=中国, IN=インド, KR=韓国, TW=台湾, SG=シンガポール
   # HK=香港, MY=マレーシア, TH=タイ, VN=ベトナム, PH=フィリピン
   # ID=インドネシア, PK=パキスタン, BD=バングラデシュ, LK=スリランカ
   ```

5. GPU の検索とインスタンスのセットアップ

   以下の 3 つの方法があります：

   a. 検索のみを実行

   ```bash
   ./search_offers.sh
   ```

   b. 検索結果から選んでインスタンスを作成

   ```bash
   # オファーIDを指定してインスタンスを作成
   ./create_instance.sh <OFFER_ID>

   # または対話的に作成
   ./create_instance.sh
   ```

   c. 検索から作成まで一括実行

   ```bash
   ./setup_ollama.sh
   ```

検索結果は `list.md` に保存され、以下の情報が含まれます：

- 検索条件
- タイムスタンプ
- 利用可能な GPU インスタンスの一覧

## 使用方法

### インスタンスの管理

インスタンスの管理には `manage_ollama.sh` を使用します：

```bash
./manage_ollama.sh
```

以下の操作が可能です：

1. インスタンス一覧の表示
2. インスタンスの停止
3. インスタンスの開始
4. インスタンスの削除
5. ファイルのアップロード
6. ファイルのダウンロード

### 注意事項

- インスタンスを使用しないときは停止することで、コストを抑えることができます
- インスタンスの削除は取り消しできません
- API キーは `.env` ファイルで安全に管理してください

## ファイル構成

- `init.sh` - 初期セットアップ用スクリプト
- `search_offers.sh` - GPU インスタンスの検索用スクリプト
- `create_instance.sh` - Ollama インスタンスの作成用スクリプト
- `setup_ollama.sh` - 検索から作成までを一括実行するスクリプト
- `manage_ollama.sh` - インスタンスの管理（起動/停止/削除）用スクリプト
- `.env.template` - 環境変数の設定テンプレート
- `.gitignore` - Git 除外設定ファイル
- `list.md` - GPU 検索結果の保存ファイル（自動生成）
- `requirements.txt` - Python パッケージの依存関係

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## サポート

問題や質問がある場合は、GitHub Issues でお知らせください。

### GPU の選択について

GPU の選択は以下の環境変数で制御できます：

- `MIN_VRAM`: 必要な最小 VRAM 容量（GB）
- `GPU_PREFERENCE`: 優先する GPU タイプ（例: "RTX", "A100"など）
- `MAX_PRICE`: 1 時間あたりの最大料金（USD）

セットアップ時に、これらの条件に基づいて利用可能な GPU の一覧が表示されます。
その中から希望する GPU のオファー ID を選択してください。

例えば：

- LLaMA や CodeLlama などの 7B モデル → MIN_VRAM="24"
- Mixtral 8x7B モデル → MIN_VRAM="48"
- GPT-4 相当の 70B モデル → MIN_VRAM="80"
