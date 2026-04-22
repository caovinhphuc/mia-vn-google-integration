#!/bin/bash
# 🔍 Google Sheets — test kiểu ?key=API_KEY (client / Sheet public)
# Repo MIA thường dùng Service Account JSON; khi không có API key nhưng có SA → thoát 0 + hướng dẫn.
# Chạy từ bất kỳ đâu: ./scripts/test-api-key.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || exit 1

echo "🔍 Testing Google Sheets API Key (query ?key= — public / restriction đúng)…"
echo "📂 Repo root: $REPO_ROOT"

_env_line_from_file() {
  local key="$1" file="$2"
  grep -E "^[[:space:]]*${key}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//'
}

# Cùng thứ tự merge nhẹ: .env → backend → automation → .env.local (sau ghi đè)
_resolve_env_key_last_wins() {
  local key="$1" v="" f
  for f in ".env" "backend/.env" "automation/.env" ".env.local"; do
    [ -f "$f" ] || continue
    local t
    t=$(_env_line_from_file "$key" "$f")
    [ -n "$t" ] && v="$t"
  done
  printf '%s' "$v"
}

_is_placeholder_api_key() {
  local v="$1"
  case "$v" in
  "" | your-google-sheets-api-key-here | your_new_api_key_here | your-api-key-here) return 0 ;;
  esac
  [[ "$v" =~ ^your_ ]] && return 0
  return 1
}

_is_placeholder_sheet_id() {
  local v="$1" u
  u=$(printf '%s' "$v" | tr '[:lower:]' '[:upper:]')
  case "$u" in
  "" | YOUR_SHEET_ID | YOUR_SPREADSHEET_ID) return 0 ;;
  esac
  [[ "$v" =~ [Yy][Oo][Uu][Rr][_-] ]] && return 0
  return 1
}

_first_api_key() {
  local k v
  for k in REACT_APP_GOOGLE_SHEETS_API_KEY VITE_GOOGLE_SHEETS_API_KEY GOOGLE_SHEETS_API_KEY \
    REACT_APP_GOOGLE_API_KEY GOOGLE_API_KEY GOOGLE_CLOUD_API_KEY; do
    v=$(_resolve_env_key_last_wins "$k")
    if [ -n "$v" ] && ! _is_placeholder_api_key "$v"; then
      printf '%s' "$v"
      return 0
    fi
  done
  printf ''
}

_first_sheet_id() {
  local k v
  for k in REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID REACT_APP_GOOGLE_SHEETS_ID REACT_APP_GOOGLE_SHEET_ID \
    GOOGLE_SHEETS_ID GOOGLE_SHEET_ID VITE_GOOGLE_SHEETS_SPREADSHEET_ID; do
    v=$(_resolve_env_key_last_wins "$k")
    if [ -n "$v" ] && ! _is_placeholder_sheet_id "$v"; then
      printf '%s' "$v"
      return 0
    fi
  done
  printf ''
}

_service_account_json_present() {
  local p
  for p in "config/service_account.json" "config/google-credentials.json" \
    "automation/config/service_account.json" "automation/config/google-credentials.json"; do
    [ -f "$REPO_ROOT/$p" ] && return 0
  done
  local cred
  cred=$(_resolve_env_key_last_wins "GOOGLE_APPLICATION_CREDENTIALS")
  cred=${cred:-$(_resolve_env_key_last_wins "GOOGLE_SERVICE_ACCOUNT_KEY_PATH")}
  cred=${cred:-$(_resolve_env_key_last_wins "GOOGLE_CREDENTIALS_PATH")}
  if [ -n "$cred" ]; then
    local abs
    if [[ "$cred" = /* ]]; then
      abs="$cred"
    else
      abs="$REPO_ROOT/$cred"
    fi
    [ -f "$abs" ] && return 0
  fi
  return 1
}

if [ ! -f ".env" ] && [ ! -f "automation/.env" ] && [ ! -f "backend/.env" ]; then
  echo "❌ Chưa thấy .env (root / backend / automation)."
  echo "💡 cp .env.example .env && điền biến"
  exit 1
fi

echo "📋 Checking configuration..."

API_KEY="$(_first_api_key)"
SHEET_ID="$(_first_sheet_id)"

if [ -z "$API_KEY" ]; then
  if _service_account_json_present; then
    echo "ℹ️  Không có API key Sheets (?key=) — bình thường nếu backend chỉ dùng Service Account (JSON)."
    echo "✅ Test Sheets + Drive + Script (OAuth/SA):"
    echo "   node scripts/test-google-apis-simple.js"
    echo ""
    echo "📖 Nếu cần API key cho client / Sheet public:"
    echo "   REACT_APP_GOOGLE_SHEETS_API_KEY hoặc REACT_APP_GOOGLE_API_KEY — GOOGLE_CLOUD_API_KEY_GUIDE.md"
    exit 0
  fi
  echo "❌ Chưa có API key (REACT_APP_GOOGLE_SHEETS_API_KEY, GOOGLE_API_KEY, …) và chưa thấy file SA JSON."
  echo "💡 Một trong hai:"
  echo "   • Service Account: đặt config/service_account.json hoặc GOOGLE_APPLICATION_CREDENTIALS trong .env"
  echo "   • Hoặc API key: REACT_APP_GOOGLE_SHEETS_API_KEY — GOOGLE_CLOUD_API_KEY_GUIDE.md"
  exit 1
fi

if [ -z "$SHEET_ID" ]; then
  echo "❌ Sheet ID chưa được cấu hình (hợp lệ)!"
  echo "💡 Đặt GOOGLE_SHEETS_ID hoặc REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID (ID trong URL /d/<id>/edit)"
  echo "📖 shared-md/GOOGLE_SHEETS_SETUP_GUIDE.md"
  exit 1
fi

echo "✅ API Key: ${API_KEY:0:12}…"
echo "✅ Sheet ID: ${SHEET_ID:0:12}…"

echo ""
echo "🧪 Testing API key with Google Sheets API..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}")

case $RESPONSE in
200)
  echo "✅ SUCCESS: API key và Sheet ID đều hợp lệ!"
  echo "🎉 Có thể dùng cho client đọc Sheet public (theo restriction key)."
  ;;
400)
  echo "❌ BAD REQUEST: Có lỗi trong request"
  echo "💡 Kiểm tra lại Sheet ID và API key"
  ;;
403)
  echo "❌ FORBIDDEN: API key không có quyền truy cập"
  echo "💡 API key: bật Google Sheets API + restriction (HTTP referrer / IP) khớp môi trường"
  echo "💡 Sheet: với ?key= thường cần quyền Anyone with link / public"
  ;;
404)
  echo "❌ NOT FOUND: Sheet không tồn tại hoặc không accessible với API key"
  echo "💡 Sai ID hoặc Sheet private — thử Service Account + share email SA"
  ;;
*)
  echo "❌ ERROR: HTTP $RESPONSE"
  echo "💡 Network / quota hoặc key không hợp lệ"
  ;;
esac

echo ""
echo "📖 Tham khảo:"
echo "   GOOGLE_CLOUD_API_KEY_GUIDE.md"
echo "   node scripts/test-google-apis-simple.js  (Service Account)"
