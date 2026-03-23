# Cấu hình tích hợp — Sheets, Drive, Telegram, Email

Hướng dẫn đảm bảo tất cả integration hoạt động đúng.

---

## 0. Luồng dữ liệu tồn kho (Inventory)

**Bước 1 — Lấy dữ liệu từ ONE:**

```bash
cd automation
source venv/bin/activate
python Inventory.py
# Output: data/inventory_YYYYMMDD_HHMMSS.csv
```

**Bước 2 — (Tuỳ chọn) Push lên Sheets:** Dùng `services/google_sheets_service.py` → `write_data('Inventory!A1', rows)` hoặc script riêng. Xem [INVENTORY_ANALYSIS.md](INVENTORY_ANALYSIS.md).

**Yêu cầu:** `ONE_USERNAME`, `ONE_PASSWORD` trong `.env`; `inventory_url` trong `config/config.json`.

---

## 1. Kiểm tra nhanh

```bash
cd automation
source venv/bin/activate
python verify_integrations.py
```

Script kiểm tra: **Sheets**, **Drive**, **Telegram**, **Email**.

---

## 2. Google Sheets

| Biến                          | Mô tả                                     |
| ----------------------------- | ----------------------------------------- |
| `GOOGLE_SHEET_ID`             | ID spreadsheet (từ URL `.../d/{ID}/edit`) |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Đường dẫn JSON service account            |

**Cấu hình:**

1. Tạo service account trên Google Cloud Console
2. Tải JSON, lưu `config/service_account.json`
3. Chia sẻ spreadsheet với email service account (quyền Editor)
4. Tạo tab **Config** (Section, Key, Value) — xem `modules/google_sheets_config.py` → `create_sample_sheets()`

---

## 3. Google Drive

| Biến                          | Mô tả                                          |
| ----------------------------- | ---------------------------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Dùng chung với Sheets                          |
| `GOOGLE_DRIVE_FOLDER_ID`      | (Optional) Folder upload/list; bỏ trống = root |

**Cấu hình:**

1. Dùng chung credentials với Sheets
2. Chia sẻ folder Drive (nếu dùng) với email service account
3. Service: `services/google_drive_service.py` — `list_files()`, `upload_file()`

---

## 4. Telegram

| Biến                 | Mô tả                        |
| -------------------- | ---------------------------- |
| `TELEGRAM_BOT_TOKEN` | Token từ @BotFather          |
| `TELEGRAM_CHAT_ID`   | Chat/group ID nhận thông báo |

**Cấu hình:**

1. Tạo bot: gửi `/newbot` cho @BotFather
2. Lấy Chat ID: gửi tin nhắn cho bot, mở `https://api.telegram.org/bot{TOKEN}/getUpdates`
3. Gửi test: `from notifier import send_telegram; send_telegram("Test")`

---

## 5. Email (SMTP)

| Biến                               | Mô tả                                         |
| ---------------------------------- | --------------------------------------------- |
| `SMTP_HOST`                        | smtp.gmail.com (mặc định)                     |
| `SMTP_PORT`                        | 587                                           |
| `SMTP_USER` / `EMAIL_ADDRESS`      | Email gửi                                     |
| `SMTP_PASSWORD` / `EMAIL_PASSWORD` | App password (Gmail: bật 2FA → App passwords) |

**Cấu hình Gmail:**

1. Bật 2-Step Verification
2. Tạo App password
3. Đặt `SMTP_USER` = email, `SMTP_PASSWORD` = app password

**Gửi test:**

```python
from notifier import send_email
send_email("Test", "<p>OK</p>", ["recipient@example.com"])
```

---

## 6. File tham chiếu

| File                                | Mục đích                 |
| ----------------------------------- | ------------------------ |
| `Inventory.py`                      | Lấy tồn kho từ ONE → CSV |
| `verify_integrations.py`            | Kiểm tra tất cả          |
| `services/google_sheets_service.py` | Sheets API (read/write)  |
| `services/google_drive_service.py`  | Drive API                |
| `services/email_service.py`         | SMTP (main.py)           |
| `notifier.py`                       | Email + Telegram (sync)  |
| `modules/google_sheets_config.py`   | Sheets config            |

---

## 7. Lỗi thường gặp

| Lỗi                             | Xử lý                                            |
| ------------------------------- | ------------------------------------------------ |
| Sheets: 403 / Permission denied | Chia sẻ sheet với service account email          |
| Drive: 404                      | Kiểm tra folder ID, chia sẻ folder               |
| Telegram: 401                   | Token sai                                        |
| Email: Authentication failed    | Dùng App password, không dùng mật khẩu đăng nhập |
