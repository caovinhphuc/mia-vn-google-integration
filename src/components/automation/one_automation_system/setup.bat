@echo off
echo 🚀 Thiết lập ONE Automation System...

REM Tạo virtual environment
echo 📦 Tạo virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

REM Cài đặt dependencies
echo 📥 Cài đặt dependencies...
pip install -r requirements.txt

REM Tạo file .env từ template
if not exist .env (
    echo 📝 Tạo file .env...
    copy .env.template .env
    echo ⚠️  Vui lòng chỉnh sửa file .env với thông tin thực tế
) else (
    echo ✅ File .env đã tồn tại
)

REM Tạo thư mục cần thiết
mkdir logs 2>nul
mkdir data 2>nul
mkdir reports 2>nul

echo ✅ Thiết lập hoàn tất!
echo.
echo 📋 Các bước tiếp theo:
echo 1. Chỉnh sửa file .env với thông tin đăng nhập
echo 2. Chỉnh sửa config/config.json nếu cần
echo 3. Chạy: python automation.py --run-once (chạy một lần)
echo 4. Chạy: python automation.py --schedule (chạy theo lịch)
pause
