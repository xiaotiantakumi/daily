# OpenAI Text-to-Speech サンプル

このプロジェクトは、OpenAI の Text-to-Speech API を使用して、テキストを音声に変換するサンプルアプリケーションです。

## セットアップ

1. Python 仮想環境を作成し、有効化します：

```bash
python -m venv venv
source venv/bin/activate  # Unix/macOS
# または
.\venv\Scripts\activate  # Windows
```

2. 必要なパッケージをインストールします：

```bash
pip install -r requirements.txt
```

3. 環境変数を設定します：
   - `.env.example`ファイルを`.env`にコピーします
   - `.env`ファイルに OpenAI API キーを設定します

## 使用方法

1. `input_text.txt`に変換したいテキストを記述します
2. 必要に応じて`config.py`で音声変換のパラメータを設定します
3. 以下のコマンドで実行します：

```bash
python main.py
```

## 設定可能なパラメータ

- `voice`: 使用する音声モデル

  - `alloy`: バランスの取れた中性的な声
  - `echo`: 深みのある男性的な声
  - `fable`: 表現力豊かな声
  - `onyx`: 力強い男性的な声
  - `nova`: 優しい女性的な声
  - `shimmer`: 明るい女性的な声

- `model`: 使用するモデル

  - `tts-1`: 標準品質モデル
  - `tts-1-hd`: 高品質モデル

- `speed`: 話速の調整（0.25 から 4.0 の間）

  - 1.0: 標準速度
  - 0.5: 半分の速さ
  - 0.8: やや遅め
  - 1.5: やや速め
  - 2.0: 2 倍の速さ

- `output_dir`: 出力音声ファイルの保存ディレクトリ
- `input_text_file`: 入力テキストファイルのパス（デフォルト: input_text.txt）

## ログ機能

- 実行時のログは標準出力と`logs`ディレクトリの両方に出力されます
- ログファイルは日付ごとに作成され、7 日間保持されます
- ログレベル：
  - INFO: 通常の処理の流れ
  - DEBUG: 詳細な処理情報
  - ERROR: エラー情報
  - SUCCESS: 処理成功時の情報

## 注意事項

- API キーは必ず`.env`ファイルで管理し、GitHub などにアップロードしないようにしてください。
- 生成された音声ファイルは`output`ディレクトリに保存されます。
- 入力テキストファイルは UTF-8 エンコーディングで保存してください。
- ログファイルは`logs`ディレクトリに保存され、7 日間保持されます。
