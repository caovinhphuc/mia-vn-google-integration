#!/usr/bin/env bash
set -euo pipefail

# 🔧 AI Service Virtual Environment Setup
# Luôn dùng thư mục chứa script (chạy được từ root repo hoặc từ đâu cũng được).
#
# Mặc định: nếu đã có venv → chỉ pip install (không backup, không xóa).
# Tạo lại từ đầu + backup venv cũ: bash setup_venv.sh --force
# Hoặc: AI_SERVICE_VENV_FORCE=1 bash setup_venv.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_NAME="${AI_SERVICE_VENV_NAME:-venv}"
FORCE_RECREATE=0
if [[ "${AI_SERVICE_VENV_FORCE:-}" == "1" || "${AI_SERVICE_VENV_FORCE:-}" == "true" ]]; then
  FORCE_RECREATE=1
fi
for _arg in "$@"; do
  if [[ "$_arg" == "--force" || "$_arg" == "-f" ]]; then
    FORCE_RECREATE=1
  elif [[ "$_arg" == "--help" || "$_arg" == "-h" ]]; then
    echo "Usage: bash setup_venv.sh [--force]"
    echo "  (default)  Giữ venv hiện có, chỉ nâng pip + pip install -r requirements.txt"
    echo "  --force    Backup venv cũ rồi tạo venv mới bằng Python đã chọn"
    echo "  PYTHON_BIN=/path/to/python3.12  Ưu tiên interpreter (bỏ qua auto-detect)"
    exit 0
  fi
done
unset _arg

echo "🔧 Setting up AI Service Virtual Environment"
echo "================================================="
echo -e "📂 Working directory: ${SCRIPT_DIR}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Chọn Python: ưu tiên 3.11 (PATH + Homebrew thường gặp trên macOS)
PYTHON_CMD=""
for candidate in \
  python3.11 \
  /opt/homebrew/opt/python@3.11/bin/python3.11 \
  /usr/local/opt/python@3.11/bin/python3.11; do
  if command -v "$candidate" &>/dev/null; then
    resolved="$(command -v "$candidate")"
    if "$resolved" -c 'import sys; sys.exit(0 if sys.version_info[:2] == (3, 11) else 1)' 2>/dev/null; then
      PYTHON_CMD="$resolved"
      echo -e "${GREEN}✓${NC} Using Python 3.11: $PYTHON_CMD"
      break
    fi
  elif [[ -x "$candidate" ]]; then
    if "$candidate" -c 'import sys; sys.exit(0 if sys.version_info[:2] == (3, 11) else 1)' 2>/dev/null; then
      PYTHON_CMD="$candidate"
      echo -e "${GREEN}✓${NC} Using Python 3.11: $PYTHON_CMD"
      break
    fi
  fi
done

if [[ -z "$PYTHON_CMD" ]]; then
  for candidate in python3.12 /opt/homebrew/opt/python@3.12/bin/python3.12; do
    if command -v "$candidate" &>/dev/null; then
      resolved="$(command -v "$candidate")"
      PYTHON_CMD="$resolved"
      echo -e "${YELLOW}!${NC} Using Python 3.12: $PYTHON_CMD (3.11 recommended)"
      break
    elif [[ -x "$candidate" ]]; then
      PYTHON_CMD="$candidate"
      echo -e "${YELLOW}!${NC} Using Python 3.12: $PYTHON_CMD (3.11 recommended)"
      break
    fi
  done
fi

if [[ -z "$PYTHON_CMD" ]]; then
  for candidate in python3.13 /opt/homebrew/opt/python@3.13/bin/python3.13; do
    if command -v "$candidate" &>/dev/null; then
      PYTHON_CMD="$(command -v "$candidate")"
      echo -e "${YELLOW}!${NC} Using Python 3.13: $PYTHON_CMD (3.11 recommended)"
      break
    elif [[ -x "$candidate" ]]; then
      PYTHON_CMD="$candidate"
      echo -e "${YELLOW}!${NC} Using Python 3.13: $PYTHON_CMD (3.11 recommended)"
      break
    fi
  done
fi

if [[ -z "$PYTHON_CMD" ]]; then
  # Không dùng Python 3.14+ làm mặc định tạo venv (wheel / FastAPI thường lỗi).
  if [[ -n "${PYTHON_BIN:-}" ]] && command -v "${PYTHON_BIN}" &>/dev/null; then
    resolved="$(command -v "${PYTHON_BIN}")"
    if "${resolved}" -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
      PYTHON_CMD="$resolved"
      echo -e "${GREEN}✓${NC} Dùng PYTHON_BIN từ môi trường: $PYTHON_CMD"
    fi
  fi
fi

if [[ -z "$PYTHON_CMD" ]]; then
  if command -v python3 &>/dev/null; then
    resolved="$(command -v python3)"
    if "${resolved}" -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
      PYTHON_CMD="$resolved"
      echo -e "${YELLOW}!${NC} Dùng python3 trên PATH (<3.14): $PYTHON_CMD — khuyến nghị: brew install python@3.12"
    fi
  fi
fi

if [[ -z "$PYTHON_CMD" ]]; then
  echo -e "${RED}✗${NC} Không tìm thấy Python 3.11–3.13, và python3 trên PATH là 3.14+ (hoặc không có)."
  echo "   Cài 3.12 rồi tạo lại venv:"
  echo "   brew install python@3.12"
  echo "   PYTHON_BIN=/opt/homebrew/opt/python@3.12/bin/python3.12 bash setup_venv.sh --force"
  exit 1
fi

if [[ -d "$VENV_NAME" ]]; then
  if [[ "$FORCE_RECREATE" -eq 1 ]]; then
    _ts="$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}[INFO]${NC} --force: backup venv cũ → ${VENV_NAME}.backup.${_ts}..."
    mv "$VENV_NAME" "${VENV_NAME}.backup.${_ts}"
    echo -e "${BLUE}[INFO]${NC} Creating virtual environment ($VENV_NAME)..."
    "$PYTHON_CMD" -m venv "$VENV_NAME"
  else
    echo -e "${GREEN}✓${NC} Đã có ${VENV_NAME}/ — bỏ qua tạo mới (dùng ${YELLOW}--force${NC} nếu muốn backup + tạo lại)."
  fi
else
  echo -e "${BLUE}[INFO]${NC} Creating virtual environment ($VENV_NAME)..."
  "$PYTHON_CMD" -m venv "$VENV_NAME"
fi

echo -e "${BLUE}[INFO]${NC} Upgrading pip, setuptools, wheel..."
# shellcheck source=/dev/null
source "${VENV_NAME}/bin/activate"
python -m pip install --upgrade pip setuptools wheel

echo -e "${BLUE}[INFO]${NC} Installing dependencies from requirements.txt..."
python -m pip install -r requirements.txt

echo ""
echo -e "${GREEN}✓${NC} Setup completed."
echo -e "   Python: $(python --version) ($(command -v python))"
echo ""
echo "Activate:"
echo "  cd \"$SCRIPT_DIR\" && source ${VENV_NAME}/bin/activate"
echo ""
echo "Run API:"
echo "  python -m uvicorn main_simple:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "Gợi ý:"
echo "  • Venv khác tên: AI_SERVICE_VENV_NAME=.venv bash setup_venv.sh"
echo "  • Tạo lại venv + backup: bash setup_venv.sh --force"
