#!/bin/bash

# 🚀 Script Cài đặt / Cập nhật IDE cho react-oas-inntegration-x
# Hỗ trợ VS Code và Cursor trên Mac

set -e

# Tìm project root (thư mục chứa package.json) và chuyển vào đó
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
while [ -n "$PROJECT_ROOT" ] && [ ! -f "$PROJECT_ROOT/package.json" ]; do
    [ "$PROJECT_ROOT" = "$(dirname "$PROJECT_ROOT")" ] && break
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done
if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
    echo "Không tìm thấy package.json. Chạy từ thư mục gốc project."
    exit 1
fi
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_NAME="react-oas-inntegration-x"
WORKSPACE_FILE="React-OAS-Integration-v4.0.code-workspace"

echo -e "${BLUE}🚀 Cài đặt / Cập nhật Cấu hình IDE — ${PROJECT_NAME}${NC}"
echo "=================================================="
echo ""

# Tạo/Cập nhật cấu hình IDE cơ bản nếu thiếu
echo -e "${BLUE}🛠️  Đồng bộ Cấu hình IDE...${NC}"

mkdir -p .vscode .cursor

if [ ! -f ".vscode/settings.json" ]; then
    if [ -f ".cursor/settings.json" ]; then
        cp .cursor/settings.json .vscode/settings.json
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/settings.json từ .cursor/settings.json"
    else
        cat > .vscode/settings.json << 'EOF'
{}
EOF
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/settings.json mặc định"
    fi
fi

if [ ! -f ".vscode/extensions.json" ]; then
    if [ -f ".cursor/extensions.json" ]; then
        cp .cursor/extensions.json .vscode/extensions.json
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/extensions.json từ .cursor/extensions.json"
    else
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": []
}
EOF
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/extensions.json mặc định"
    fi
fi

echo ""

# Kiểm tra VS Code
if command -v code &> /dev/null; then
    echo -e "${GREEN}✅ VS Code đã được cài đặt${NC}"
    VS_CODE_VERSION=$(code --version | head -n 1)
    echo "   Phiên bản: $VS_CODE_VERSION"
else
    echo -e "${YELLOW}⚠️  VS Code chưa được cài đặt${NC}"
    echo "   Tải về tại: https://code.visualstudio.com/"
fi

echo ""

# Kiểm tra Cursor
if command -v cursor &> /dev/null; then
    echo -e "${GREEN}✅ Cursor đã được cài đặt${NC}"
    CURSOR_VERSION=$(cursor --version 2>/dev/null || echo "installed")
    echo "   Phiên bản: $CURSOR_VERSION"
else
    echo -e "${YELLOW}⚠️  Cursor chưa được cài đặt${NC}"
    echo "   Tải về tại: https://cursor.sh/"
fi

echo ""
echo "=================================================="
echo ""

# Cài đặt VS Code Extensions
if command -v code &> /dev/null; then
    echo -e "${BLUE}📦 Cài đặt VS Code Extensions...${NC}"

    INSTALLED_EXTENSIONS=$(code --list-extensions 2>/dev/null || true)

    EXTENSIONS=(
        "esbenp.prettier-vscode"
        "dbaeumer.vscode-eslint"
        "eamodio.gitlens"
        "ms-vscode.vscode-typescript-next"
        "bradlc.vscode-tailwindcss"
        "ms-python.python"
        "ms-toolsai.jupyter"
        "Prisma.prisma"
        "GraphQL.vscode-graphql"
        "pkief.material-icon-theme"
        "styled-components.vscode-styled-components"
        "csstools.postcss"
        "formulahendry.code-runner"
        "ms-python.black-formatter"
        "ms-python.flake8"
        "ms-python.isort"
    )

    INSTALLED=0
    SKIPPED=0

    for ext in "${EXTENSIONS[@]}"; do
        if printf '%s\n' "$INSTALLED_EXTENSIONS" | grep -Fxq "$ext"; then
            echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
            ((SKIPPED++))
        else
            echo -e "   ${YELLOW}→${NC} Đang cài $ext..."
            if code --install-extension "$ext" &> /dev/null; then
                echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
                INSTALLED_EXTENSIONS=$(printf '%s\n%s\n' "$INSTALLED_EXTENSIONS" "$ext")
                ((INSTALLED++))
            else
                echo -e "   ${RED}✗${NC} $ext (lỗi)"
            fi
        fi
    done

    echo ""
    echo -e "${GREEN}✅ Đã cài: $INSTALLED extensions${NC}"
    echo -e "${BLUE}ℹ️  Đã có: $SKIPPED extensions${NC}"
    echo ""
fi

# Kiểm tra Python
echo -e "${BLUE}🐍 Kiểm tra Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
    echo "   Path: $(which python3)"

    # Chuẩn bị môi trường Python cho automation
    echo -e "${BLUE}🧪 Chuẩn bị Python env cho Automation...${NC}"
    AUTOMATION_DIR="one_automation_system"
    AUTOMATION_VENV="$AUTOMATION_DIR/venv"
    MINIMAL_REQUIREMENTS="$AUTOMATION_DIR/requirements-minimal.txt"

    if [ -d "$AUTOMATION_DIR" ]; then
        if [ ! -d "$AUTOMATION_VENV" ]; then
            echo -e "   ${YELLOW}→${NC} Tạo virtual environment tại $AUTOMATION_VENV..."
            python3 -m venv "$AUTOMATION_VENV"
            echo -e "   ${GREEN}✓${NC} Đã tạo virtual environment"
        else
            echo -e "   ${GREEN}✓${NC} Đã có virtual environment"
        fi

        # shellcheck disable=SC1091
        source "$AUTOMATION_VENV/bin/activate"

        if ! pip install --upgrade pip &> /dev/null; then
            echo -e "   ${YELLOW}⚠️${NC} Không thể nâng cấp pip (tiếp tục)"
        fi

        if [ -f "$MINIMAL_REQUIREMENTS" ]; then
            echo -e "   ${YELLOW}→${NC} Cài dependencies tối thiểu từ $MINIMAL_REQUIREMENTS..."
            if pip install -r "$MINIMAL_REQUIREMENTS" &> /dev/null; then
                echo -e "   ${GREEN}✓${NC} Đã cài dependencies tối thiểu"
            else
                echo -e "   ${YELLOW}⚠️${NC} Cài requirements-minimal thất bại, cài gói cốt lõi..."
                pip install uvicorn fastapi python-dotenv gspread google-auth google-auth-oauthlib google-auth-httplib2 pandas numpy openpyxl &> /dev/null || true
            fi
        else
            echo -e "   ${YELLOW}→${NC} Không thấy requirements-minimal, cài gói cốt lõi..."
            pip install uvicorn fastapi python-dotenv gspread google-auth google-auth-oauthlib google-auth-httplib2 pandas numpy openpyxl &> /dev/null || true
        fi

        deactivate 2>/dev/null || true
        echo -e "   ${GREEN}✓${NC} Python env automation đã sẵn sàng"
    else
        echo -e "   ${YELLOW}⚠️${NC} Không tìm thấy thư mục $AUTOMATION_DIR, bỏ qua"
    fi
else
    echo -e "${RED}✗ Python3 chưa được cài đặt${NC}"
    echo "   Cài đặt: brew install python3"
fi

echo ""

# Kiểm tra Node.js & .nvmrc
echo -e "${BLUE}📦 Kiểm tra Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
    echo "   Path: $(which node)"

    if [ -f ".nvmrc" ]; then
        NVMRC_VERSION=$(cat .nvmrc | tr -d '[:space:]')
        echo -e "   ${CYAN}ℹ️  .nvmrc: Node $NVMRC_VERSION (chạy \`nvm use\` để đồng bộ)${NC}"
    fi

    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"
    fi
else
    echo -e "${RED}✗ Node.js chưa được cài đặt${NC}"
    echo "   Cài đặt: brew install node hoặc nvm install"
fi

echo ""

# Kiểm tra Shell
echo -e "${BLUE}🐚 Kiểm tra Shell...${NC}"
CURRENT_SHELL=$(echo $SHELL)
echo "   Shell hiện tại: $CURRENT_SHELL"

if [[ "$CURRENT_SHELL" == *"zsh"* ]]; then
    echo -e "${GREEN}✅ Đang sử dụng zsh${NC}"
else
    echo -e "${YELLOW}⚠️  Khuyến nghị sử dụng zsh${NC}"
    echo "   Đổi sang zsh: chsh -s /bin/zsh"
fi

echo ""

# Kiểm tra cấu trúc thư mục
echo -e "${BLUE}📁 Kiểm tra Cấu trúc Thư mục...${NC}"

REQUIRED_DIRS=(
    ".vscode"
    ".cursor"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir/${NC}"
    else
        echo -e "${RED}✗ $dir/ (thiếu)${NC}"
    fi
done

REQUIRED_FILES=(
    ".vscode/settings.json"
    ".vscode/extensions.json"
    ".cursor/settings.json"
    ".cursor/extensions.json"
    ".editorconfig"
    "$WORKSPACE_FILE"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}✗ $file (thiếu)${NC}"
    fi
done

echo ""
echo "=================================================="
echo ""

# Hướng dẫn mở workspace
echo -e "${GREEN}🎯 Hướng dẫn Mở Workspace:${NC}"
echo ""

if command -v code &> /dev/null; then
    echo -e "${BLUE}VS Code:${NC}"
    echo "  code $WORKSPACE_FILE"
    echo "  hoặc: code ."
    echo ""
fi

if command -v cursor &> /dev/null; then
    echo -e "${BLUE}Cursor:${NC}"
    echo "  cursor $WORKSPACE_FILE"
    echo "  hoặc: cursor ."
    echo ""
fi

echo "=================================================="
echo -e "${GREEN}✨ Hoàn tất!${NC}"
echo ""
echo "📚 Cài đặt lại môi trường: ENV_SETUP.md"
echo "   Kiểm tra nhanh: npm run tools:check && npm run verify:setup"
echo ""
