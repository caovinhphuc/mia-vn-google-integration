#!/bin/bash

# Kích hoạt venv thống nhất (.venv tại project root)
# Dùng: source scripts/activate-venv.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="$PROJECT_ROOT/.venv"

if [ ! -d "$VENV_DIR" ]; then
    echo "⚠️  .venv chưa tồn tại. Chạy: npm run ide:setup"
    return 1 2>/dev/null || exit 1
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
echo "✓ Activated .venv ($(python --version 2>/dev/null || true))"
