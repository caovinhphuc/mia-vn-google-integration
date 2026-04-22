#!/usr/bin/env python3
"""
Kiểm tra kết nối: Sheets, Drive, Telegram, Email
Chạy: cd automation && python verify_integrations.py
"""
import os
import sys

# Load .env
try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

# Add path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "modules"))

OK = "✅"
FAIL = "❌"
WARN = "⚠️"


def check_sheets():
    print("\n📊 1. GOOGLE SHEETS")
    print("-" * 50)
    try:
        from modules.google_sheets_config import GoogleSheetsConfigService

        svc = GoogleSheetsConfigService()
        if not svc.client:
            print(f"   {FAIL} Không kết nối được (kiểm tra credentials + chia sẻ sheet)")
            return False
        config = svc.get_sheets_config()
        print(f"   {OK} Đã kết nối: {svc.spreadsheet_id[:20]}...")
        print(f"   Tab Config: {len(config)} entries" if config else f"   {WARN} Tab Config trống hoặc chưa có")
        return True
    except ImportError as e:
        print(f"   {FAIL} Import lỗi: {e}")
        print("   pip install gspread google-auth google-api-python-client")
        return False
    except Exception as e:
        print(f"   {FAIL} {e}")
        return False


def check_drive():
    print("\n📁 2. GOOGLE DRIVE")
    print("-" * 50)
    try:
        from services.google_drive_service import GoogleDriveService

        svc = GoogleDriveService()
        if not svc.is_configured():
            print(f"   {FAIL} Chưa cấu hình (GOOGLE_SERVICE_ACCOUNT_FILE, credentials)")
            return False
        files = svc.list_files(page_size=5)
        print(f"   {OK} Đã kết nối Drive")
        print(f"   List files (sample): {len(files)} files" + (f" — folder: {svc.folder_id[:20]}..." if svc.folder_id else " (root)"))
        return True
    except ImportError as e:
        print(f"   {FAIL} Import lỗi: {e}")
        return False
    except Exception as e:
        print(f"   {FAIL} {e}")
        return False


def check_telegram():
    print("\n📱 3. TELEGRAM")
    print("-" * 50)
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat:
        print(f"   {FAIL} Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env")
        return False
    try:
        import requests

        r = requests.post(
            f"https://api.telegram.org/bot{token}/getMe",
            timeout=5,
        )
        if r.status_code == 200 and r.json().get("ok"):
            print(f"   {OK} Bot OK: @{r.json().get('result', {}).get('username', '?')}")
        else:
            print(f"   {FAIL} Token không hợp lệ")
            return False
        # Gửi test (optional - có thể comment để tránh spam)
        # r2 = requests.post(f"https://api.telegram.org/bot{token}/sendMessage", json={"chat_id": chat, "text": "🔧 [Automation] verify_integrations test OK"}, timeout=5)
        return True
    except Exception as e:
        print(f"   {FAIL} {e}")
        return False


def check_email():
    print("\n📧 4. EMAIL (SMTP / Gmail App Password)")
    print("-" * 50)
    user = (
        os.getenv("SMTP_USER")
        or os.getenv("EMAIL_ADDRESS")
        or os.getenv("EMAIL_USERNAME")
        or os.getenv("GMAIL_USER")
    )
    pwd = (
        os.getenv("SMTP_PASS")
        or os.getenv("SMTP_PASSWORD")
        or os.getenv("EMAIL_PASSWORD")
        or os.getenv("EMAIL_APP_PASSWORD")
        or os.getenv("GMAIL_APP_PASSWORD")
    )
    if not user or not pwd:
        print(f"   {FAIL} Thiếu user + password gửi mail.")
        print(
            "   Gmail App Password: SMTP_USER + SMTP_PASS, hoặc GMAIL_USER + GMAIL_APP_PASSWORD, "
            "hoặc SMTP_PASSWORD / EMAIL_APP_PASSWORD"
        )
        return False
    print(f"   {OK} Cấu hình sẵn sàng ({user[:3]}***)")
    print("   (Không gửi thật — test gửi: dùng notifier.send_email)")
    return True


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║           VERIFY INTEGRATIONS — Sheets, Drive,          ║")
    print("║                    Telegram, Email                      ║")
    print("╚══════════════════════════════════════════════════════════╝")

    results = {
        "Sheets": check_sheets(),
        "Drive": check_drive(),
        "Telegram": check_telegram(),
        "Email": check_email(),
    }

    print("\n" + "=" * 50)
    total = len(results)
    ok = sum(1 for v in results.values() if v)
    for k, v in results.items():
        print(f"   {OK if v else FAIL} {k}")
    print(f"\n   Kết quả: {ok}/{total} integrations OK")
    if ok < total:
        print("\n   📝 Xem .env.example và INTEGRATIONS_SETUP.md để cấu hình.")
    return 0 if ok == total else 1


if __name__ == "__main__":
    sys.exit(main())
