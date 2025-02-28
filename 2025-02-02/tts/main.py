import os
import time
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from loguru import logger
from config import TTS_CONFIG, INPUT_TEXT_FILE, OUTPUT_DIR, OUTPUT_FORMAT

def setup_logging():
    """ログの設定"""
    # ログファイルの設定
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # ログのフォーマット設定
    log_format = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    
    # ログの出力設定（標準出力とファイル）
    logger.remove()  # デフォルトのハンドラを削除
    logger.add(sys.stdout, format=log_format)
    logger.add(
        str(log_dir / "tts_{time:YYYY-MM-DD}.log"),
        format=log_format,
        rotation="1 day",
        retention="7 days",
        level="DEBUG"
    )

def setup_environment():
    """環境のセットアップを行う"""
    try:
        # .envファイルから環境変数を読み込む
        load_dotenv()
        logger.info(".env ファイルを読み込みました")
        
        # 出力ディレクトリの作成
        output_dir = Path(OUTPUT_DIR)
        output_dir.mkdir(exist_ok=True)
        logger.info(f"出力ディレクトリを確認しました: {output_dir}")
        
        return output_dir
    except Exception as e:
        logger.error(f"環境設定中にエラーが発生しました: {e}")
        raise

def create_tts_client():
    """OpenAI クライアントの作成"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEYが設定されていません")
            raise ValueError("OPENAI_API_KEYが設定されていません。.envファイルを確認してください。")
        
        client = OpenAI(api_key=api_key)
        logger.info("OpenAIクライアントを作成しました")
        return client
    except Exception as e:
        logger.error(f"OpenAIクライアントの作成中にエラーが発生しました: {e}")
        raise

def read_input_text():
    """入力テキストファイルを読み込む"""
    try:
        logger.info(f"入力テキストファイルを読み込みます: {INPUT_TEXT_FILE}")
        with open(INPUT_TEXT_FILE, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        logger.debug(f"読み込んだテキスト: {text}")
        return text
    except FileNotFoundError:
        logger.error(f"入力テキストファイルが見つかりません: {INPUT_TEXT_FILE}")
        raise FileNotFoundError(f"入力テキストファイル '{INPUT_TEXT_FILE}' が見つかりません。")
    except Exception as e:
        logger.error(f"テキストファイルの読み込み中にエラーが発生しました: {e}")
        raise

def generate_speech(client, text, output_path):
    """音声の生成"""
    try:
        logger.info("音声生成を開始します")
        logger.debug(f"使用するモデル: {TTS_CONFIG['model']}")
        logger.debug(f"使用する音声: {TTS_CONFIG['voice']}")
        logger.debug(f"話速: {TTS_CONFIG.get('speed', 1.0)}")
        
        response = client.audio.speech.create(
            model=TTS_CONFIG["model"],
            voice=TTS_CONFIG["voice"],
            speed=TTS_CONFIG.get("speed", 1.0),  # speedパラメータを追加（デフォルト1.0）
            input=text
        )
        
        # 音声ファイルの保存
        response.stream_to_file(str(output_path))
        logger.info(f"音声ファイルを保存しました: {output_path}")
        return True
    except Exception as e:
        logger.error(f"音声生成中にエラーが発生しました: {e}")
        return False

def main():
    """メイン処理"""
    try:
        # ログの設定
        setup_logging()
        logger.info("Text-to-Speech処理を開始します")
        
        # 環境のセットアップ
        output_dir = setup_environment()
        
        # 入力テキストの読み込み
        input_text = read_input_text()
        
        # クライアントの作成
        client = create_tts_client()
        
        # 出力ファイル名の生成（タイムスタンプ付き）
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        output_file = output_dir / f"speech_{timestamp}.{OUTPUT_FORMAT}"
        
        logger.info("音声の生成を開始します...")
        if generate_speech(client, input_text, output_file):
            logger.success(f"音声ファイルを生成しました: {output_file}")
        else:
            logger.error("音声ファイルの生成に失敗しました。")
    
    except Exception as e:
        logger.error(f"予期せぬエラーが発生しました: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 