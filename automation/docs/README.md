# 📚 Automation — Tài liệu

Thư mục chứa tài liệu cho **automation/** (ONE + Google Sheets + Drive + Telegram + Email).

---

## 🗂️ Mục lục tài liệu

| File                                                                             | Mô tả                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------- |
| [README.md](README.md)                                                           | Trang này — index docs                   |
| [INDEX.md](INDEX.md)                                                             | Danh sách đầy đủ mọi tài liệu trong repo |
| [Google_Sheets_Integration_Checklist.md](Google_Sheets_Integration_Checklist.md) | Checklist triển khai Google Sheets       |
| [QUICK_START.md](QUICK_START.md)                                                 | Cài đặt + chạy nhanh trong 5 phút        |

---

## 📂 Tài liệu khác (ngoài `docs/`)

| File                      | Vị trí                  | Mô tả                          |
| ------------------------- | ----------------------- | ------------------------------ |
| AUTOMATION_PYTHON_GUIDE   | `Document/` (root repo) | Cài đặt, tra cứu script Python |
| INTEGRATIONS_SETUP        | `automation/`           | Sheets, Drive, Telegram, Email |
| INVENTORY_ANALYSIS        | `automation/`           | Inventory.py — tồn kho từ ONE  |
| GOOGLE_SHEETS_SETUP_GUIDE | `automation/`           | Hướng dẫn chi tiết Sheets      |
| scripts/README            | `automation/scripts/`   | Các script trong scripts/      |

---

## 🚀 Bắt đầu nhanh

```bash
cd automation
./setup-and-seed.sh                    # Cài đặt + dữ liệu mẫu
python verify_integrations.py          # Kiểm tra Sheets, Drive, Telegram, Email
python automation.py                   # Chạy automation (cần login ONE)
```

---

## 🔗 Cấu trúc thực tế

- **ONE (Selenium)** → scrape đơn hàng
- **Google Sheets** → config, SLA, logs, export
- **Google Drive** → upload file (optional)
- **Telegram** → thông báo (notifier.send_telegram)
- **Email** → SMTP (notifier.send_email, services/email_service)

Xem [INTEGRATIONS_SETUP.md](../INTEGRATIONS_SETUP.md) để cấu hình từng dịch vụ.
