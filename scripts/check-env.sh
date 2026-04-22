#!/bin/bash

# 🔍 ENVIRONMENT VARIABLES CHECKER
# Local: load .env + backend/.env, chấp nhận CRA (REACT_APP_*) tương đương Vite (VITE_*).
# Google backend: GOOGLE_APPLICATION_CREDENTIALS / file mặc định HOẶC email + GOOGLE_PRIVATE_KEY.
# Deploy nghiêm: CHECK_ENV_STRICT=1 ./scripts/check-env.sh

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

STRICT="${CHECK_ENV_STRICT:-0}"
LIST_OPT="${CHECK_ENV_LIST_OPTIONAL:-0}"

print_header() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         🔍 ENVIRONMENT VARIABLES CHECKER                   ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    if [ "$STRICT" = "1" ]; then
        echo -e "${YELLOW}Mode: STRICT (Vercel Vite + Railway đầy đủ)${NC}"
    else
        echo -e "${BLUE}Mode: local/monorepo (CRA REACT_APP_*, file JSON Google, root .env) — CHECK_ENV_STRICT=1 deploy; CHECK_ENV_LIST_OPTIONAL=1 liệt kê từng biến tuỳ chọn${NC}"
    fi
    echo ""
}

print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
    echo -e "  ${BLUE}ℹ${NC}  $1"
}

# Nạp biến từ file .env (best-effort; PEM nhiều dòng cần format chuẩn cho bash)
load_env_file() {
    local f="$1"
    if [ ! -f "$f" ]; then
        return 0
    fi
    set -a
    # shellcheck disable=SC1090
    source "$f" 2>/dev/null || {
        set +a
        echo -e "  ${YELLOW}⚠️${NC}  Không source được $f (ký tự đặc biệt / PEM?). Thử sửa quoting hoặc chỉ dùng ASCII một dòng."
        return 0
    }
    set +a
}

check_var() {
    local var_name=$1
    local required=${2:-false}
    local value=${!var_name}

    if [ -z "$value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "  ${RED}❌${NC} ${var_name} ${RED}(REQUIRED - MISSING)${NC}"
            return 1
        else
            echo -e "  ${YELLOW}⚠️${NC}  ${var_name} ${YELLOW}(OPTIONAL - NOT SET)${NC}"
            return 0
        fi
    else
        if [[ "$var_name" == *"KEY"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"TOKEN"* ]] || [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"PRIVATE_KEY"* ]]; then
            local masked
            masked=$(echo "$value" | sed 's/./*/g' | head -c 20)
            echo -e "  ${GREEN}✅${NC} ${var_name} = ${masked}... ${GREEN}(SET)${NC}"
        else
            local short_value
            short_value=$(echo "$value" | head -c 50)
            echo -e "  ${GREEN}✅${NC} ${var_name} = ${short_value}... ${GREEN}(SET)${NC}"
        fi
        return 0
    fi
}

# Trả 0 nếu ít nhất một biến đã set (tên tham số sau $1)
check_any_set() {
    shift
    local n
    for n in "$@"; do
        if [ -n "${!n}" ]; then
            echo -e "  ${GREEN}✅${NC} $n ${GREEN}(SET — đủ nhóm)${NC}"
            return 0
        fi
    done
    return 1
}

check_env_file() {
    print_section "📁 Checking .env files"

    if [ -f ".env" ]; then
        echo -e "  ${GREEN}✅${NC} .env file exists (sẽ source vào checker)"
        load_env_file ".env"
    else
        echo -e "  ${YELLOW}⚠️${NC}  .env file not found"
    fi

    if [ -f "backend/.env" ]; then
        echo -e "  ${GREEN}✅${NC} backend/.env file exists (source sau .env gốc)"
        load_env_file "backend/.env"
    else
        echo -e "  ${YELLOW}⚠️${NC}  backend/.env file not found"
    fi
    echo ""
}

google_credentials_file_ok() {
    local p cred
    cred="${GOOGLE_APPLICATION_CREDENTIALS:-}"
    if [ -n "$cred" ]; then
        if [[ "$cred" = /* ]]; then
            p="$cred"
        else
            p="$PROJECT_ROOT/$cred"
        fi
        [ -f "$p" ] && return 0
    fi
    cred="${GOOGLE_SERVICE_ACCOUNT_KEY_PATH:-}"
    if [ -n "$cred" ]; then
        if [[ "$cred" = /* ]]; then
            p="$cred"
        else
            p="$PROJECT_ROOT/$cred"
        fi
        [ -f "$p" ] && return 0
    fi
    for rel in "config/google-credentials.json" "config/service_account.json" "automation/config/google-credentials.json" "automation/config/service_account.json"; do
        [ -f "$PROJECT_ROOT/$rel" ] && return 0
    done
    return 1
}

check_frontend_env() {
    print_section "🎨 FRONTEND (Vite / Vercel hoặc CRA local)"

    local missing=0

    if [ "$STRICT" = "1" ]; then
        check_var "VITE_API_URL" true || missing=$((missing + 1))
        check_var "VITE_GOOGLE_SHEETS_SPREADSHEET_ID" true || missing=$((missing + 1))
    else
        if check_any_set _ VITE_API_URL REACT_APP_API_URL REACT_APP_API_BASE_URL; then
            :
        else
            echo -e "  ${RED}❌${NC} API URL ${RED}(cần một trong: VITE_API_URL | REACT_APP_API_URL | REACT_APP_API_BASE_URL)${NC}"
            missing=$((missing + 1))
        fi
        if check_any_set _ VITE_GOOGLE_SHEETS_SPREADSHEET_ID REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID REACT_APP_GOOGLE_SHEET_ID GOOGLE_SHEETS_ID GOOGLE_SHEET_ID; then
            :
        else
            echo -e "  ${RED}❌${NC} Spreadsheet ID ${RED}(cần một trong: VITE_GOOGLE_* | REACT_APP_GOOGLE_SHEET* | GOOGLE_SHEETS_ID)${NC}"
            missing=$((missing + 1))
        fi
    fi

    # Drive / Apps Script / cờ Vite: CRA không dùng runtime Vite → không spam ⚠️ từng dòng
    local optional_fe=(
        VITE_GOOGLE_DRIVE_FOLDER_ID
        REACT_APP_GOOGLE_DRIVE_FOLDER_ID
        VITE_GOOGLE_APPS_SCRIPT_URL
        VITE_FEATURE_GOOGLE_SHEETS
        VITE_FEATURE_GOOGLE_DRIVE
    )
    if [ "$LIST_OPT" = "1" ]; then
        for v in "${optional_fe[@]}"; do
            check_var "$v" false
        done
    else
        local miss_fe=0
        for v in "${optional_fe[@]}"; do
            [ -z "${!v}" ] && miss_fe=$((miss_fe + 1))
        done
        if [ "$miss_fe" -gt 0 ]; then
            print_info "Vite/Drive/Apps Script (tuỳ chọn): chưa đặt ${miss_fe} trong ${#optional_fe[@]} biến — OK nếu chỉ dùng CRA + Sheets (CRA không đọc VITE_* lúc build). Chi tiết từng dòng: CHECK_ENV_LIST_OPTIONAL=1 $0"
        fi
    fi

    echo ""
    if [ $missing -gt 0 ]; then
        echo -e "${RED}❌ Missing $missing required frontend variable group(s)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Frontend: nhóm biến bắt buộc OK${NC}"
        return 0
    fi
}

check_backend_env() {
    print_section "⚙️  BACKEND (Railway hoặc local — server đọc root .env)"

    local missing=0

    # Google: inline PEM hoặc file JSON (khớp backend/src/server.js)
    if [ "$STRICT" = "1" ]; then
        check_var "GOOGLE_SERVICE_ACCOUNT_EMAIL" true || missing=$((missing + 1))
        check_var "GOOGLE_PRIVATE_KEY" true || missing=$((missing + 1))
    else
        if [ -n "${GOOGLE_SERVICE_ACCOUNT_EMAIL:-}" ] && [ -n "${GOOGLE_PRIVATE_KEY:-}" ]; then
            echo -e "  ${GREEN}✅${NC} Google: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY ${GREEN}(SET)${NC}"
        elif google_credentials_file_ok; then
            echo -e "  ${GREEN}✅${NC} Google: credentials file ${GREEN}(tìm thấy — GOOGLE_APPLICATION_CREDENTIALS hoặc path mặc định)${NC}"
        else
            echo -e "  ${RED}❌${NC} Google ${RED}(thiếu: cặp GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY HOẶC file JSON + GOOGLE_APPLICATION_CREDENTIALS / config/google-credentials.json…)${NC}"
            missing=$((missing + 1))
        fi
    fi

    if [ "$STRICT" = "1" ]; then
        check_var "JWT_SECRET" true || missing=$((missing + 1))
        check_var "SESSION_SECRET" true || missing=$((missing + 1))
    else
        check_var "JWT_SECRET" false
        check_var "SESSION_SECRET" false
    fi

    check_var "SENDGRID_API_KEY" false
    check_var "SENDGRID_FROM_EMAIL" false
    check_var "TELEGRAM_BOT_TOKEN" false
    check_var "CORS_ORIGIN" false
    check_var "PORT" false
    check_var "BACKEND_PORT" false
    check_var "NODE_ENV" false

    echo ""
    if [ $missing -gt 0 ]; then
        echo -e "${RED}❌ Missing $missing required backend group(s)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Backend: nhóm bắt buộc OK${NC}"
        return 0
    fi
}

main() {
    print_header

    check_env_file

    local frontend_ok=0
    local backend_ok=0

    check_frontend_env && frontend_ok=1
    echo ""
    check_backend_env && backend_ok=1
    echo ""

    print_section "📊 SUMMARY"

    if [ $frontend_ok -eq 1 ] && [ $backend_ok -eq 1 ]; then
        echo -e "${GREEN}✅ Kiểm tra env (theo mode hiện tại) OK.${NC}"
        [ "$STRICT" != "1" ] && echo -e "${BLUE}Deploy Vercel+Vite / Railway đầy đủ: CHECK_ENV_STRICT=1 $0${NC}"
        exit 0
    else
        echo -e "${RED}❌ Thiếu biến hoặc file credentials theo checklist trên.${NC}"
        echo -e "${YELLOW}⚠️  Bổ sung root .env (CRA) hoặc đặt GOOGLE_APPLICATION_CREDENTIALS trỏ file JSON.${NC}"
        echo ""
        echo -e "${CYAN}📖 DEPLOY_ENV_CHECKLIST.md | docs/GOOGLE_CREDENTIALS_SETUP.md${NC}"
        exit 1
    fi
}

main
