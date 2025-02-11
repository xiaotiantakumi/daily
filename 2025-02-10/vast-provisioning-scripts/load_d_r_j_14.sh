#!/bin/bash
set -eo pipefail

# Activate the main virtual environment
. /venv/main/bin/activate

# cd "${WORKSPACE}/" 

ollama pull hhao/qwen2.5-coder-tools:0.5b
# ollama pull hhao/qwen2.5-coder-tools:1.5b