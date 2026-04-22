#!/usr/bin/env bash
# Đưa Python của venv dự án lên đầu PATH (chỉ shell hiện tại).
#
# Cách dùng — từ thư mục gốc repo:
#   source scripts/shell/use-repo-python.sh
#
# Sau đó `python3` / `pip` trỏ vào venv (thường 3.11), không còn mặc định Homebrew 3.14
# trừ khi bạn mở terminal mới (cần source lại hoặc thêm vào ~/.zshrc có điều kiện).

_shell_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$_shell_dir/../.." && pwd)"

for rel in ai-service/venv one_automation_system/venv automation/venv; do
  if [ -x "$REPO_ROOT/$rel/bin/python3" ]; then
    export PATH="$REPO_ROOT/$rel/bin:$PATH"
    echo "[use-repo-python] PATH ưu tiên: $REPO_ROOT/$rel/bin"
    echo "[use-repo-python]   \$(command -v python3) = $(command -v python3)"
    echo "[use-repo-python]   $(python3 --version)"
    if [ "${BASH_SOURCE[0]}" != "$0" ]; then
      return 0
    fi
    exit 0
  fi
done

echo "[use-repo-python] Chưa thấy venv. Chạy: npm run setup:ai-service (hoặc setup automation). Xem PYTHON_VENV_GUIDE.md" >&2
if [ "${BASH_SOURCE[0]}" != "$0" ]; then
  return 1
fi
exit 1
