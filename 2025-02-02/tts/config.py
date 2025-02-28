"""
Text-to-Speech設定パラメータ
"""

# 音声モデルの設定
TTS_CONFIG = {
    "model": "tts-1",      # または "tts-1-hd"（高品質）
    "voice": "echo",       # alloy, echo, fable, onyx, nova, shimmer
    "speed": 1.0          # 0.25-4.0（1.0が標準速度）
}

# ファイル設定
INPUT_TEXT_FILE = "input_text.txt"
OUTPUT_DIR = "output"
OUTPUT_FORMAT = "mp3" 