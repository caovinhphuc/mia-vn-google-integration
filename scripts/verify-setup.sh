#!/bin/bash
# Verify setup and check if scripts are available

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 Verifying Setup${NC}"
echo "=================="
echo ""

# Check current directory (workspace root = folder chứa package.json)
CURRENT_DIR=$(pwd)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-.}")/.." && pwd)"

echo -e "${BLUE}Current directory:${NC}"
echo "  $CURRENT_DIR"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ package.json not found!${NC}"
  echo ""
  echo -e "${YELLOW}💡 Solution:${NC}"
  echo "  1. Mở terminal tại workspace root (thư mục chứa package.json):"
  echo -e "     ${CYAN}cd \"$PROJECT_ROOT\"${NC}"
  echo ""
  echo "  2. Hoặc từ Cursor: Terminal → New Terminal (mặc định mở tại workspaceFolder)"
  exit 1
fi

echo -e "${GREEN}✅ package.json found${NC}"
echo ""

# Check for required scripts
echo -e "${BLUE}Checking npm scripts...${NC}"

REQUIRED_SCRIPTS=(
  "test:websocket"
  "check:backend"
  "fix:ports"
  "check:ports"
)

MISSING_SCRIPTS=()

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if npm run 2>/dev/null | grep -q "$script"; then
    echo -e "  ${GREEN}✅${NC} $script"
  else
    echo -e "  ${RED}❌${NC} $script (missing)"
    MISSING_SCRIPTS+=("$script")
  fi
done

echo ""

if [ ${#MISSING_SCRIPTS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Some scripts are missing!${NC}"
  echo ""
  echo -e "${YELLOW}💡 Solutions:${NC}"
  echo "  1. Đảm bảo đang ở workspace root:"
  echo -e "     ${CYAN}cd \"$PROJECT_ROOT\"${NC}"
  echo ""
  echo "  2. Kiểm tra package.json có scripts:"
  echo -e "     ${CYAN}grep -E 'test:websocket|check:backend' package.json${NC}"
  echo ""
  echo "  3. Cài lại dependencies:"
  echo -e "     ${CYAN}npm install && npm run verify:setup${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All required scripts are available!${NC}"
  echo ""
  echo -e "${CYAN}📋 Quick Commands:${NC}"
  echo "  npm run test:websocket    - Test WebSocket connection"
  echo "  npm run check:backend     - Check backend server"
  echo "  npm run check:ports       - Check port status"
  echo "  npm run fix:ports         - Fix port conflicts"
  echo ""
  exit 0
fi

