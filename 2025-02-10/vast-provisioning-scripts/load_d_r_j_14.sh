#!/bin/bash
# エラーがあればスクリプトを停止
set -eo pipefail

ollama pull yuma/DeepSeek-R1-Distill-Qwen-Japanese:14b