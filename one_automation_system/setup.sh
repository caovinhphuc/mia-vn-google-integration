#!/bin/bash
# Dừng ngay nếu pip/npm lỗi (tránh in "✅ dependencies" khi numpy build fail trên Python 3.14).
set -euo pipefail

echo "=== ONE Automation System - Production Setup ==="
echo "Thiết lập hệ thống tự động hóa ONE cho môi trường production"

# Kiểm tra Python (tránh mặc định python3 = 3.14 trên PATH khi tạo venv)
echo "Kiểm tra Python..."
PY="${PYTHON_BIN:-}"
if [ -z "$PY" ]; then
    # Cùng chuẩn repo (.python-version = 3.11): ưu tiên 3.11 trước 3.12
    for c in python3.11 python3.12 python3.13 python3; do
        if command -v "$c" &>/dev/null; then
            _c="$(command -v "$c")"
            if "$_c" -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
                PY="$_c"
                break
            fi
        fi
    done
fi
if [ -z "$PY" ] || ! command -v "$PY" &>/dev/null; then
    echo "❌ Cần Python < 3.14 (khuyến nghị 3.11, giống ai-service / CI). Cài: brew install python@3.11"
    echo "   Hoặc: PYTHON_BIN=/opt/homebrew/opt/python@3.11/bin/python3.11 bash setup.sh"
    exit 1
fi

echo "✅ Dùng Python: $($PY --version) ($PY)"

# Nếu venv cũ tạo bằng 3.14 — pip sẽ fail build numpy; bắt buộc xoá và tạo lại bằng PY ở trên
if [ -d "venv" ]; then
    if ! venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' 2>/dev/null; then
        echo "❌ Thư mục venv/ đang dùng Python ≥3.14 (numpy/scipy thường không build được)."
        echo "   Chạy lại sau khi xoá venv và dùng Python 3.11:"
        echo "   rm -rf venv && PYTHON_BIN=\"$PY\" bash setup.sh"
        exit 1
    fi
fi

# Kiểm tra Node.js
echo "Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được tìm thấy. Vui lòng cài đặt Node.js."
    exit 1
fi

echo "✅ Node.js đã được cài đặt: $(node --version)"

# Tạo virtual environment cho Python
echo "Tạo Python virtual environment..."
if [ ! -d "venv" ]; then
    "$PY" -m venv venv
    echo "✅ Virtual environment đã được tạo"
else
    echo "✅ Virtual environment đã tồn tại"
fi

# Kích hoạt virtual environment
echo "Kích hoạt virtual environment..."
# shellcheck source=/dev/null
source venv/bin/activate

# Cài đặt Python dependencies
echo "Cài đặt Python dependencies..."
python -m pip install --upgrade pip
if ! python -m pip install -r requirements.txt; then
    echo "❌ pip install -r requirements.txt thất bại."
    echo "   Thường gặp khi dùng Python 3.14: rm -rf venv && PYTHON_BIN=\"$PY\" bash setup.sh"
    exit 1
fi
echo "✅ Python dependencies đã được cài đặt"

# Kiểm tra và cài đặt Node dependencies nếu cần
echo "Kiểm tra Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Cài đặt Node.js dependencies..."
    npm install || {
        echo "❌ npm install thất bại trong one_automation_system/"
        exit 1
    }
    echo "✅ Node.js dependencies đã được cài đặt"
else
    echo "✅ Node.js dependencies đã tồn tại"
fi

# Tạo file .env từ template
echo "Thiết lập file cấu hình..."
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ File .env đã được tạo từ template"
        echo "⚠️  VUI LÒNG CẬP NHẬT THÔNG TIN ĐĂNG NHẬP TRONG FILE .env"
    else
        echo "❌ File .env.template không tồn tại"
    fi
else
    echo "✅ File .env đã tồn tại"
fi

# Tạo các thư mục cần thiết
echo "Tạo các thư mục cần thiết..."
mkdir -p logs
mkdir -p data
mkdir -p exports
echo "✅ Các thư mục đã được tạo"

# Kiểm tra cấu hình
echo "Kiểm tra cấu hình..."
if [ -f "config/config.json" ]; then
    echo "✅ File config.json đã tồn tại"
else
    echo "❌ File config/config.json không tồn tại"
fi

# Kiểm tra automation files
echo "Kiểm tra automation files..."
if [ -f "automation.py" ]; then
    echo "✅ automation.py đã tồn tại"
else
    echo "❌ automation.py không tồn tại"
fi

if [ -f "automation_bridge.py" ]; then
    echo "✅ automation_bridge.py đã tồn tại"
else
    echo "❌ automation_bridge.py không tồn tại"
fi

echo ""
echo "=== SETUP HOÀN TẤT ==="
echo ""
echo "📋 BƯỚC TIẾP THEO:"
echo "1. Cập nhật thông tin đăng nhập trong file .env:"
echo "   - ONE_USERNAME=your_username"
echo "   - ONE_PASSWORD=your_password"
echo "   - LOGIN_URL=your_login_url"
echo ""
echo "2. Khởi động hệ thống:"
echo "   Backend: ./start_backend.sh"
echo "   Frontend: npm start"
echo ""
echo "3. Test automation:"
echo "   source venv/bin/activate"
echo "   python automation.py"
echo ""
echo "⚠️  QUAN TRỌNG: Đây là môi trường PRODUCTION - không có demo mode!"
echo "   Hệ thống sẽ kết nối trực tiếp với hệ thống ONE thật."
echo ""
echo "✅ Hệ thống đã sẵn sàng cho production!"
