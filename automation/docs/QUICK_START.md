# ⚡ Quick Start — Automation (5 phút)

## 1. Cài đặt

```bash
cd automation
./setup-and-seed.sh
```

Script sẽ: tạo venv, cài dependencies, tạo dữ liệu mẫu, chạy system_check và verify_integrations.

## 2. Cấu hình .env

```bash
cp .env.example .env
# Chỉnh: ONE_USERNAME, ONE_PASSWORD, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_FILE
# Tuỳ chọn: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_USER, SMTP_PASSWORD
```

## 3. Kiểm tra kết nối

```bash
source venv/bin/activate
python verify_integrations.py    # Sheets, Drive, Telegram, Email
python test_sheets_connection.py # Chi tiết Sheets
python system_check.py           # Dependencies
```

## 4. Chạy automation

```bash
source venv/bin/activate
python automation.py             # Core Selenium
# hoặc
python automation_enhanced.py    # Có SLA, product details
# hoặc
python one_automation.py         # Pipeline fresh session
```

## 5. Menu tương tác

```bash
./start.sh
```

Chọn: Setup, Test, Chạy automation, Xem data, Dashboard, Health check.

---

**Lưu ý:** Automation cần Chrome + đăng nhập ONE. Nếu chỉ cần kiểm tra tích hợp, chạy `verify_integrations.py`.
