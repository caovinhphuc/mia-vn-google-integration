#!/bin/bash

# 🧪 Test All Scripts Script
# Test tất cả scripts (.sh và .py) để đảm bảo chúng chạy đúng

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts/utils → repo root = 2 cấp (không dùng ../../.. — sẽ quét nhầm cả thư mục cha)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================================================================${NC}"
    echo -e "${BLUE}🧪 Testing All Scripts${NC}"
    echo -e "${BLUE}================================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Counters
TOTAL_SH=0
PASSED_SH=0
FAILED_SH=0
TOTAL_PY=0
PASSED_PY=0
FAILED_PY=0

print_header

# Test Shell Scripts
echo -e "${BLUE}📜 Testing Shell Scripts (.sh)${NC}"
echo -e "${BLUE}--------------------------------------------------------------------------------${NC}"

while IFS= read -r -d '' file; do
    TOTAL_SH=$((TOTAL_SH + 1))
    filename=$(basename "$file")

    # Check syntax
    if bash -n "$file" 2>/dev/null; then
        # Check if executable
        if [ -x "$file" ]; then
            print_success "$filename - Syntax OK, Executable"
            PASSED_SH=$((PASSED_SH + 1))
        else
            print_warning "$filename - Syntax OK, but not executable"
            chmod +x "$file" 2>/dev/null && print_info "  → Made executable"
            PASSED_SH=$((PASSED_SH + 1))
        fi
    else
        print_error "$filename - Syntax error"
        bash -n "$file" 2>&1 | head -3 | sed 's/^/    /'
        FAILED_SH=$((FAILED_SH + 1))
    fi
done < <(find . -name "*.sh" -type f \
    ! -path "*/node_modules/*" ! -path "*/.git/*" \
    ! -path "*/venv/*" ! -path "*/.venv/*" ! -path "*/ai-venv/*" \
    ! -path "*/venv.backup*/*" ! -path "*/site-packages/*" \
    ! -path "*/backups/*" \
    ! -path "./React-OAS-Integration-v4.0/*" \
    -print0)

echo ""

# Test Python Scripts
echo -e "${BLUE}🐍 Testing Python Scripts (.py)${NC}"
echo -e "${BLUE}$(printf '%*s' 80 '' | tr ' ' '-')${NC}"

while IFS= read -r -d '' file; do
    TOTAL_PY=$((TOTAL_PY + 1))
    filename=$(basename "$file")

    # Check syntax
    if python3 -m py_compile "$file" 2>/dev/null; then
        print_success "$filename - Syntax OK"
        PASSED_PY=$((PASSED_PY + 1))
        rm -f "${file}c" "__pycache__/$(basename "$file")c" 2>/dev/null
    else
        print_error "$filename - Syntax error"
        python3 -m py_compile "$file" 2>&1 | head -3 | sed 's/^/    /'
        FAILED_PY=$((FAILED_PY + 1))
    fi
done < <(find . -name "*.py" -type f \
    ! -path "*/node_modules/*" ! -path "*/.git/*" \
    ! -path "*/venv/*" ! -path "*/.venv/*" ! -path "*/ai-venv/*" \
    ! -path "*/venv.backup*/*" ! -path "*/site-packages/*" \
    ! -path "*/backups/*"     ! -path "*/__pycache__/*" \
    ! -path "./React-OAS-Integration-v4.0/*" \
    -print0)

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Shell Scripts Summary
echo -e "${BLUE}Shell Scripts:${NC}"
echo "  Total: $TOTAL_SH"
echo "  ✅ Passed: $PASSED_SH"
if [ $FAILED_SH -gt 0 ]; then
    echo -e "  ${RED}❌ Failed: $FAILED_SH${NC}"
else
    echo "  ❌ Failed: $FAILED_SH"
fi
echo ""

# Python Scripts Summary
echo -e "${BLUE}Python Scripts:${NC}"
echo "  Total: $TOTAL_PY"
echo "  ✅ Passed: $PASSED_PY"
if [ $FAILED_PY -gt 0 ]; then
    echo -e "  ${RED}❌ Failed: $FAILED_PY${NC}"
else
    echo "  ❌ Failed: $FAILED_PY"
fi
echo ""

# Overall
TOTAL=$((TOTAL_SH + TOTAL_PY))
PASSED=$((PASSED_SH + PASSED_PY))
FAILED=$((FAILED_SH + FAILED_PY))

echo -e "${BLUE}Overall:${NC}"
echo "  Total Scripts: $TOTAL"
echo "  ✅ Passed: $PASSED"
if [ $FAILED -gt 0 ]; then
    echo -e "  ${RED}❌ Failed: $FAILED${NC}"
    echo ""
    echo -e "${RED}⚠️  Some scripts have errors. Please fix them.${NC}"
    exit 1
else
    echo "  ❌ Failed: $FAILED"
    echo ""
    echo -e "${GREEN}✅ All scripts are valid!${NC}"
    exit 0
fi

