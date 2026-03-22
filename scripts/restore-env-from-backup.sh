#!/bin/bash
# Khôi phục .env từ .env.backup (Telegram, Email, Google...)
# Dùng khi .env bị mất/ghi đè — backup chứa giá trị thật
# Chạy từ project root: ./scripts/restore-env-from-backup.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

BACKUP="$ROOT/.env.backup"
ENV="$ROOT/.env"

if [[ ! -f "$BACKUP" ]]; then
  echo "❌ Không tìm thấy .env.backup"
  echo "   Tạo .env.backup từ .env hiện tại: cp .env .env.backup"
  exit 1
fi

if [[ -f "$ENV" ]]; then
  if [[ "$1" != "-y" && "$1" != "--yes" ]]; then
    echo "⚠️  .env đã tồn tại. Ghi đè? (dùng -y để bỏ qua hỏi)"
    read -r -p "   [y/N] " ans
    if [[ "${ans,,}" != "y" && "${ans,,}" != "yes" ]]; then
      echo "   Hủy."
      exit 0
    fi
  fi
fi

cp "$BACKUP" "$ENV"
echo "✅ Đã khôi phục .env từ .env.backup"
echo "   Kiểm tra: grep TELEGRAM .env"
echo "   Test: npm run test:telegram"
