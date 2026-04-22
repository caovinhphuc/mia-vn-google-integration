#!/usr/bin/env bash
# Kiểm tra nhanh: CRA 3000, backend 3001, AI 8000 hoặc Automation 8001 (optional)
# Dùng: bash scripts/health-quick.sh   hoặc   npm run health:quick

set +e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

FRONTEND_URL="${HEALTH_QUICK_FRONTEND:-http://localhost:3000}"
BACKEND_URL="${HEALTH_QUICK_BACKEND_HEALTH:-http://localhost:3001/health}"
AI_URL="${HEALTH_QUICK_AI_HEALTH:-http://localhost:8000/health}"
AUTO_URL="${HEALTH_QUICK_AUTO_HEALTH:-http://localhost:8001/health}"

LINE="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

failed=0

# $1 icon+color $2 label $3 detail (dim)
line_ok() {
  printf "  ${GREEN}%s${NC} %-26s ${DIM}%s${NC}\n" "✔" "$1" "$2"
}

line_fail() {
  printf "  ${RED}%s${NC} %-26s ${RED}%s${NC}\n" "✘" "$1" "$2"
  failed=1
}

line_opt_off() {
  printf "  ${YELLOW}%s${NC} %-26s ${YELLOW}%s${NC}  ${DIM}%s${NC}\n" "○" "$1" "Tùy chọn — chưa chạy" "$2"
}

# Gọi HTTP; in code + thời gian (giây). Trả stdout: CODE|SECONDS
_curl_meta() {
  curl -sS -o /dev/null -w "%{http_code}|%{time_total}" --connect-timeout 2 --max-time 6 "$1" 2>/dev/null || echo "000|0"
}

probe() {
  local label="$1" url="$2" required="$3"
  local meta code sec ms
  meta=$(_curl_meta "$url")
  code="${meta%%|*}"
  sec="${meta##*|}"
  ms=$(awk -v s="$sec" 'BEGIN { printf "%.0f", s * 1000 }')

  if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
    line_ok "$label" "$url  ·  ${code}  ·  ${ms}ms"
    return 0
  fi
  if [[ "$required" == "1" ]]; then
    if [[ "$code" == "000" ]]; then
      line_fail "$label" "Không kết nối được · $url"
    else
      line_fail "$label" "HTTP $code · $url"
    fi
    return 1
  fi
  line_opt_off "$label" "$url"
  return 1
}

echo ""
echo -e "${CYAN}${BOLD}⚡ Health quick${NC}"
echo -e "${DIM}   Frontend · Backend · (AI 8000 hoặc Automation 8001)${NC}"
echo -e "${BLUE}${LINE}${NC}"
echo ""

probe "Frontend (CRA)" "$FRONTEND_URL" 1 || true
probe "Backend API" "$BACKEND_URL" 1 || true

echo ""
echo -e "${DIM}${BOLD}Dịch vụ Python (một trong hai là đủ)${NC}"

ai_ok=0
meta=$(_curl_meta "$AI_URL")
if [[ "${meta%%|*}" =~ ^2[0-9][0-9]$ ]]; then
  sec="${meta##*|}"
  ms=$(awk -v s="$sec" 'BEGIN { printf "%.0f", s * 1000 }')
  line_ok "AI Service (:8000)" "$AI_URL  ·  ${meta%%|*}  ·  ${ms}ms"
  ai_ok=1
else
  line_opt_off "AI Service (:8000)" "$AI_URL"
fi

auto_ok=0
meta=$(_curl_meta "$AUTO_URL")
if [[ "${meta%%|*}" =~ ^2[0-9][0-9]$ ]]; then
  sec="${meta##*|}"
  ms=$(awk -v s="$sec" 'BEGIN { printf "%.0f", s * 1000 }')
  line_ok "Automation (:8001)" "$AUTO_URL  ·  ${meta%%|*}  ·  ${ms}ms"
  auto_ok=1
else
  line_opt_off "Automation (:8001)" "$AUTO_URL"
fi

echo ""
echo -e "${BLUE}${LINE}${NC}"

if [[ "$failed" -eq 1 ]]; then
  echo -e "  ${RED}${BOLD}❌ Core down${NC}  ${DIM}— bật npm run dev / npm run start + npm run backend${NC}"
  echo ""
  exit 1
fi

if [[ "$ai_ok" -eq 1 && "$auto_ok" -eq 1 ]]; then
  echo -e "  ${GREEN}${BOLD}✅ Core OK${NC}  ${DIM}+${NC} ${GREEN}AI (8000)${NC} ${DIM}+${NC} ${GREEN}Automation (8001)${NC}"
elif [[ "$ai_ok" -eq 1 ]]; then
  echo -e "  ${GREEN}${BOLD}✅ Core OK${NC}  ${DIM}+${NC} ${GREEN}AI (8000)${NC}"
elif [[ "$auto_ok" -eq 1 ]]; then
  echo -e "  ${GREEN}${BOLD}✅ Core OK${NC}  ${DIM}+${NC} ${GREEN}Automation (8001)${NC}"
else
  echo -e "  ${GREEN}${BOLD}✅ Core OK${NC}  ${YELLOW}· AI 8000 & Automation 8001 đều tắt (optional)${NC}"
fi

echo ""
echo -e "${DIM}Gợi ý: npm run health-check · npm run health:full${NC}"
echo ""
exit 0
