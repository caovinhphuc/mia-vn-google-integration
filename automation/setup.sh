#!/bin/bash

# ONE System - Setup Script v2.1
# Cài đặt và cấu hình hệ thống automation chuẩn chỉnh
#
# Venv: mặc định giữ venv cũ, chỉ pip install (không backup).
#       Backup + tạo lại khi: ./setup.sh --force
#       hoặc khi Python trong venv khác major.minor so với Python script chọn (vd 3.11 vs 3.14).
#       Biến môi trường: AUTOMATION_SETUP_FORCE=1

FORCE_RECREATE=0
if [[ "${AUTOMATION_SETUP_FORCE:-}" == "1" || "${AUTOMATION_SETUP_FORCE:-}" == "true" ]]; then
  FORCE_RECREATE=1
fi
for _arg in "$@"; do
  case "$_arg" in
    --force|-f) FORCE_RECREATE=1 ;;
    --help|-h)
      echo "Usage: ./setup.sh [--force]"
      echo "  (default)  Giữ venv/, chỉ cài/cập nhật dependencies"
      echo "  --force    Backup venv/ rồi tạo lại bằng Python đã chọn"
      echo "  PYTHON_BIN=/path/to/python3.11  (tuỳ chọn) ép interpreter khi tạo venv"
      exit 0
      ;;
  esac
done
unset _arg

# Auto-grant execute permissions first
chmod +x setup.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                🚀 ONE SYSTEM SETUP v2.1                     ║${NC}"
echo -e "${CYAN}║           Automated Installation & Configuration             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Thư mục automation (dùng cho hướng dẫn cuối — chạy được từ root repo)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: System Requirements Check
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Python - Prefer Python 3.11 for compatibility with pydantic-core
PYTHON_CMD=""
if [ -n "${PYTHON_BIN:-}" ] && { [ -x "${PYTHON_BIN}" ] || command -v "${PYTHON_BIN}" &> /dev/null; }; then
    PYTHON_CMD="${PYTHON_BIN}"
    PYTHON_VERSION=$("${PYTHON_CMD}" --version 2>&1 | cut -d' ' -f2)
    if ! "${PYTHON_CMD}" -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
        echo -e "${RED}❌ PYTHON_BIN trỏ tới Python ≥3.14 — không dùng để tạo venv${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PYTHON_BIN: $PYTHON_VERSION ($PYTHON_CMD)${NC}"
elif command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
    PYTHON_VERSION=$(python3.11 --version 2>&1 | cut -d' ' -f2)
    echo -e "${GREEN}✅ Python3.11: $PYTHON_VERSION (Recommended)${NC}"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
    PYTHON_VERSION=$(python3.12 --version 2>&1 | cut -d' ' -f2)
    echo -e "${YELLOW}⚠️ Python3.12: $PYTHON_VERSION (Python 3.11 recommended for pydantic-core)${NC}"
elif command -v python3.13 &> /dev/null; then
    PYTHON_CMD="python3.13"
    PYTHON_VERSION=$(python3.13 --version 2>&1 | cut -d' ' -f2)
    echo -e "${YELLOW}⚠️ Python3.13: $PYTHON_VERSION (Python 3.11 recommended for pydantic-core)${NC}"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    if ! python3 -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
        echo -e "${RED}❌ python3 trên PATH là 3.14+ — không dùng để tạo venv automation${NC}"
        echo -e "${YELLOW}💡 brew install python@3.11 hoặc PYTHON_BIN=/opt/homebrew/opt/python@3.11/bin/python3.11 ./setup.sh${NC}"
        exit 1
    fi
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
        echo -e "${YELLOW}⚠️ Python3: $PYTHON_VERSION (Python 3.11 recommended for pydantic-core)${NC}"
    else
        echo -e "${RED}❌ Python3: $PYTHON_VERSION (Python 3.8+ required)${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Python3 not found!${NC}"
    echo -e "${YELLOW}💡 Please install Python3.11: brew install python@3.11${NC}"
    exit 1
fi

# Check Chrome/Chromium
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null || [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    echo -e "${GREEN}✅ Chrome/Chromium browser found${NC}"
else
    echo -e "${YELLOW}⚠️ Chrome/Chromium not found - WebDriver may fail${NC}"
fi

# Step 2: Virtual Environment Setup
echo -e "${BLUE}📦 Setting up virtual environment...${NC}"
if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    echo -e "${GREEN}✅ Virtual environment created with $PYTHON_CMD${NC}"
else
    echo -e "${YELLOW}⚠️ Virtual environment exists${NC}"
    EXISTING_MM=$(venv/bin/python -c 'import sys; print("%d.%d" % (sys.version_info.major, sys.version_info.minor))' 2>/dev/null || echo "")
    EXPECTED_MM=$($PYTHON_CMD -c 'import sys; print("%d.%d" % (sys.version_info.major, sys.version_info.minor))' 2>/dev/null || echo "")
    if [ "$FORCE_RECREATE" -eq 1 ]; then
        _ts=$(date +%Y%m%d_%H%M%S)
        echo -e "${BLUE}🔄 --force: backup venv → venv.backup.${_ts}${NC}"
        mv venv "venv.backup.${_ts}"
        $PYTHON_CMD -m venv venv
        echo -e "${GREEN}✅ New virtual environment created with $PYTHON_CMD${NC}"
    elif [ -n "$EXISTING_MM" ] && [ -n "$EXPECTED_MM" ] && [ "$EXISTING_MM" != "$EXPECTED_MM" ]; then
        echo -e "${YELLOW}⚠️ Venv Python ${EXISTING_MM} ≠ script chọn ${EXPECTED_MM} — cần venv mới cho wheel/binary tương thích${NC}"
        _ts=$(date +%Y%m%d_%H%M%S)
        echo -e "${BLUE}🔄 Backing up old venv → venv.backup.${_ts}${NC}"
        mv venv "venv.backup.${_ts}"
        $PYTHON_CMD -m venv venv
        echo -e "${GREEN}✅ New virtual environment created with $PYTHON_CMD${NC}"
    else
        EXISTING_FULL=$(venv/bin/python --version 2>&1 | cut -d' ' -f2)
        echo -e "${GREEN}✅ Using existing venv (Python ${EXISTING_FULL} — cùng nhánh ${EXPECTED_MM}.x, không backup)${NC}"
    fi
fi

# Step 3: Activate Virtual Environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

if [ "$VIRTUAL_ENV" != "" ]; then
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

# Step 4: Upgrade pip
echo -e "${BLUE}⬆️ Upgrading pip...${NC}"
pip install --upgrade pip -q

# Step 5: Install Dependencies
echo -e "${BLUE}📋 Installing dependencies...${NC}"

# Try to install from requirements-basic.txt first
if [ -f "requirements-basic.txt" ]; then
    echo -e "${YELLOW}📦 Installing from requirements-basic.txt...${NC}"

    if pip install -r requirements-basic.txt --upgrade; then
        echo -e "${GREEN}✅ Basic dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Error installing from requirements-basic.txt${NC}"
        echo -e "${YELLOW}🔧 Installing core packages manually...${NC}"
        pip install selenium webdriver-manager pandas requests python-dotenv openpyxl schedule loguru beautifulsoup4 lxml
    fi
elif [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}📦 Installing from requirements.txt...${NC}"
    pip install -r requirements.txt
else
    echo -e "${YELLOW}⚠️ No requirements file found${NC}"
    echo -e "${BLUE}📦 Installing essential packages...${NC}"
    pip install selenium webdriver-manager pandas requests python-dotenv openpyxl schedule loguru beautifulsoup4 lxml rich colorlog
fi

# Step 6: Verify Core Dependencies
echo -e "${BLUE}🔍 Verifying core dependencies...${NC}"

# List of packages to verify (using actual import names)
declare -A packages=(
    ["selenium"]="selenium"
    ["webdriver-manager"]="webdriver_manager"
    ["pandas"]="pandas"
    ["requests"]="requests"
    ["python-dotenv"]="dotenv"
    ["beautifulsoup4"]="bs4"
    ["lxml"]="lxml"
    ["openpyxl"]="openpyxl"
    ["schedule"]="schedule"
    ["loguru"]="loguru"
    ["rich"]="rich"
    ["colorlog"]="colorlog"
    ["gspread"]="gspread"
    ["google-auth"]="google.auth"
)

failed_packages=()
successful_packages=0

for package_name in "${!packages[@]}"; do
    import_name="${packages[$package_name]}"
    if python -c "import $import_name" 2>/dev/null; then
        echo -e "${GREEN}  ✅ $package_name${NC}"
        ((successful_packages++))
    else
        echo -e "${RED}  ❌ $package_name${NC}"
        failed_packages+=("$package_name")
    fi
done

echo -e "${CYAN}📊 Dependencies: ${successful_packages}/${#packages[@]} successful${NC}"

# Retry failed packages
if [ ${#failed_packages[@]} -gt 0 ]; then
    echo -e "${YELLOW}🔧 Retrying failed packages...${NC}"
    for package in "${failed_packages[@]}"; do
        echo -e "${YELLOW}   Installing $package...${NC}"
        pip install "$package" --upgrade
    done
fi

# Step 7: Project Structure Setup
echo -e "${BLUE}📁 Setting up project structure...${NC}"

# Create necessary directories
directories=("logs" "data" "config")
for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✅ Created: $dir/${NC}"
    else
        echo -e "${YELLOW}✓ Exists: $dir/${NC}"
    fi
done

# Check for main automation files
main_files=("one_automation.py" "automation.py" "system_check.py")
for file in "${main_files[@]}"; do
    if [ -f "$file" ]; then
        file_size=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}  ✅ $file ($file_size)${NC}"
else
        echo -e "${YELLOW}  ⚠️ $file not found${NC}"
fi
done

# Step 8: Environment Configuration
echo -e "${BLUE}⚙️ Environment configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}  ✅ .env file exists${NC}"
else
    echo -e "${YELLOW}  ⚠️ Creating .env template...${NC}"
    cat > .env.example << 'EOF'
# ONE System Environment Configuration
# Copy this file to .env and configure

# System Settings
DEBUG=true
HEADLESS=true

# Browser Settings
BROWSER_TIMEOUT=15
PAGE_LOAD_TIMEOUT=15

# Automation Settings
AUTOMATION_DELAY=1
MAX_RETRIES=3

# Logging
LOG_LEVEL=INFO
EOF
    echo -e "${CYAN}📝 Created .env.example - copy to .env and configure${NC}"
fi

# Step 9: Permissions Setup
echo -e "${BLUE}🔑 Setting permissions...${NC}"
find . -name "*.sh" -exec chmod +x {} \;
echo -e "${GREEN}✅ Execute permissions set for shell scripts${NC}"

# Step 10: System Test
echo -e "${BLUE}⚡ Running system health check...${NC}"
if venv/bin/python setup.py > /dev/null 2>&1; then
    echo -e "${GREEN}✅ System setup test passed${NC}"
else
    echo -e "${YELLOW}⚠️ System test warnings (run 'python setup.py' for details)${NC}"
fi

# Step 11: Final Summary
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    📊 SETUP SUMMARY                         ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║ Python: $PYTHON_VERSION                                         ║${NC}"
echo -e "${CYAN}║ Virtual Environment: ✅ Active                               ║${NC}"
echo -e "${CYAN}║ Dependencies: ${successful_packages}/${#packages[@]} packages verified                        ║${NC}"
echo -e "${CYAN}║ Project Structure: ✅ Complete                               ║${NC}"
echo -e "${CYAN}║ Status: Ready for automation                                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${GREEN}🎉 ONE SYSTEM SETUP COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps (shell của bạn có thể vẫn ở repo root — dùng khối bên dưới):${NC}"
echo -e "${BLUE}  1. Configure:${NC}"
echo -e "     cd \"${SCRIPT_DIR}\" && cp .env.example .env && nano .env"
echo -e "${BLUE}  2. Test setup:${NC}"
echo -e "     cd \"${SCRIPT_DIR}\" && source venv/bin/activate && python setup.py"
echo -e "${BLUE}  3. Run automation:${NC}"
echo -e "     cd \"${SCRIPT_DIR}\" && source venv/bin/activate && python one_automation.py"
echo -e "${BLUE}  4. Check logs:${NC}"
echo -e "     tail -f \"${SCRIPT_DIR}/logs/automation.log\""

echo ""
echo -e "${CYAN}🔧 Maintenance (từ root repo hoặc bất kỳ đâu):${NC}"
echo -e "${PURPLE}  bash \"${SCRIPT_DIR}/setup.sh\"${NC}          ${CYAN}# hoặc: npm run setup:automation${NC}"
echo -e "${PURPLE}  cd \"${SCRIPT_DIR}\" && ./setup.sh --force${NC}   ${CYAN}# backup venv + tạo lại${NC}"
echo -e "${PURPLE}  source \"${SCRIPT_DIR}/venv/bin/activate\"${NC}   ${CYAN}# kích hoạt venv${NC}"
echo -e "${PURPLE}  deactivate${NC}                             ${CYAN}# thoát venv${NC}"

echo ""
echo -e "${GREEN}✨ System ready for ONE automation tasks!${NC}"
