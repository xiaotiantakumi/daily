## 前提

今日は下記ディレクトリで作業していく。
/Users/takumi/Documents/src/private_src/daily/2025-10-26/azcopy-sample

## az copy のインストール

下記からダウンロードしてインストールする。
https://learn.microsoft.com/ja-jp/azure/storage/common/storage-use-azcopy-v10?tabs=dnf

mac は下記で。
https://learn.microsoft.com/ja-jp/azure/storage/common/storage-use-azcopy-v10?tabs=dnf#download-the-azcopy-portable-binary

![[CleanShot 2025-10-26 at 14.47.38@2x.png]]

### Apple Silicon（M1/M2/M3）でのインストール手順

1. **ダウンロード**

   ```bash
   # Apple Silicon用のAzCopyを直接ダウンロード
   curl -L https://aka.ms/downloadazcopy-v10-mac-arm64 -o azcopy.tar.gz
   ```

2. **インストール**

   ```bash
   # ダウンロードしたファイルを解凍
   tar -xf azcopy.tar.gz

   # azcopyを実行可能にして、PATHに追加
   sudo mv azcopy_darwin_arm64_*/azcopy /usr/local/bin/
   chmod +x /usr/local/bin/azcopy

   # 一時ファイルを削除
   rm -rf azcopy_darwin_arm64_* azcopy.tar.gz
   ```

3. **動作確認**
   ```bash
   azcopy --version
   ```

azcopy version 10.30.1 と出れば OK.

### 基本的な使用方法

AzCopy では 2 つの認証方法があります：

#### 方法 1: Microsoft Entra ID を使用（推奨）

```bash
# Azure Storageアカウントにログイン
azcopy login

# ファイルをアップロード（SASトークン不要）
azcopy copy "local-file.txt" "https://yourstorageaccount.blob.core.windows.net/container/file.txt"

# ファイルをダウンロード
azcopy copy "https://yourstorageaccount.blob.core.windows.net/container/file.txt" "local-file.txt"
```

#### 方法 2: SAS トークンを使用

```bash
# SASトークンをURLに含めてコピー
azcopy copy "local-file.txt" "https://yourstorageaccount.blob.core.windows.net/container/file.txt?SAS_TOKEN"
```

## SAS キーを使用したファイルから Blob へのコピー手順

### 1. SAS キーの取得

Azure Portal で SAS キーを生成する手順：

1. **ストレージアカウントにアクセス**

   - Azure Portal → ストレージアカウント → 対象のストレージアカウント

2. **Shared Access Signature の設定**

   - 左メニューから「Shared Access Signature」を選択
   - 以下の設定を行う：
     - **Allowed services**: Blob
     - **Allowed resource types**: Service, Container, Object
     - **Allowed permissions**: Read, Write, Delete, List
     - **Start time**: 現在時刻
     - **Expiry time**: 適切な有効期限（例：1 日後）
     - **Allowed protocols**: HTTPS only

3. **SAS キーの生成**
   - 「Generate SAS and connection string」をクリック
   - **SAS token**をコピー（`?sv=...`で始まる文字列）

### 2. 実際のコピー手順

#### 2.1 単一ファイルのアップロード

```bash
# 基本的な構文
azcopy copy "ローカルファイルパス" "https://ストレージアカウント名.blob.core.windows.net/コンテナ名/ファイル名?SASトークン"

# 実際の例
azcopy copy "/Users/takumi/Documents/test.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/test.txt?sv=2018-03-28&ss=bjqt&srt=sco&sp=rwddgcup&se=2019-05-01T05:01:17Z&st=2019-04-30T21:01:17Z&spr=https&sig=MGCXiyEzbtttkr3ewJIh2AR8KrghSy1DGM9ovN734bQF4%3D"
```

#### 2.2 ディレクトリ全体のアップロード

```bash
# ディレクトリ全体をアップロード（再帰的）
azcopy copy "/Users/takumi/Documents/src/private_src/daily/2025-10-26/azcopy-sample/" "https://mystorageaccount.blob.core.windows.net/mycontainer/azcopy-sample/?sv=..." --recursive=true

# 特定のファイル拡張子のみ
azcopy copy "/Users/takumi/Documents/src/private_src/daily/2025-10-26/azcopy-sample/" "https://mystorageaccount.blob.core.windows.net/mycontainer/azcopy-sample/?sv=..." --recursive=true --include-pattern="*.txt;*.md"
```

#### 2.3 オプション付きのアップロード

```bash
# 詳細ログ付きでアップロード
azcopy copy "/Users/takumi/Documents/test.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/test.txt?sv=..." --log-level=INFO

# 並列処理数を指定（デフォルトは8）
azcopy copy "/Users/takumi/Documents/test.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/test.txt?sv=..." --parallel=4

# ファイルの上書きを許可
azcopy copy "/Users/takumi/Documents/test.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/test.txt?sv=..." --overwrite=true
```

### 3. 実際のテスト手順

#### 3.1 テスト用ファイルの準備

```bash
# 作業ディレクトリに移動
cd /Users/takumi/Documents/src/private_src/daily/2025-10-26/azcopy-sample

# テスト用ファイルを作成
echo "これはテストファイルです。$(date)" > test-file.txt
echo "SASキーを使用したアップロードテスト" >> test-file.txt
```

#### 3.2 実際のアップロード実行

```bash
# 1. まず単一ファイルでテスト
azcopy copy "./test-file.txt" "https://YOUR_STORAGE_ACCOUNT.blob.core.windows.net/YOUR_CONTAINER/test-file.txt?YOUR_SAS_TOKEN"

# 2. 成功したらディレクトリ全体をテスト
azcopy copy "./" "https://YOUR_STORAGE_ACCOUNT.blob.core.windows.net/YOUR_CONTAINER/azcopy-sample/?YOUR_SAS_TOKEN" --recursive=true
```

#### 3.3 アップロード結果の確認

```bash
# アップロードされたファイルの一覧を確認
azcopy list "https://YOUR_STORAGE_ACCOUNT.blob.core.windows.net/YOUR_CONTAINER/?YOUR_SAS_TOKEN"
```

### 4. よく使用するオプション

| オプション          | 説明                           | 例                                |
| ------------------- | ------------------------------ | --------------------------------- |
| `--recursive`       | ディレクトリを再帰的にコピー   | `--recursive=true`                |
| `--include-pattern` | 特定のパターンのファイルのみ   | `--include-pattern="*.txt;*.md"`  |
| `--exclude-pattern` | 特定のパターンのファイルを除外 | `--exclude-pattern="*.tmp;*.log"` |
| `--overwrite`       | 既存ファイルの上書き           | `--overwrite=true`                |
| `--log-level`       | ログレベル                     | `--log-level=INFO`                |
| `--parallel`        | 並列処理数                     | `--parallel=4`                    |
| `--check-md5`       | MD5 チェックサムの検証         | `--check-md5=CheckMD5`            |

### 5. トラブルシューティング

#### 5.1 よくあるエラーと対処法

```bash
# エラー: SASトークンが無効
# 対処: SASトークンの有効期限と権限を確認

# エラー: コンテナが存在しない
# 対処: 事前にコンテナを作成するか、SASトークンにコンテナ作成権限を含める

# エラー: ファイルサイズ制限
# 対処: 大きなファイルは分割してアップロード
```

#### 5.2 デバッグ用コマンド

```bash
# 詳細なログを出力
azcopy copy "source" "destination" --log-level=DEBUG

# ドライラン（実際にはコピーしない）
azcopy copy "source" "destination" --dry-run
```

### 6. セキュリティのベストプラクティス

1. **SAS トークンの有効期限を短く設定**
2. **必要最小限の権限のみ付与**
3. **HTTPS のみを使用**
4. **SAS トークンをログに出力しない**
5. **定期的に SAS トークンを更新**

### 7. SAS トークンの特殊文字エスケープ

バッチファイル（.cmd）で SAS トークンを使用する場合、特殊文字のエスケープが必要です：

```bash
# バッチファイルでのエスケープ例
# % 文字 → %%
# ^ 文字 → ^&
```

**例：**

- 元の SAS トークン: `?sv=2023-01-03&st=2025-10-26T05%3A00%3A00Z`
- バッチファイル用: `?sv=2023-01-03&st=2025-10-26T05%%3A00%%3A00Z`
