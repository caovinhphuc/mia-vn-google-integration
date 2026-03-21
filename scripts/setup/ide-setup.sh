#!/bin/bash

# 🚀 Script Cài đặt / Cập nhật IDE cho react-oas-inntegration-x
# Hỗ trợ VS Code và Cursor trên Mac

set -e

# Tìm project root (thư mục chứa package.json)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
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
# Ưu tiên workspace mới; fallback về legacy
WORKSPACE_PRIMARY="react-oas-integration.code-workspace"
WORKSPACE_LEGACY="React-OAS-Integration-v4.0.code-workspace"
WORKSPACE_FILE="$([ -f "$WORKSPACE_PRIMARY" ] && echo "$WORKSPACE_PRIMARY" || echo "$WORKSPACE_LEGACY")"

echo -e "${BLUE}🚀 Cài đặt / Cập nhật Cấu hình IDE — ${PROJECT_NAME}${NC}"
echo "=================================================="
echo ""

# Tạo/Cập nhật cấu hình IDE cơ bản nếu thiếu
echo -e "${BLUE}🛠️  Đồng bộ Cấu hình IDE...${NC}"

mkdir -p .vscode .cursor

COMFORT_TEMPLATE="$SCRIPT_DIR/ide-settings-comfortable.json"

if [ ! -f ".vscode/settings.json" ]; then
    if [ -f "$COMFORT_TEMPLATE" ]; then
        cp "$COMFORT_TEMPLATE" .vscode/settings.json
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/settings.json từ template (font 13, theme, icon)"
    elif [ -f ".cursor/settings.json" ]; then
        cp .cursor/settings.json .vscode/settings.json
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/settings.json từ .cursor/settings.json"
    else
        cat > .vscode/settings.json << 'EOF'
{}
EOF
        echo -e "   ${GREEN}✓${NC} Tạo .vscode/settings.json mặc định"
    fi
fi

if [ ! -f ".cursor/settings.json" ]; then
    if [ -f ".vscode/settings.json" ]; then
        cp .vscode/settings.json .cursor/settings.json
        echo -e "   ${GREEN}✓${NC} Tạo .cursor/settings.json từ .vscode/settings.json"
    elif [ -f "$COMFORT_TEMPLATE" ]; then
        cp "$COMFORT_TEMPLATE" .cursor/settings.json
        echo -e "   ${GREEN}✓${NC} Tạo .cursor/settings.json từ template"
    else
        cp .vscode/settings.json .cursor/settings.json 2>/dev/null || true
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

# Tạo/cập nhật workspace file nếu thiếu
if [ ! -f "$WORKSPACE_PRIMARY" ] && [ ! -f "$WORKSPACE_LEGACY" ]; then
    echo -e "   ${YELLOW}→${NC} Tạo $WORKSPACE_PRIMARY..."
    cat > "$WORKSPACE_PRIMARY" << 'WORKSPACE_EOF'
{
  "folders": [{"name": "main", "path": "."}],
  "settings": {
    "editor.formatOnSave": true,
    "editor.fontSize": 13,
    "editor.fontFamily": "SF Pro Text, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "editor.lineHeight": 22,
    "workbench.colorTheme": "Default Dark+",
    "workbench.iconTheme": "material-icon-theme",
    "terminal.integrated.cwd": "${workspaceFolder}",
    "terminal.integrated.defaultProfile.osx": "zsh",
    "terminal.integrated.fontSize": 13
  },
  "extensions": {"recommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint", "pkief.material-icon-theme"]}
}
WORKSPACE_EOF
    echo -e "   ${GREEN}✓${NC} Đã tạo $WORKSPACE_PRIMARY"
elif [ -f "$WORKSPACE_FILE" ] && ! grep -q '"folders"' "$WORKSPACE_FILE" 2>/dev/null; then
    echo -e "   ${YELLOW}⚠️${NC} $WORKSPACE_FILE thiếu cấu trúc folders - cần tạo lại thủ công"
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

# Danh sách extensions dùng chung cho VS Code và Cursor
EXTENSIONS=(
        "esbenp.prettier-vscode"
        "dbaeumer.vscode-eslint"
        "DavidAnson.vscode-markdownlint"
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

# Cài đặt VS Code Extensions
if command -v code &> /dev/null; then
    echo -e "${BLUE}📦 Cài đặt VS Code Extensions...${NC}"
    INSTALLED_EXTENSIONS=$(code --list-extensions 2>/dev/null || true)
    INSTALLED=0
    SKIPPED=0

    for ext in "${EXTENSIONS[@]}"; do
        if printf '%s\n' "$INSTALLED_EXTENSIONS" | grep -Fxq "$ext"; then
            echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
            SKIPPED=$((SKIPPED + 1))
        else
            echo -e "   ${YELLOW}→${NC} Đang cài $ext..."
            if code --install-extension "$ext" &> /dev/null; then
                echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
                INSTALLED_EXTENSIONS=$(printf '%s\n%s\n' "$INSTALLED_EXTENSIONS" "$ext")
                INSTALLED=$((INSTALLED + 1))
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

# Cài đặt Cursor Extensions (tương tự VS Code)
if command -v cursor &> /dev/null; then
    echo -e "${BLUE}📦 Cài đặt Cursor Extensions...${NC}"
    CURSOR_EXTENSIONS=$(cursor --list-extensions 2>/dev/null || true)
    CURSOR_INSTALLED=0
    CURSOR_SKIPPED=0

    for ext in "${EXTENSIONS[@]}"; do
        if printf '%s\n' "$CURSOR_EXTENSIONS" | grep -Fxq "$ext"; then
            echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
            CURSOR_SKIPPED=$((CURSOR_SKIPPED + 1))
        else
            echo -e "   ${YELLOW}→${NC} Đang cài $ext..."
            if cursor --install-extension "$ext" &> /dev/null; then
                echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
                CURSOR_EXTENSIONS=$(printf '%s\n%s\n' "$CURSOR_EXTENSIONS" "$ext")
                CURSOR_INSTALLED=$((CURSOR_INSTALLED + 1))
            else
                echo -e "   ${RED}✗${NC} $ext (lỗi)"
            fi
        fi
    done

    echo ""
    echo -e "${GREEN}✅ Cursor: Đã cài $CURSOR_INSTALLED, Đã có $CURSOR_SKIPPED extensions${NC}"
    echo ""
fi

# Kiểm tra Python
echo -e "${BLUE}🐍 Kiểm tra Python...${NC}"
# Ưu tiên Python 3.11 (chuẩn project: pydantic, ai-service)
PYTHON_CMD=""
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

if [ -n "$PYTHON_CMD" ]; then
    PYTHON_VERSION=$($PYTHON_CMD --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
    echo "   Path: $(which $PYTHON_CMD)"

    # Chuẩn bị Python env thống nhất tại root .venv
    # Dùng cho: ai-service, one_automation_system, IDE
    echo -e "${BLUE}🧪 Chuẩn bị Python env (.venv tại root)...${NC}"
    VENV_DIR=".venv"
    REQUIREMENTS_DEV="requirements-dev.txt"

    if [ ! -d "$VENV_DIR" ]; then
        echo -e "   ${YELLOW}→${NC} Tạo .venv ($PYTHON_CMD)..."
        $PYTHON_CMD -m venv "$VENV_DIR"
        echo -e "   ${GREEN}✓${NC} Đã tạo .venv"
    else
        echo -e "   ${GREEN}✓${NC} Đã có .venv"
    fi

    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"

    if ! pip install --upgrade pip &> /dev/null; then
        echo -e "   ${YELLOW}⚠️${NC} Không thể nâng cấp pip (tiếp tục)"
    fi

    if [ -f "$REQUIREMENTS_DEV" ]; then
        echo -e "   ${YELLOW}→${NC} Cài dependencies từ $REQUIREMENTS_DEV..."
        if pip install -r "$REQUIREMENTS_DEV" &> /dev/null; then
            echo -e "   ${GREEN}✓${NC} Đã cài requirements-dev"
        else
            echo -e "   ${YELLOW}⚠️${NC} Fallback: cài gói cốt lõi..."
            pip install uvicorn fastapi python-dotenv pandas numpy openpyxl &> /dev/null || true
        fi
    else
        echo -e "   ${YELLOW}→${NC} Fallback: cài gói cốt lõi..."
        pip install uvicorn fastapi python-dotenv pandas numpy openpyxl &> /dev/null || true
    fi

    deactivate 2>/dev/null || true
    echo -e "   ${GREEN}✓${NC} Python env đã sẵn sàng (source .venv/bin/activate)"
else
    echo -e "${RED}✗ Python3 chưa được cài đặt${NC}"
    echo "   Cài đặt: brew install python@3.11  (khuyến nghị 3.11)"
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
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}✗ $file (thiếu)${NC}"
    fi
done

# Workspace: ưu tiên primary, chấp nhận legacy
if [ -f "$WORKSPACE_PRIMARY" ]; then
    echo -e "${GREEN}✅ $WORKSPACE_PRIMARY${NC}"
elif [ -f "$WORKSPACE_LEGACY" ]; then
    echo -e "${GREEN}✅ $WORKSPACE_LEGACY${NC}"
else
    echo -e "${RED}✗ Workspace file (thiếu)${NC}"
fi

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
echo -e "${CYAN}🐍 Python/venv:${NC} Dùng .venv thống nhất tại root."
echo "   Kích hoạt: source .venv/bin/activate  hoặc  source scripts/activate-venv.sh"
echo ""
