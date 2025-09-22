#!/bin/bash
# Setup script for ONE Automation System

echo "🚀 Thiết lập ONE Automation System..."

# Tạo virtual environment
echo "📦 Tạo virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Cài đặt dependencies
echo "📥 Cài đặt dependencies..."
pip install -r requirements.txt

# Tạo file .env từ template
if [ ! -f .env ]; then
    echo "📝 Tạo file .env..."
    cp .env.template .env
    echo "⚠️  Vui lòng chỉnh sửa file .env với thông tin thực tế"
else
    echo "✅ File .env đã tồn tại"
fi

# Tạo thư mục cần thiết
mkdir -p logs data reports

echo "✅ Thiết lập hoàn tất!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Chỉnh sửa file .env với thông tin đăng nhập"
echo "2. Chỉnh sửa config/config.json nếu cần"
echo "3. Chạy: python automation.py --run-once (chạy một lần)"
echo "4. Chạy: python automation.py --schedule (chạy theo lịch)"
