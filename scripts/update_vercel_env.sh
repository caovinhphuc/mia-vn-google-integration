#!/bin/bash

# =============================================================================
# Update Vercel Environment Variables - React OAS Integration
# Chạy từ root repo: bash scripts/update_vercel_env.sh [project-name] [environment]
# =============================================================================

set -e

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Backend production (khớp src/utils/apiBase.js)
readonly DEFAULT_RAILWAY_API='https://react-oas-integration-backend-production.up.railway.app'

# Load .env từ root project (trước đây ../.env sai khi CWD = repo root)
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env"
  set +a
fi
if [ -f "$PROJECT_ROOT/.env.production" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env.production"
  set +a
fi

# Mặc định production: Railway (không dùng localhost trên Vercel)
REACT_APP_API_URL=${REACT_APP_API_URL:-$DEFAULT_RAILWAY_API}
REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL:-$DEFAULT_RAILWAY_API/api}
# Socket.IO (LiveDashboard…): mặc định = API URL (https, không dùng wss:// cho io())
REACT_APP_WS_URL=${REACT_APP_WS_URL:-$REACT_APP_API_URL}
# AI (FastAPI): chỉ đẩy lên Vercel nếu có URL public (không phải localhost)
if [[ "${REACT_APP_AI_SERVICE_URL:-}" =~ localhost ]] || [[ -z "${REACT_APP_AI_SERVICE_URL:-}" ]]; then
  REACT_APP_AI_SERVICE_URL=""
fi

REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=${REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID:-${REACT_APP_GOOGLE_SHEET_ID:-${GOOGLE_SHEETS_ID:-18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As}}}
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=${REACT_APP_GOOGLE_DRIVE_FOLDER_ID:-${GOOGLE_DRIVE_FOLDER_ID:-}}

# Project: link Vercel thực tế (có thể override tham số 1)
PROJECT_NAME=${1:-"oas-integration"}
ENVIRONMENT=${2:-"production"}

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        Update Vercel Environment Variables                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Project root:${NC} $PROJECT_ROOT"
echo -e "${YELLOW}📋 Sẽ ghi lên Vercel (env: $ENVIRONMENT):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Project (CLI link):${NC} $PROJECT_NAME"
echo ""
echo "  REACT_APP_API_URL = $REACT_APP_API_URL"
echo "  REACT_APP_API_BASE_URL = $REACT_APP_API_BASE_URL"
echo "  REACT_APP_WS_URL = $REACT_APP_WS_URL"
if [ -n "$REACT_APP_AI_SERVICE_URL" ]; then
  echo "  REACT_APP_AI_SERVICE_URL = $REACT_APP_AI_SERVICE_URL"
else
  echo "  REACT_APP_AI_SERVICE_URL = (bỏ qua — set URL public AI trong .env rồi chạy lại)"
fi
echo "  REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID = $REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID"
if [ -n "$REACT_APP_GOOGLE_DRIVE_FOLDER_ID" ]; then
  echo "  REACT_APP_GOOGLE_DRIVE_FOLDER_ID = $REACT_APP_GOOGLE_DRIVE_FOLDER_ID"
fi
echo ""

update_env_var() {
  local var_name=$1
  local var_value=$2
  local env_type=$3

  echo -e "${BLUE}Updating $var_name...${NC}"
  vercel env rm "$var_name" "$env_type" -y 2>/dev/null || true
  echo "$var_value" | vercel env add "$var_name" "$env_type" --force

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $var_name${NC}"
  else
    echo -e "${RED}❌ $var_name${NC}"
    return 1
  fi
}

if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Cài Vercel CLI: npm i -g vercel${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Vercel CLI OK${NC}"
echo -e "${YELLOW}💡 Đảm bảo đã: cd $PROJECT_ROOT && npx vercel link${NC}"
echo ""

read -p "Cập nhật env trên Vercel? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Đã hủy.${NC}"
  exit 0
fi

echo ""
echo -e "${CYAN}🔧 Đang cập nhật...${NC}"
echo ""

update_env_var "REACT_APP_API_URL" "$REACT_APP_API_URL" "$ENVIRONMENT"
update_env_var "REACT_APP_API_BASE_URL" "$REACT_APP_API_BASE_URL" "$ENVIRONMENT"
update_env_var "REACT_APP_WS_URL" "$REACT_APP_WS_URL" "$ENVIRONMENT"
if [ -n "$REACT_APP_AI_SERVICE_URL" ]; then
  update_env_var "REACT_APP_AI_SERVICE_URL" "$REACT_APP_AI_SERVICE_URL" "$ENVIRONMENT"
fi
update_env_var "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID" "$REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID" "$ENVIRONMENT"
if [ -n "$REACT_APP_GOOGLE_DRIVE_FOLDER_ID" ]; then
  update_env_var "REACT_APP_GOOGLE_DRIVE_FOLDER_ID" "$REACT_APP_GOOGLE_DRIVE_FOLDER_ID" "$ENVIRONMENT"
fi

echo ""
echo -e "${GREEN}✅ Đã cập nhật env.${NC}"
echo ""

read -p "Redeploy production ngay? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${CYAN}🚀 vercel --prod${NC}"
  npx vercel --prod --yes
else
  echo -e "${YELLOW}Nhớ redeploy: npx vercel --prod hoặc Dashboard → Redeploy${NC}"
fi

echo ""
echo -e "${BLUE}Kiểm tra:${NC} vercel env ls"
echo -e "${BLUE}Health API:${NC} curl -sS ${DEFAULT_RAILWAY_API}/health"
echo ""
